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
  event.preventDefault(); if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  const button = $("#saveSettingsButton"); button.disabled = true; button.textContent = "Menyimpan..."; $("#settingsMessage").hidden = true;
  try {
    const payload = { ordersEnabled: $("#ordersEnabled").checked, heroTitle: $("#heroTitleInput").value.trim(), heroDescription: $("#heroDescriptionInput").value.trim() };
    const result = await api("/api/settings", { method: "PATCH", body: JSON.stringify(payload) }); currentSettings = result.data; toast(result.message);
  } catch (error) { $("#settingsMessage").textContent = error.message; $("#settingsMessage").hidden = false; }
  finally { button.disabled = false; button.textContent = "Simpan Pengaturan"; }
});
(async () => { try { await initializeSession(); await load(); } catch (error) { if (!error.message.includes("Sesi")) toast(error.message); } })();
