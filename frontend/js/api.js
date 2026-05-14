/* API helper for FastAPI backend */
const BASE_URL = "http://127.0.0.1:8000";

const AppAPI = (() => {
  const TOKEN_KEY = "library_token";
  const USER_KEY = "library_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return Boolean(getToken());
  }

  function headers(isJson = true) {
    const h = {};
    if (isJson) h["Content-Type"] = "application/json";
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  async function request(path, options = {}) {
    const config = {
      method: options.method || "GET",
      headers: { ...headers(options.json !== false), ...(options.headers || {}) },
      ...options,
    };

    if (options.body && typeof options.body !== "string") {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${BASE_URL}${path}`, config);
    let data = null;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : null;
    }

    if (!response.ok) {
      const message = data?.detail || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(Array.isArray(message) ? message.map((m) => m.msg).join(", ") : message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  return {
    BASE_URL,
    getToken,
    setToken,
    clearToken,
    setUser,
    getStoredUser,
    isLoggedIn,
    request,
    auth: {
      register: (payload) => request("/auth/register", { method: "POST", body: payload }),
      login: (payload) => request("/auth/login", { method: "POST", body: payload }),
      me: () => request("/me"),
    },
    books: {
      available: () => request("/books/"),
      all: () => request("/books/all"),
      create: (payload) => request("/books/", { method: "POST", body: payload }),
      update: (id, payload) => request(`/books/${id}`, { method: "PUT", body: payload }),
      remove: (id) => request(`/books/${id}`, { method: "DELETE" }),
      restore: (id) => request(`/books/restore/${id}`, { method: "PUT" }),
      hardDelete: (id) => request(`/books/hard-delete/${id}`, {method: "DELETE"}),
    },
    borrow: {
      borrowBook: (id) => request(`/borrow/${id}`, { method: "POST" }),
      returnBook: (id) => request(`/borrow/return/${id}`, { method: "POST" }),
      myHistory: () => request("/borrow/my-history"),
      allHistory: () => request("/borrow/all-history"),
    },
  };
})();
