const { api, escapeHtml, initializeSession, toast } = window.Admin;
const state = { methods: [], previewUrl: null };
const $ = (selector) => document.querySelector(selector);

const renderList = () => {
  const listContainer = $("#paymentMethodsList");
  if (!listContainer) return;

  if (state.methods.length === 0) {
    listContainer.innerHTML = '<div class="state-box">Belum ada metode pembayaran yang diatur.</div>';
    return;
  }

  listContainer.innerHTML = state.methods
    .map((method) => {
      let typeLabel = "Offline";
      if (method.type === "qris") typeLabel = "QRIS";
      if (method.type === "bank") typeLabel = "Transfer Bank";

      let detailText = "";
      if (method.type === "bank" && Array.isArray(method.accounts)) {
        detailText = method.accounts.map((acc) => `${escapeHtml(acc.bankName)} (${escapeHtml(acc.accountNumber)})`).join(", ");
      } else if (method.type === "qris" && method.qrImage) {
        detailText = `<a href="${escapeHtml(method.qrImage)}" target="_blank" style="text-decoration:underline;">Lihat QRIS ↗</a>`;
      } else {
        detailText = escapeHtml(method.description) || "Tanpa deskripsi.";
      }

      return `
        <article class="payment-admin-row">
          <div class="payment-icon-wrapper payment-icon-${escapeHtml(method.type)}">
            ${escapeHtml(method.type === 'offline' ? 'kasir' : method.type)}
          </div>
          <div class="payment-info">
            <h3>
              ${escapeHtml(method.name)}
              ${method.isRecommended ? '<span class="payment-badge payment-badge-recommended">Rekomendasi</span>' : ""}
            </h3>
            <p>${detailText}</p>
          </div>
          <div class="payment-meta">
            <span class="status ${method.isActive ? "" : "off"}">${method.isActive ? "Aktif" : "Nonaktif"}</span>
            <span>Urutan: ${method.sortOrder}</span>
          </div>
          <div class="payment-actions">
            <button type="button" data-edit="${method.id}">Edit</button>
            <button type="button" class="delete-button" data-delete="${method.id}">Hapus</button>
          </div>
        </article>
      `;
    })
    .join("");
};

const loadData = async () => {
  $("#loadingState").hidden = false;
  try {
    const response = await api("/api/payment-methods/admin");
    state.methods = response.data;
    renderList();
  } catch (err) {
    toast(err.message || "Gagal memuat metode pembayaran.");
  } finally {
    $("#loadingState").hidden = true;
  }
};

const createAccountRowHtml = (bankName = "", accountNumber = "", accountHolder = "") => {
  return `
    <div class="account-row">
      <input type="text" class="acc-bank" placeholder="Nama Bank (misal: BCA)" value="${escapeHtml(bankName)}" required />
      <input type="text" class="acc-number" placeholder="No Rekening (misal: 12345)" value="${escapeHtml(accountNumber)}" required />
      <input type="text" class="acc-holder" placeholder="Atas Nama" value="${escapeHtml(accountHolder)}" required />
      <button type="button" class="btn-remove-account" aria-label="Hapus rekening">×</button>
    </div>
  `;
};

const setPreview = (url) => {
  const preview = $("#qrisPreview");
  if (!preview) return;
  preview.hidden = !url;
  preview.innerHTML = url ? `<img class="qris-thumb" src="${escapeHtml(url)}" alt="Preview QRIS">` : "";
};

const handleTypeChange = () => {
  const type = $("#paymentType").value;
  if (type === "qris") {
    $("#qrisFields").hidden = false;
    $("#bankFields").hidden = true;
  } else if (type === "bank") {
    $("#qrisFields").hidden = true;
    $("#bankFields").hidden = false;
  } else {
    $("#qrisFields").hidden = true;
    $("#bankFields").hidden = true;
  }
};

const openModal = (method = null) => {
  $("#paymentForm").reset();
  $("#formMessage").hidden = true;
  $("#bankAccountsList").innerHTML = "";

  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = null;

  if (method) {
    $("#modalTitle").textContent = "Edit Metode Pembayaran";
    $("#paymentId").value = method.id;
    $("#paymentName").value = method.name;
    $("#paymentType").value = method.type;
    $("#paymentDescription").value = method.description || "";
    $("#paymentInstruction").value = method.instruction || "";
    $("#paymentNote").value = method.note || "";
    $("#paymentSortOrder").value = method.sortOrder;
    $("#paymentRecommended").checked = method.isRecommended;
    $("#paymentActive").checked = method.isActive;

    if (method.type === "qris") {
      $("#qrisImageUrl").value = method.qrImage || "";
      setPreview(method.qrImage || "");
    } else {
      $("#qrisImageUrl").value = "";
      setPreview("");
    }

    if (method.type === "bank" && Array.isArray(method.accounts)) {
      method.accounts.forEach((acc) => {
        $("#bankAccountsList").insertAdjacentHTML(
          "beforeend",
          createAccountRowHtml(acc.bankName, acc.accountNumber, acc.accountHolder)
        );
      });
    }
  } else {
    $("#modalTitle").textContent = "Tambah Metode Pembayaran";
    $("#paymentId").value = "";
    $("#paymentSortOrder").value = 0;
    $("#paymentRecommended").checked = false;
    $("#paymentActive").checked = true;
    $("#qrisImageUrl").value = "";
    setPreview("");
  }

  handleTypeChange();
  $("#paymentModal").hidden = false;
  document.body.style.overflow = "hidden";
  $("#paymentName").focus();
};

