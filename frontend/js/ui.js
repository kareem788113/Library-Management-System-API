/* Shared UI helpers */
const UI = (() => {
    function qs(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function qsa(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    function escapeHTML(value = "") {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function toast(message, type = "info") {
        let container = qs("#toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }
        const item = document.createElement("div");
        item.className = `toast ${type}`;
        item.textContent = message;
        container.appendChild(item);
        setTimeout(() => item.remove(), 3600);
    }

    function alertBox(message, type = "info") {
        return `<div class="alert ${type}">${escapeHTML(message)}</div>`;
    }

    function loading(message = "Loading...") {
        return `<div class="loading-state"><div class="spinner"></div><p>${escapeHTML(message)}</p></div>`;
    }

    function empty(message = "No data found.") {
        return `<div class="empty-state"><h3>No Results</h3><p>${escapeHTML(message)}</p></div>`;
    }

    function setActiveNav() {
        const current = location.pathname.split("/").pop() || "index.html";
        qsa(".nav-links a").forEach((link) => {
            const href = link.getAttribute("href");
            if (href === current) link.classList.add("active");
        });
    }

    function updateNavbar() {
        const loggedIn = AppAPI.isLoggedIn();
        const user = AppAPI.getStoredUser();
        const isAdmin = user && (user.role === "admin" || user.is_admin === true);

        qsa("[data-auth='logged-in']").forEach((el) => el.classList.toggle("hidden", !loggedIn));
        qsa("[data-auth='logged-out']").forEach((el) => el.classList.toggle("hidden", loggedIn));
        qsa("[data-role='admin']").forEach((el) => el.classList.toggle("hidden", !isAdmin));
        const historyLinks = qsa(".nav-links a");

        historyLinks.forEach((link) => {

            if (link.textContent.trim() === "History") {

                if (isAdmin) {
                    link.href = "admin-history.html";
                } else {
                    link.href = "borrow-history.html";
                }

            }

        });
        const usernameEl = qs("#nav-username");
        if (usernameEl && user) usernameEl.textContent = user.username || "User";
    }

    function initMobileNav() {
        const btn = qs("#mobile-toggle");
        const menu = qs("#nav-links");
        if (!btn || !menu) return;
        btn.addEventListener("click", () => menu.classList.toggle("open"));
    }

    function setupLogout() {
        qsa("[data-action='logout']").forEach((btn) => {
            btn.addEventListener("click", () => {
                AppAPI.clearToken();
                toast("Logged out successfully", "success");
                setTimeout(() => (location.href = "login.html"), 500);
            });
        });
    }

    function renderNavbar() {
        const existing = qs(".navbar");
        if (existing) return;
        const nav = document.createElement("nav");
        nav.className = "navbar";
        nav.innerHTML = `
      <div class="nav-content">
        <a class="brand" href="index.html"><span class="brand-icon">📚</span><span>Library System</span></a>
        <button class="mobile-toggle" id="mobile-toggle" aria-label="Open menu">☰</button>
        <div class="nav-links" id="nav-links">
          <a href="index.html">Home</a>
          <a href="books.html">Books</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="dashboard.html" data-auth="logged-in">Dashboard</a>
          <a href="borrow-history.html" data-auth="logged-in">My History</a>
          <a href="profile.html" data-auth="logged-in">Profile</a>
          <a href="admin-dashboard.html" data-auth="logged-in" data-role="admin">Admin</a>
          <a href="login.html" data-auth="logged-out">Login</a>
          <a href="register.html" data-auth="logged-out">Register</a>
          <button type="button" data-action="logout" data-auth="logged-in">Logout</button>
        </div>
      </div>`;
        document.body.prepend(nav);
    }

    function renderFooter() {
        if (qs(".footer")) return;
        const footer = document.createElement("footer");
        footer.className = "footer";
        footer.innerHTML = `
      <div class="footer-content">
        <strong>Library System</strong>
        <span>FastAPI + HTML/CSS/JavaScript frontend</span>
      </div>`;
        document.body.appendChild(footer);
    }

    function initLayout() {
        if (!document.body.classList.contains("auth-page")) {
            renderNavbar();
            renderFooter();
            initMobileNav();
        }
        setupLogout();
        setActiveNav();
        updateNavbar();
    }

    return { qs, qsa, escapeHTML, toast, alertBox, loading, empty, updateNavbar, initLayout };
})();

document.addEventListener("DOMContentLoaded", UI.initLayout);