const { api, escapeHtml, initializeSession, toast } = window.Admin;
const state = { menus: [], categories: [], previewUrl: null };
const $ = (selector) => document.querySelector(selector);
const formatCurrency = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const categoryLabel = (slug) => state.categories.find((item) => item.slug === slug)?.name || slug;

const updateCategoryOptions = () => {
  const active = state.categories.filter((item) => item.isActive);
  const getCount = (slug) => state.menus.filter((menu) => menu.category === slug).length;
  $("#categoryFilter").innerHTML = `<option value="all">Semua kategori (${state.menus.length})</option>` + active.map((item) => `<option value="${escapeHtml(item.slug)}">${escapeHtml(item.name)} (${getCount(item.slug)})</option>`).join("");
  $("#menuCategory").innerHTML = active.map((item) => `<option value="${escapeHtml(item.slug)}">${escapeHtml(item.name)}</option>`).join("");
};

const renderMenus = () => {
  const query = $("#searchMenu").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const menus = state.menus.filter((menu) => `${menu.name} ${categoryLabel(menu.category)} ${menu.description || ""}`.toLowerCase().includes(query) && (category === "all" || menu.category === category));
  $("#emptyMenu").hidden = menus.length > 0;
  $("#menuList").innerHTML = menus.map((menu) => `
    <article class="admin-menu-card">
      ${menu.imageUrl ? `<img src="${escapeHtml(menu.imageUrl)}" alt="${escapeHtml(menu.name)}" data-admin-menu-image>` : '<div class="image-placeholder">PC</div>'}
      <div class="menu-card-content"><div class="menu-card-top"><h3>${escapeHtml(menu.name)}</h3><strong>${formatCurrency(menu.price)}</strong></div><p>${escapeHtml(menu.description || "Tanpa deskripsi")}</p><div class="card-meta"><span class="status ${menu.isAvailable ? "" : "off"}">${menu.isAvailable ? "Tersedia" : "Habis"}</span><span class="category">${escapeHtml(categoryLabel(menu.category))}</span></div><div class="card-actions"><button type="button" data-edit-menu="${menu.id}">Edit</button><button type="button" class="delete-button" data-delete-menu="${menu.id}">Hapus</button></div></div>
    </article>`).join("");
  $("#totalMenu").textContent = state.menus.length;
  $("#availableMenu").textContent = state.menus.filter((menu) => menu.isAvailable).length;
  $("#unavailableMenu").textContent = state.menus.filter((menu) => !menu.isAvailable).length;
};

const loadData = async () => {
  $("#loadingState").hidden = false;
  try {
    const [menus, categories] = await Promise.all([api("/api/menus/admin"), api("/api/categories/admin")]);
    state.menus = menus.data; state.categories = categories.data;
    updateCategoryOptions(); renderMenus();
  } finally { $("#loadingState").hidden = true; }
};

const setPreview = (url) => { $("#imagePreview").hidden = !url; $("#imagePreview").innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Preview gambar menu">` : ""; };
const openModal = (menu = null) => {
  $("#menuForm").reset(); $("#formMessage").hidden = true;
  $("#modalTitle").textContent = menu ? "Edit Menu" : "Tambah Menu";
  $("#menuId").value = menu?.id || ""; $("#menuName").value = menu?.name || ""; $("#menuDescription").value = menu?.description || ""; $("#menuPrice").value = menu?.price ?? "";
  $("#menuCategory").value = menu?.category || state.categories.find((item) => item.isActive)?.slug || "";
  $("#menuImageUrl").value = menu?.imageUrl || ""; $("#menuAvailable").checked = menu?.isAvailable ?? true; setPreview(menu?.imageUrl || "");
  $("#menuModal").hidden = false; document.body.style.overflow = "hidden"; $("#menuName").focus();
};
const closeModal = () => { $("#menuModal").hidden = true; document.body.style.overflow = ""; if (state.previewUrl) URL.revokeObjectURL(state.previewUrl); state.previewUrl = null; };

$("#menuImageFile").addEventListener("change", () => {
  const file = $("#menuImageFile").files[0]; if (!file) return setPreview($("#menuImageUrl").value);
  if (file.size > 5 * 1024 * 1024) { $("#menuImageFile").value = ""; return toast("Ukuran gambar maksimal 5 MB."); }
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl); state.previewUrl = URL.createObjectURL(file); setPreview(state.previewUrl);
});
$("#menuImageUrl").addEventListener("input", () => { if (!$("#menuImageFile").files[0]) setPreview($("#menuImageUrl").value.trim()); });

$("#menuForm").addEventListener("submit", async (event) => {
  event.preventDefault(); if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  const button = $("#saveMenuButton"); button.disabled = true; $("#formMessage").hidden = true;
  try {
    let imageUrl = $("#menuImageUrl").value.trim() || null; const file = $("#menuImageFile").files[0];
    if (file) { button.textContent = "Mengunggah..."; const body = new FormData(); body.append("image", file); imageUrl = (await api("/api/uploads/images", { method: "POST", body })).data.imageUrl; }
    button.textContent = "Menyimpan..."; const id = $("#menuId").value;
    const payload = { name: $("#menuName").value.trim(), description: $("#menuDescription").value.trim() || null, price: Number($("#menuPrice").value), category: $("#menuCategory").value, imageUrl, isAvailable: $("#menuAvailable").checked };
    const result = await api(id ? `/api/menus/${id}` : "/api/menus", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    closeModal(); toast(result.message); await loadData();
  } catch (error) { $("#formMessage").textContent = error.message; $("#formMessage").hidden = false; }
  finally { button.disabled = false; button.textContent = "Simpan Menu"; }
});

$("#menuList").addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit-menu]"); const remove = event.target.closest("[data-delete-menu]");
  if (edit) openModal(state.menus.find((item) => item.id === edit.dataset.editMenu));
  if (remove) { const menu = state.menus.find((item) => item.id === remove.dataset.deleteMenu); if (menu && confirm(`Hapus menu “${menu.name}”?`)) { try { toast((await api(`/api/menus/${menu.id}`, { method: "DELETE" })).message); await loadData(); } catch (error) { toast(error.message); } } }
});

$("#addMenuButton").addEventListener("click", () => openModal());
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
const handleSearchInput = () => {
  const query = $("#searchMenu").value;
  $("#clearSearchButton").hidden = !query;
  renderMenus();
};

$("#searchMenu").addEventListener("input", handleSearchInput);

$("#clearSearchButton").addEventListener("click", () => {
  $("#searchMenu").value = "";
  $("#clearSearchButton").hidden = true;
  renderMenus();
  $("#searchMenu").focus();
});

$("#searchMenu").addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    $("#searchMenu").value = "";
    $("#clearSearchButton").hidden = true;
    renderMenus();
    $("#searchMenu").blur();
    event.stopPropagation();
  }
});

$("#categoryFilter").addEventListener("change", renderMenus);
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("#menuModal").hidden) closeModal(); });
document.addEventListener("error", (event) => { const image = event.target; if (image instanceof HTMLImageElement && image.hasAttribute("data-admin-menu-image")) image.outerHTML = '<div class="image-placeholder">PC</div>'; }, true);

(async () => { try { await initializeSession(); await loadData(); } catch (error) { if (!error.message.includes("Sesi")) toast(error.message); } })();
