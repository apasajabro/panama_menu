const { api, escapeHtml, initializeSession, toast } = window.Admin;
const state = { categories: [] };
const $ = (selector) => document.querySelector(selector);

const render = () => {
  $("#categoryList").innerHTML = state.categories.map((category) => `
    <article class="category-admin-row"><div><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.description || `Slug: ${category.slug}`)}</p></div><div class="category-admin-meta"><span class="status ${category.isActive ? "" : "off"}">${category.isActive ? "Aktif" : "Nonaktif"}</span><span>${category._count?.menus || 0} menu · Urutan ${category.sortOrder}</span></div><div class="category-admin-actions"><button type="button" data-edit="${category.id}">Edit</button><button type="button" class="delete-button" data-delete="${category.id}">Hapus</button></div></article>`).join("") || '<div class="state-box">Belum ada kategori.</div>';
};
const load = async () => { $("#loadingState").hidden = false; try { state.categories = (await api("/api/categories/admin")).data; render(); } finally { $("#loadingState").hidden = true; } };
const openModal = (category = null) => {
  $("#categoryForm").reset(); $("#categoryFormMessage").hidden = true; $("#categoryModalTitle").textContent = category ? "Edit Kategori" : "Tambah Kategori";
  $("#categoryId").value = category?.id || ""; $("#categoryName").value = category?.name || ""; $("#categoryDescription").value = category?.description || ""; $("#categorySortOrder").value = category?.sortOrder ?? 0; $("#categoryActive").checked = category?.isActive ?? true;
  $("#categoryModal").hidden = false; document.body.style.overflow = "hidden"; $("#categoryName").focus();
};
const closeModal = () => { $("#categoryModal").hidden = true; document.body.style.overflow = ""; };

$("#categoryForm").addEventListener("submit", async (event) => {
  event.preventDefault(); if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();
  const button = $("#saveCategoryButton"); button.disabled = true; $("#categoryFormMessage").hidden = true;
  try {
    const id = $("#categoryId").value; const payload = { name: $("#categoryName").value.trim(), description: $("#categoryDescription").value.trim() || null, sortOrder: Number($("#categorySortOrder").value), isActive: $("#categoryActive").checked };
    const result = await api(id ? `/api/categories/${id}` : "/api/categories", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) }); closeModal(); toast(result.message); await load();
  } catch (error) { $("#categoryFormMessage").textContent = error.message; $("#categoryFormMessage").hidden = false; }
  finally { button.disabled = false; }
});

$("#categoryList").addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit]"); const remove = event.target.closest("[data-delete]");
  if (edit) openModal(state.categories.find((item) => item.id === edit.dataset.edit));
  if (remove) { const category = state.categories.find((item) => item.id === remove.dataset.delete); if (category && confirm(`Hapus kategori “${category.name}”?`)) { try { toast((await api(`/api/categories/${category.id}`, { method: "DELETE" })).message); await load(); } catch (error) { toast(error.message); } } }
});
$("#addCategoryButton").addEventListener("click", () => openModal());
document.querySelectorAll("[data-close-category]").forEach((button) => button.addEventListener("click", closeModal));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("#categoryModal").hidden) closeModal(); });
(async () => { try { await initializeSession(); await load(); } catch (error) { if (!error.message.includes("Sesi")) toast(error.message); } })();