const closeModal = () => {
  $("#paymentModal").hidden = true;
  document.body.style.overflow = "";
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = null;
};

// Event Listeners
$("#paymentType").addEventListener("change", handleTypeChange);

$("#addPaymentButton").addEventListener("click", () => openModal());

document.querySelectorAll("[data-close-modal]").forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

$("#btnAddAccount").addEventListener("click", () => {
  $("#bankAccountsList").insertAdjacentHTML("beforeend", createAccountRowHtml());
});

$("#bankAccountsList").addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".btn-remove-account");
  if (removeBtn) {
    removeBtn.closest(".account-row").remove();
  }
});

$("#qrisImageFile").addEventListener("change", () => {
  const file = $("#qrisImageFile").files[0];
  if (!file) return setPreview($("#qrisImageUrl").value);
  if (file.size > 5 * 1024 * 1024) {
    $("#qrisImageFile").value = "";
    return toast("Ukuran gambar maksimal 5 MB.");
  }
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = URL.createObjectURL(file);
  setPreview(state.previewUrl);
});

$("#qrisImageUrl").addEventListener("input", () => {
  if (!$("#qrisImageFile").files[0]) {
    setPreview($("#qrisImageUrl").value.trim());
  }
});

$("#paymentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!event.currentTarget.checkValidity()) return event.currentTarget.reportValidity();

  const button = $("#savePaymentButton");
  button.disabled = true;
  $("#formMessage").hidden = true;

  try {
    const type = $("#paymentType").value;
    let qrImage = null;

    if (type === "qris") {
      qrImage = $("#qrisImageUrl").value.trim() || null;
      const file = $("#qrisImageFile").files[0];
      if (file) {
        button.textContent = "Mengunggah QRIS...";
        const body = new FormData();
        body.append("image", file);
        const uploadResult = await api("/api/uploads/images", { method: "POST", body });
        qrImage = uploadResult.data.imageUrl;
      }
    }

    let accounts = null;
    if (type === "bank") {
      accounts = [];
      const rows = document.querySelectorAll("#bankAccountsList .account-row");
      rows.forEach((row) => {
        const bankName = row.querySelector(".acc-bank").value.trim();
        const accountNumber = row.querySelector(".acc-number").value.trim();
        const accountHolder = row.querySelector(".acc-holder").value.trim();
        if (bankName && accountNumber && accountHolder) {
          accounts.push({ bankName, accountNumber, accountHolder });
        }
      });
      if (accounts.length === 0) {
        throw new Error("Mohon tambahkan minimal satu rekening bank.");
      }
    }

    button.textContent = "Menyimpan...";
    const id = $("#paymentId").value;
    const payload = {
      name: $("#paymentName").value.trim(),
      type,
      description: $("#paymentDescription").value.trim() || null,
      instruction: $("#paymentInstruction").value.trim() || null,
      note: $("#paymentNote").value.trim() || null,
      sortOrder: Number($("#paymentSortOrder").value),
      isRecommended: $("#paymentRecommended").checked,
      isActive: $("#paymentActive").checked,
      qrImage,
      accounts,
    };

    const result = await api(id ? `/api/payment-methods/${id}` : "/api/payment-methods", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });

    closeModal();
    toast(result.message);
    await loadData();
  } catch (error) {
    $("#formMessage").textContent = error.message;
    $("#formMessage").hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Simpan Metode";
  }
});

$("#paymentMethodsList").addEventListener("click", async (event) => {
  const editBtn = event.target.closest("[data-edit]");
  const removeBtn = event.target.closest("[data-delete]");

  if (editBtn) {
    const id = editBtn.dataset.edit;
    const method = state.methods.find((item) => item.id === id);
    if (method) openModal(method);
  }

  if (removeBtn) {
    const id = removeBtn.dataset.delete;
    const method = state.methods.find((item) => item.id === id);
    if (method && confirm(`Hapus metode pembayaran “${method.name}”?`)) {
      try {
        const response = await api(`/api/payment-methods/${id}`, { method: "DELETE" });
        toast(response.message);
        await loadData();
      } catch (error) {
        toast(error.message);
      }
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("#paymentModal").hidden) closeModal();
});

(async () => {
  try {
    await initializeSession();
    await loadData();
  } catch (error) {
    if (!error.message.includes("Sesi")) toast(error.message);
  }
})();
