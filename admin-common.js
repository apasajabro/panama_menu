window.Admin = (() => {
  const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const api = async (url, options = {}) => {
    const isForm = options.body instanceof FormData;
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: { ...(!isForm && options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      window.location.replace("/login");
      throw new Error("Sesi berakhir.");
    }
    if (!response.ok) throw new Error(result.message || "Permintaan gagal.");
    return result;
  };

  const toast = (message) => {
    const element = document.querySelector("#toast");
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 2800);
  };

  const initializeSession = async () => {
    const result = await api("/api/auth/me");
    const welcome = document.querySelector("#welcomeText");
    if (welcome) {
      const name = result.user.name || "Admin";
      const initial = name.charAt(0).toUpperCase();
      welcome.innerHTML = `<span class="user-avatar-initial">${initial}</span><span>Login sebagai <strong>${escapeHtml(name)}</strong></span>`;
    }
    return result.user;
  };

  document.querySelector("#logoutButton")?.addEventListener("click", async () => {
    try { await api("/api/auth/logout", { method: "POST" }); }
    finally { window.location.replace("/login"); }
  });

  return { api, escapeHtml, initializeSession, toast };
})();
