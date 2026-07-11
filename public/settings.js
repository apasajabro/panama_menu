const { api, initializeSession, toast } = window.Admin;
const $ = (selector) => document.querySelector(selector);
let currentSettings = null;

const updateCounts = () => {
  $("#heroTitleCount").textContent = $("#heroTitleInput").value.length;
  $("#heroDescriptionCount").textContent = $("#heroDescriptionInput").value.length;
};

const load = async () => {
  currentSettings = (await api("/api/settings")).data;
  $("#heroTitleInput").value = currentSettings.heroTitle;
  $("#heroDescriptionInput").value = currentSettings.heroDescription;
  $("#ordersEnabled").checked = currentSettings.ordersEnabled;
  updateCounts();
};

$("#heroTitleInput").addEventListener("input", updateCounts);
$("#heroDescriptionInput").addEventListener("input", updateCounts);

$("#settingsForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  const button = $("#saveSettingsButton");
  button.disabled = true;
  button.textContent = "Menyimpan...";
  $("#settingsMessage").hidden = true;
  try {
    const payload = {
      ordersEnabled: $("#ordersEnabled").checked,
      heroTitle: $("#heroTitleInput").value.trim(),
      heroDescription: $("#heroDescriptionInput").value.trim()
    };
    const result = await api("/api/settings", { method: "PATCH", body: JSON.stringify(payload) });
    currentSettings = result.data;
    toast(result.message);
  } catch (error) {
    $("#settingsMessage").textContent = error.message;
    $("#settingsMessage").hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Simpan Pengaturan";
  }
});

$("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  
  const button = $("#saveProfileButton");
  button.disabled = true;
  button.textContent = "Memperbarui...";
  $("#profileMessage").hidden = true;

  try {
    const payload = {
      name: $("#adminNameInput").value.trim(),
      email: $("#adminEmailInput").value.trim().toLowerCase(),
    };

    const newPassword = $("#newPasswordInput").value;
    const currentPassword = $("#currentPasswordInput").value;

    if (newPassword) {
      if (!currentPassword) {
        throw new Error("Password saat ini wajib diisi untuk mengubah password.");
      }
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }

    const result = await api("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    toast(result.message);
    
    // Reset password inputs
    $("#newPasswordInput").value = "";
    $("#currentPasswordInput").value = "";
    
    // Refresh header avatar/welcome text
    await initializeSession();
  } catch (error) {
    $("#profileMessage").textContent = error.message;
    $("#profileMessage").hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Perbarui Akun";
  }
});

(async () => {
  try {
    const user = await initializeSession();
    $("#adminNameInput").value = user.name || "";
    $("#adminEmailInput").value = user.email || "";
    await load();
  } catch (error) {
    if (!error.message.includes("Sesi")) toast(error.message);
  }
})();
