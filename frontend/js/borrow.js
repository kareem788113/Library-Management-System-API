/* Borrowing history and return actions */
const Borrow = (() => {
  function normalizeList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.history)) return data.history;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  }

  function row(item, isAdmin = false) {
    const book = item.book || item;
    const bookId = item.book_id || book.id;
    const returned = Boolean(item.returned ||
      item.returned_at ||
      item.return_date ||
      item.is_returned);
      
    return `
      <tr>
        ${isAdmin ? `<td>${UI.escapeHTML(item.user?.username || item.username || item.user_id || "N/A")}</td>` : ""}
        <td>${UI.escapeHTML(book.title || item.title || `Book #${bookId}`)}</td>
        <td>${UI.escapeHTML(book.author || item.author || "N/A")}</td>
        <td>${UI.escapeHTML(item.borrowed_at || item.borrow_date || "N/A")}</td>
        <td>${returned ? "Returned": "Not returned"} </td>
        <td><span class="badge ${returned ? "success" : "warning"}">${returned ? "Returned" : "Borrowed"}</span></td>
        <td>${!returned && !isAdmin ? `<button class="btn btn-sm btn-success" data-return="${bookId}">Return</button>` : "-"}</td>
      </tr>`;
  }

  async function renderMyHistory() {
    const container = UI.qs("#borrow-history");
    if (!container) return;
    container.innerHTML = UI.loading("Loading borrowing history...");
    try {
      const data = normalizeList(await AppAPI.borrow.myHistory());
      if (!data.length) return (container.innerHTML = UI.empty("You have no borrowing history yet."));
      container.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Book</th><th>Author</th><th>Borrowed At</th><th>Returned At</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${data.map((item) => row(item, false)).join("")}</tbody>
          </table>
        </div>`;
      setupReturnButtons();
    } catch (error) {
      container.innerHTML = UI.alertBox(error.message, "error");
    }
  }

  async function renderAllHistory() {
    const container = UI.qs("#all-borrow-history");
    if (!container) return;
    container.innerHTML = UI.loading("Loading all borrowing history...");
    try {
      const data = normalizeList(await AppAPI.borrow.allHistory());
      if (!data.length) return (container.innerHTML = UI.empty("No borrowing records found."));
      container.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Book</th><th>Author</th><th>Borrowed At</th><th>Returned At</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${data.map((item) => row(item, true)).join("")}</tbody>
          </table>
        </div>`;
    } catch (error) {
      container.innerHTML = UI.alertBox(error.message, "error");
    }
  }

  function setupReturnButtons() {
    UI.qsa("[data-return]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          btn.disabled = true;
          await AppAPI.borrow.returnBook(btn.dataset.return);
          UI.toast("Book returned successfully", "success");
          renderMyHistory();
        } catch (error) {
          UI.toast(error.message, "error");
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function init() {
    renderMyHistory();
    renderAllHistory();
  }

  return { init, renderMyHistory, renderAllHistory };
})();

document.addEventListener("DOMContentLoaded", Borrow.init);
