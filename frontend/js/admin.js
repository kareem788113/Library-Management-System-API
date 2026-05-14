/* Admin dashboard */
window.Admin = (() => {
  function normalizeList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  async function renderAdminBooks() {
    const container = UI.qs("#admin-books");
    if (!container) return;
    container.innerHTML = UI.loading("Loading admin books...");

    try {
      const books = normalizeList(await AppAPI.books.all());
      if (!books.length) return (container.innerHTML = UI.empty("No books found."));
      container.innerHTML = `
        <div class="toolbar">
          <a href="add-book.html" class="btn btn-primary">+ Add Book</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Copies</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${books.map((book) => {
                const deleted = !book.is_active;
                return `
                  <tr>
                    <td>${UI.escapeHTML(book.id)}</td>
                    <td>${UI.escapeHTML(book.title)}</td>
                    <td>${UI.escapeHTML(book.author)}</td>
                    <td>${UI.escapeHTML(book.available_copies ?? 0)}</td>
                    <td><span class="badge ${deleted ? "danger" : "success"}">${deleted ? "Deleted" : "Active"}</span></td>
                   <td>
                        <div class="btn-group">

                          <a class="btn btn-sm btn-warning"
                            href="edit-book.html?id=${book.id}">
                            Edit
                          </a>

                          <button
                            class="btn btn-sm ${deleted ? "btn-success" : "btn-secondary"}"
                            onclick="Admin.toggleBookStatus(${book.id}, ${deleted})"
                          >
                            ${deleted ? "Activate" : "Deactivate"}
                          </button>

                          <button
                            class="btn btn-sm btn-danger"
                            onclick="Admin.hardDeleteBook(${book.id})"
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`;
    } catch (error) {
      container.innerHTML = UI.alertBox(error.message, "error");
    }
  }

  async function renderAdminStats() {
    const container = UI.qs("#admin-stats");
    if (!container) return;
    try {
      const books = normalizeList(await AppAPI.books.all());
      const total = books.length;
      const deleted = books.filter((b) => b.is_deleted || b.deleted).length;
      const available = books.reduce((sum, b) => sum + Number(b.available_copies || 0), 0);
      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><span class="stat-number">${total}</span><span class="stat-label">Total Books</span></div>
          <div class="stat-card"><span class="stat-number">${available}</span><span class="stat-label">Available Copies</span></div>
          <div class="stat-card"><span class="stat-number">${deleted}</span><span class="stat-label">Deleted Books</span></div>
        </div>`;
    } catch {
      container.innerHTML = "";
    }
  }

  async function toggleBookStatus(bookId, isDeleted) {

    const endpoint = isDeleted
        ? `/books/restore/${bookId}`
        : `/books/${bookId}`;

    const method = isDeleted ? "PUT" : "DELETE";

    const token = AppAPI.getToken();

    const res = await fetch(`${AppAPI.BASE_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.ok) {
      UI.toast("Book status updated", "success");
      renderAdminBooks();
      renderAdminStats();
    } else {
        UI.toast("Delete failed", "error");
    }
}

async function hardDeleteBook(bookId) {

    const token = AppAPI.getToken();

    const res = await fetch(
        `${AppAPI.BASE_URL}/books/hard-delete/${bookId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (res.ok) {
      UI.toast("Book deleted permanently", "success");
      renderAdminBooks();
      renderAdminStats();
    } else {
      UI.toast("Failed to update status", "error");
    }
}

async function renderAllBorrowHistory() {

  const container = document.querySelector("#admin-borrow-history");

  if (!container) return;

  try {

    const records = await AppAPI.borrow.allHistory();

    if (!records.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Results</h3>
          <p>No borrowing records found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Book</th>
            <th>Borrowed At</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${records.map(record => `
            <tr>
              <td>${record.username}</td>
              <td>${record.book_title}</td>
              <td>${new Date(record.borrowed_at).toLocaleString()}</td>
              <td>
                <span class="badge ${
                  record.returned
                    ? "success"
                    : "warning"
                }">
                  ${record.returned ? "Returned" : "Borrowed"}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

  } catch (error) {

    container.innerHTML = `
      <div class="empty-state">
        <h3>Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}
  function init() {
    renderAdminStats();
    renderAdminBooks();
    renderAllBorrowHistory();
  }

  return {
    init,
    renderAdminBooks,
    toggleBookStatus,
    hardDeleteBook
  };

})();

document.addEventListener("DOMContentLoaded", Admin.init);
