/* Authentication and protected routes */
const Auth = (() => {
  const protectedPages = [
    "dashboard.html",
    "profile.html",
    "borrow-history.html",
    "add-book.html",
    "edit-book.html",
    "admin-dashboard.html",
  ];

  const adminPages = ["add-book.html", "edit-book.html", "admin-dashboard.html"];

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function isAdmin(user) {
    return user?.role === "admin" || user?.is_admin === true;
  }

  async function loadMe() {
    if (!AppAPI.isLoggedIn()) return null;
    try {
      const user = await AppAPI.auth.me();
      AppAPI.setUser(user);
      UI.updateNavbar();
      return user;
    } catch (error) {
      AppAPI.clearToken();
      return null;
    }
  }

  async function requireAuth() {
    const page = currentPage();
    if (!protectedPages.includes(page)) return;

    if (!AppAPI.isLoggedIn()) {
      location.href = `login.html?next=${encodeURIComponent(page)}`;
      return;
    }

    const user = await loadMe();
    if (!user) {
      location.href = "login.html";
      return;
    }

    if (adminPages.includes(page) && !isAdmin(user)) {
      UI.toast("Admin access only", "error");
      setTimeout(() => (location.href = "dashboard.html"), 700);
    }
  }

  function setupLoginForm() {
    const form = UI.qs("#login-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const btn = form.querySelector("button[type='submit']");
      const username = form.username.value.trim();
      const password = form.password.value;

      if (!username || !password) return UI.toast("Please enter username and password", "warning");

      try {
        btn.disabled = true;
        btn.textContent = "Logging in...";
        const data = await AppAPI.auth.login({ username, password });
        AppAPI.setToken(data.access_token);
        await loadMe();
        UI.toast("Login successful", "success");
        const params = new URLSearchParams(location.search);
        location.href = params.get("next") || "dashboard.html";
      } catch (error) {
        UI.toast(error.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
  }

  function setupRegisterForm() {
    const form = UI.qs("#register-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const btn = form.querySelector("button[type='submit']");
      const username = form.username.value.trim();
      const password = form.password.value;
      const confirmPassword = form.confirm_password?.value;

      if (!username || !password) return UI.toast("Please complete all fields", "warning");
      if (confirmPassword !== undefined && password !== confirmPassword) {
        return UI.toast("Passwords do not match", "warning");
      }

      try {
        btn.disabled = true;
        btn.textContent = "Creating account...";
        await AppAPI.auth.register({ username, password });
        UI.toast("Account created. Please login.", "success");
        setTimeout(() => (location.href = "login.html"), 900);
      } catch (error) {
        UI.toast(error.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Create Account";
      }
    });
  }

  async function renderProfile() {
    const container = UI.qs("#profile-content");
    if (!container) return;
    container.innerHTML = UI.loading("Loading profile...");
    const user = await loadMe();
    if (!user) return;
    container.innerHTML = `
      <div class="card">
        <h2>${UI.escapeHTML(user.username || "User")}</h2>
        <p class="text-muted">Your account information from the backend API.</p>
        <div class="grid grid-2 mt-2">
          <div><strong>User ID</strong><br><span class="text-muted">${UI.escapeHTML(user.id ?? "N/A")}</span></div>
          <div><strong>Role</strong><br><span class="badge ${isAdmin(user) ? "warning" : "primary"}">${UI.escapeHTML(user.role || (isAdmin(user) ? "admin" : "user"))}</span></div>
        </div>
      </div>`;
  }

  async function renderDashboard() {
    const target = UI.qs("#dashboard-content");
    if (!target) return;
    target.innerHTML = UI.loading("Preparing dashboard...");
    const user = await loadMe();
    if (!user) return;
    target.innerHTML = `
      <div class="section-header">
        <div>
          <span class="eyebrow">Welcome back</span>
          <h1>Hello, ${UI.escapeHTML(user.username || "User")}</h1>
          <p class="lead">Manage your library activity, browse books, and review borrowing history.</p>
        </div>
      </div>
      <div class="grid grid-3">
        <a class="card hoverable" href="books.html"><h3>Browse Books</h3><p class="text-muted">View available books and borrow them.</p></a>
        <a class="card hoverable" href="borrow-history.html"><h3>My Borrowing History</h3><p class="text-muted">Track borrowed and returned books.</p></a>
        <a class="card hoverable" href="profile.html"><h3>My Profile</h3><p class="text-muted">View your account details.</p></a>
        ${isAdmin(user) ? `<a class="card hoverable" href="admin-dashboard.html"><h3>Admin Dashboard</h3><p class="text-muted">CRUD operations and all borrowing history.</p></a>` : ""}
      </div>`;
  }

  function init() {
    requireAuth();
    setupLoginForm();
    setupRegisterForm();
    renderProfile();
    renderDashboard();
    if (AppAPI.isLoggedIn()) loadMe();
  }

  return { init, loadMe, isAdmin };
})();

document.addEventListener("DOMContentLoaded", Auth.init);
