const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#togglePassword");
const loginMessage = document.querySelector("#loginMessage");
const submitButton = loginForm.querySelector('button[type="submit"]');

const showMessage = (message, type = "error") => {
  loginMessage.textContent = message;
  loginMessage.dataset.type = type;
  loginMessage.hidden = false;
};

togglePassword.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  togglePassword.textContent = shouldShow ? "Tutup" : "Lihat";
  togglePassword.setAttribute("aria-pressed", String(shouldShow));
  togglePassword.setAttribute("aria-label", shouldShow ? "Sembunyikan password" : "Tampilkan password");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.hidden = true;

  if (!loginForm.checkValidity()) {
    loginForm.reportValidity();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Memverifikasi...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginForm.email.value.trim(),
        password: loginForm.password.value,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Login gagal.");

    showMessage("Login berhasil. Membuka dashboard...", "success");
    window.location.replace("/dashboard");
  } catch (error) {
    showMessage(error.message || "Tidak dapat terhubung ke server.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Masuk ke Dashboard";
  }
});

fetch("/api/auth/me", { credentials: "same-origin" }).then((response) => {
  if (response.ok) window.location.replace("/dashboard");
}).catch(() => {});
