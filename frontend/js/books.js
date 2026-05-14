/* Books pages: list, details, add, edit */
const Books = (() => {
  let allBooks = [];

  function getBookIdFromUrl() {
    return new URLSearchParams(location.search).get("id");
  }

  function bookCard(book, user) {
    const copies = Number(book.available_copies ?? book.copies ?? 0);
    const deleted = !book.is_active;
    const admin = Auth.isAdmin(user);
    return `
      <article class="card book-card hoverable">
        <div>
          <div class="book-title">${UI.escapeHTML(book.title)}</div>
          <div class="book-author">by ${UI.escapeHTML(book.author)}</div>
          <div class="book-meta">
            <span class="badge ${copies > 0 ? "success" : "danger"}">${copies > 0 ? `${copies} available` : "Unavailable"}</span>
            ${deleted ? `<span class="badge danger">Deleted</span>` : ""}
          </div>
        </div>
        <div class="btn-group mt-2">
          <a class="btn btn-sm btn-outline" href="book-details.html?id=${book.id}">Details</a>
          ${AppAPI.isLoggedIn() && !deleted && copies > 0 ? `<button class="btn btn-sm btn-primary" data-borrow="${book.id}">Borrow</button>` : ""}
          ${admin ? `<a class="btn btn-sm btn-warning" href="edit-book.html?id=${book.id}">Edit</a>` : ""}
          ${admin ? `<button class="btn btn-sm ${deleted ? "btn-success" : "btn-warning"}"data-toggle="${book.id}">${deleted ? "Activate" : "Deactivate"}</button>
  <button 
    class="btn btn-sm btn-danger"
    data-delete="${book.id}">
    Delete
  </button>
` : ""}
        </div>
      </article>`;
  }

  async function fetchBooks() {
    const user = AppAPI.getStoredUser() || (AppAPI.isLoggedIn() ? await Auth.loadMe() : null);
    const addBookContainer = UI.qs("#admin-add-book");
    if (addBookContainer) {
      addBookContainer.innerHTML = Auth.isAdmin(user)
        ? `<a href="add-book.html" class="btn">Add New Book</a>`
        : "";
    }
    if (Auth.isAdmin(user)) {
      try { return await AppAPI.books.all(); } catch { return await AppAPI.books.available(); }
    }
    return await AppAPI.books.available();
  }

  function normalizeList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  async function renderBooks() {
    const container = UI.qs("#books-list");
    if (!container) return;
    container.innerHTML = UI.loading("Loading books...");

    try {
      const user = AppAPI.getStoredUser() || (AppAPI.isLoggedIn() ? await Auth.loadMe() : null);
      allBooks = normalizeList(await fetchBooks()).filter((book) => {
        const copies = Number(book.available_copies ?? 0);
        const deleted = !book.is_active;
      
        if (Auth.isAdmin(user)) {
          return copies > 0;
        }
      
        return copies > 0 && !deleted;
      });
      
      renderBooksList(allBooks, user);
      setupSearch(user);
    } catch (error) {
      container.innerHTML = UI.alertBox(error.message, "error");
    }
  }

  function renderBooksList(books, user) {
    const container = UI.qs("#books-list");
    if (!container) return;
    if (!books.length) {
      container.innerHTML = UI.empty("No books found from the API.");
      return;
    }
    container.innerHTML = `<div class="grid grid-3">${books.map((book) => bookCard(book, user)).join("")}</div>`;
    setupBookActions();
  }

  function setupSearch(user) {
    const input = UI.qs("#book-search");
    if (!input) return;
    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      const filtered = allBooks.filter((b) =>
        `${b.title || ""} ${b.author || ""}`.toLowerCase().includes(term)
      );
      renderBooksList(filtered, user);
    });
  }

  function setupBookActions() {
    UI.qsa("[data-borrow]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!AppAPI.isLoggedIn()) return (location.href = "login.html?next=books.html");
        try {
          btn.disabled = true;
          await AppAPI.borrow.borrowBook(btn.dataset.borrow);
          UI.toast("Book borrowed successfully", "success");
          renderBooks();
        } catch (error) {
          UI.toast(error.message, "error");
        } finally {
          btn.disabled = false;
        }
      });
    });

    UI.qsa("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const id = btn.dataset.toggle;
    
          if (btn.textContent.includes("Deactivate")) {
            await AppAPI.books.remove(id);
            UI.toast("Book deactivated", "success");
          } else {
            await AppAPI.books.restore(id);
            UI.toast("Book activated", "success");
          }
    
          renderBooks();
        } catch (error) {
          UI.toast(error.message, "error");
        }
      });
    });

    UI.qsa("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this book?")) return;
        try {
          await AppAPI.books.hardDelete(btn.dataset.delete);
          UI.toast("Book deleted", "success");
          renderBooks();
        } catch (error) { UI.toast(error.message, "error"); }
      });
    });

    UI.qsa("[data-restore]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await AppAPI.books.restore(btn.dataset.restore);
          UI.toast("Book restored", "success");
          renderBooks();
        } catch (error) { UI.toast(error.message, "error"); }
      });
    });
  }

  async function renderBookDetails() {
    const container = UI.qs("#book-details");
    if (!container) return;
    container.innerHTML = UI.loading("Loading book details...");
    const id = getBookIdFromUrl();
    if (!id) return (container.innerHTML = UI.alertBox("Missing book ID", "error"));

    try {
      const data = normalizeList(await fetchBooks());
      const book = data.find((b) => String(b.id) === String(id));
      if (!book) return (container.innerHTML = UI.empty("Book not found."));
      const copies = Number(book.available_copies ?? 0);
      container.innerHTML = `
        <div class="card">
          <h1>${UI.escapeHTML(book.title)}</h1>
          <p class="lead">by ${UI.escapeHTML(book.author)}</p>
          <p><span class="badge ${copies > 0 ? "success" : "danger"}">${copies} available copies</span></p>
          <div class="btn-group mt-3">
            <a class="btn btn-outline" href="books.html">Back to Books</a>
            ${AppAPI.isLoggedIn() && copies > 0 ? `<button class="btn btn-primary" data-borrow="${book.id}">Borrow Book</button>` : ""}
          </div>
        </div>`;
      setupBookActions();
    } catch (error) {
      container.innerHTML = UI.alertBox(error.message, "error");
    }
  }

  function setupAddBook() {
    const form = UI.qs("#add-book-form");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        title: form.title.value.trim(),
        author: form.author.value.trim(),
        available_copies: Number(form.available_copies.value),
      };
      if (!payload.title || !payload.author || payload.available_copies < 0) {
        return UI.toast("Please enter valid book data", "warning");
      }
      try {
        await AppAPI.books.create(payload);
        UI.toast("Book added successfully", "success");
        setTimeout(() => (location.href = "admin-dashboard.html"), 700);
      } catch (error) { UI.toast(error.message, "error"); }
    });
  }

  async function setupEditBook() {
    const form = UI.qs("#edit-book-form");
    if (!form) return;
    const id = getBookIdFromUrl();
    if (!id) return UI.toast("Missing book ID", "error");

    try {
      const data = normalizeList(await AppAPI.books.all());
      const book = data.find((b) => String(b.id) === String(id));
      if (!book) return UI.toast("Book not found", "error");
      form.title.value = book.title || "";
      form.author.value = book.author || "";
      form.available_copies.value = book.available_copies ?? 0;
    } catch (error) { UI.toast(error.message, "error"); }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        title: form.title.value.trim(),
        author: form.author.value.trim(),
        available_copies: Number(form.available_copies.value),
      };
      try {
        await AppAPI.books.update(id, payload);
        UI.toast("Book updated successfully", "success");
        setTimeout(() => (location.href = "admin-dashboard.html"), 700);
      } catch (error) { UI.toast(error.message, "error"); }
    });
  }

  function init() {
    renderBooks();
    renderBookDetails();
    setupAddBook();
    setupEditBook();
  }

  return { init, renderBooks };
})();

document.addEventListener("DOMContentLoaded", Books.init);
