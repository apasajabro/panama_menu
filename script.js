const menuGrid = document.getElementById("menuGrid");
const searchInput = document.getElementById("searchInput");
const categoryTabs = document.getElementById("categoryTabs");
const emptyState = document.getElementById("emptyState");

const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

const customerNameInput = document.getElementById("customerNameInput");
const tableNumberInput = document.getElementById("tableNumberInput");
const orderNoteInput = document.getElementById("orderNoteInput");

const paymentMethodsContainer = document.getElementById("paymentMethods");
const paymentInstruction = document.getElementById("paymentInstruction");

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

const brandName = document.getElementById("brandName");
const brandSubtitle = document.getElementById("brandSubtitle");
const heroEyebrow = document.getElementById("heroEyebrow");
const heroTitle = document.getElementById("heroTitle");
const heroDescription = document.getElementById("heroDescription");
const menuCountLabel = document.getElementById("menuCountLabel");
const startPriceLabel = document.getElementById("startPriceLabel");
const directWhatsappButton = document.getElementById("directWhatsappButton");
const footerText = document.getElementById("footerText");

const defaultConfig = {
  restaurantName: "Panama Corner",
  brandSubtitle: "Food & Drink Menu",

  whatsappNumber: "",
  whatsappGreeting: "Halo Panama Corner, saya ingin pesan:",
  directWhatsappMessage: "Halo Panama Corner, saya ingin pesan.",

  heroTitle: "Menu favorit untuk makan santai dan ngopi nyaman.",
  heroDescription:
    "Pilih makanan, snack, dan minuman favorit Panama Corner langsung dari layar HP.",

  currency: "IDR",
  locale: "id-ID",

  footerYear: "2026",

  paymentMethods: [
    {
      id: "cashier",
      name: "Bayar di Kasir",
      shortLabel: "Kasir",
      description: "Bayar langsung di kasir setelah pesanan dikonfirmasi.",
      instruction:
        "Silakan lakukan pembayaran langsung di kasir Panama Corner setelah pesanan dikonfirmasi.",
      type: "offline",
      isRecommended: true,
    },
  ],
};

const config =
  typeof appConfig !== "undefined"
    ? {
        ...defaultConfig,
        ...appConfig,
      }
    : defaultConfig;

const menus = Array.isArray(typeof menuItems !== "undefined" ? menuItems : [])
  ? menuItems
  : [];

const paymentMethods = Array.isArray(config.paymentMethods)
  ? config.paymentMethods
  : defaultConfig.paymentMethods;

let activeCategory = "all";
let cart = [];
let selectedPaymentMethodId =
  paymentMethods.find((method) => method.isRecommended)?.id ||
  paymentMethods[0]?.id ||
  "";

const formatCurrency = (value) => {
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortPrice = (value) => {
  if (!Number.isFinite(value)) return "-";

  if (value >= 1000) {
    return `${Math.floor(value / 1000)}k`;
  }

  return String(value);
};

const getInitial = (name) => {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getWhatsappNumber = () => {
  return String(config.whatsappNumber || "").replace(/\D/g, "");
};

const getSelectedPaymentMethod = () => {
  return (
    paymentMethods.find((method) => method.id === selectedPaymentMethodId) ||
    paymentMethods[0] ||
    null
  );
};

const getCartTotalPrice = () => {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
};

const getCartTotalQty = () => {
  return cart.reduce((sum, item) => sum + item.qty, 0);
};

const getMinimumMenuPrice = () => {
  if (menus.length === 0) return 0;

  return menus.reduce((lowest, item) => {
    if (!Number.isFinite(item.price)) return lowest;
    return Math.min(lowest, item.price);
  }, menus[0].price);
};

const setText = (element, value) => {
  if (!element) return;
  element.textContent = value;
};

const setCheckoutDisabled = (isDisabled) => {
  if (!checkoutButton) return;

  if (isDisabled) {
    checkoutButton.href = "#";
    checkoutButton.setAttribute("aria-disabled", "true");
    checkoutButton.classList.add("is-disabled");
    return;
  }

  checkoutButton.removeAttribute("aria-disabled");
  checkoutButton.classList.remove("is-disabled");
};

const buildDirectWhatsappUrl = () => {
  const whatsappNumber = getWhatsappNumber();

  if (!whatsappNumber) {
    return "#";
  }

  const message = encodeURIComponent(
    config.directWhatsappMessage ||
      `Halo ${config.restaurantName}, saya ingin pesan.`,
  );

  return `https://wa.me/${whatsappNumber}?text=${message}`;
};

const applyConfigToPage = () => {
  document.title = `${config.restaurantName} — Menu Digital`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `Menu digital ${config.restaurantName}. Pilihan makanan, snack, dan minuman favorit yang nyaman dibuka dari mobile.`,
    );
  }

  setText(brandName, config.restaurantName);
  setText(brandSubtitle, config.brandSubtitle);
  setText(heroEyebrow, config.restaurantName);
  setText(heroTitle, config.heroTitle);
  setText(heroDescription, config.heroDescription);

  setText(menuCountLabel, `${menus.length}+`);
  setText(startPriceLabel, formatShortPrice(getMinimumMenuPrice()));

  const whatsappNumber = getWhatsappNumber();

  if (directWhatsappButton) {
    directWhatsappButton.href = buildDirectWhatsappUrl();
    directWhatsappButton.setAttribute(
      "aria-label",
      `Hubungi ${config.restaurantName} melalui WhatsApp`,
    );

    if (!whatsappNumber) {
      directWhatsappButton.setAttribute("aria-disabled", "true");
      directWhatsappButton.classList.add("is-disabled");
    } else {
      directWhatsappButton.removeAttribute("aria-disabled");
      directWhatsappButton.classList.remove("is-disabled");
    }
  }

  setText(
    footerText,
    `© ${config.footerYear} ${config.restaurantName}. Digital menu concept.`,
  );
};

const renderMenu = () => {
  const keyword = searchInput?.value.trim().toLowerCase() || "";

  const filteredItems = menus.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    const searchableText = [
      item.name,
      item.description,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);

    return matchesCategory && matchesKeyword;
  });

  if (!menuGrid) return;

  menuGrid.innerHTML = filteredItems
    .map((item) => {
      const initial = getInitial(item.name);
      const safeName = escapeHtml(item.name);
      const safeDescription = escapeHtml(item.description);
      const safeImage = escapeHtml(item.image);
      const safeTags = Array.isArray(item.tags) ? item.tags : [];

      return `
        <article class="menu-card">
          <div class="menu-image-stage">
            <img
              class="menu-image-main"
              src="${safeImage}"
              alt="${safeName}"
              loading="lazy"
              onerror="this.closest('.menu-image-stage').innerHTML='<div class=&quot;image-fallback&quot;>${initial}</div>'"
            />
          </div>

          <div class="menu-card-body">
            <div class="menu-card-top">
              <h3>${safeName}</h3>
              <span class="price">${formatCurrency(item.price)}</span>
            </div>

            <p>${safeDescription}</p>

            <div class="menu-meta">
              ${safeTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>

            <div class="card-actions">
              <button class="add-button" type="button" data-id="${item.id}">
                Tambah
              </button>
              <button class="detail-button" type="button" data-name="${safeName}">
                Detail
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (emptyState) {
    emptyState.hidden = filteredItems.length > 0;
  }
};

const addToCart = (id) => {
  const selectedItem = menus.find((item) => item.id === id);
  if (!selectedItem) return;

  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      ...selectedItem,
      qty: 1,
    });
  }

  renderCart();
  animateCartButton();
};

const decreaseCartItem = (id) => {
  const existingItem = cart.find((item) => item.id === id);
  if (!existingItem) return;

  existingItem.qty -= 1;

  if (existingItem.qty <= 0) {
    cart = cart.filter((item) => item.id !== id);
  }

  renderCart();
};

const increaseCartItem = (id) => {
  const existingItem = cart.find((item) => item.id === id);
  if (!existingItem) return;

  existingItem.qty += 1;
  renderCart();
};

const animateCartButton = () => {
  if (!cartButton) return;

  cartButton.classList.remove("cart-button-bump");

  window.requestAnimationFrame(() => {
    cartButton.classList.add("cart-button-bump");
  });
};

const renderPaymentMethods = () => {
  if (!paymentMethodSelect) return;

  paymentMethodSelect.innerHTML = paymentMethods
    .map((method) => {
      const isSelected = method.id === selectedPaymentMethodId;

      return `
        <option value="${escapeHtml(method.id)}" ${isSelected ? "selected" : ""}>
          ${escapeHtml(method.name)}
        </option>
      `;
    })
    .join("");

  renderPaymentInstruction();
};

const renderBankAccounts = (accounts) => {
  if (!Array.isArray(accounts) || accounts.length === 0) return "";

  return `
    <div class="bank-account-list">
      ${accounts
        .map(
          (account) => `
            <div class="bank-account-card">
              <span>${escapeHtml(account.bankName)}</span>
              <strong>${escapeHtml(account.accountNumber)}</strong>
              <small>a.n. ${escapeHtml(account.accountHolder)}</small>
              <button
                type="button"
                class="copy-account-button"
                data-copy="${escapeHtml(account.accountNumber)}"
              >
                Salin Rekening
              </button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderPaymentInstruction = () => {
  if (!paymentInstruction) return;

  const selectedMethod = getSelectedPaymentMethod();

  if (!selectedMethod) {
    paymentInstruction.hidden = true;
    paymentInstruction.innerHTML = "";
    return;
  }

  const qrImage =
    selectedMethod.type === "qris" && selectedMethod.qrImage
      ? `
        <div class="qris-preview">
          <img
            src="${escapeHtml(selectedMethod.qrImage)}"
            alt="QRIS ${escapeHtml(config.restaurantName)}"
            loading="lazy"
            onerror="this.closest('.qris-preview').innerHTML='<div class=&quot;qris-fallback&quot;>QRIS belum tersedia</div>'"
          />
        </div>
      `
      : "";

  const bankAccounts =
    selectedMethod.type === "bank"
      ? renderBankAccounts(selectedMethod.accounts)
      : "";

  paymentInstruction.hidden = false;
  paymentInstruction.innerHTML = `
    <div class="payment-instruction-card">
      <div>
        <strong>${escapeHtml(selectedMethod.name)}</strong>
        <p>${escapeHtml(selectedMethod.instruction || "")}</p>
      </div>

      ${qrImage}
      ${bankAccounts}

      ${
        selectedMethod.note
          ? `<small class="payment-note">${escapeHtml(selectedMethod.note)}</small>`
          : ""
      }

      ${
        selectedMethod.type === "qris" || selectedMethod.type === "bank"
          ? `<small class="payment-warning">Pesanan diproses setelah pembayaran dikonfirmasi oleh kasir.</small>`
          : ""
      }
    </div>
  `;
};

const buildPaymentText = () => {
  const selectedMethod = getSelectedPaymentMethod();

  if (!selectedMethod) {
    return ["Metode Pembayaran: -"];
  }

  const lines = [
    `Metode Pembayaran: ${selectedMethod.name}`,
    `Instruksi: ${selectedMethod.instruction || "-"}`,
  ];

  if (
    selectedMethod.type === "bank" &&
    Array.isArray(selectedMethod.accounts)
  ) {
    lines.push("");
    lines.push("Rekening Tujuan:");

    selectedMethod.accounts.forEach((account) => {
      lines.push(
        `- ${account.bankName}: ${account.accountNumber} a.n. ${account.accountHolder}`,
      );
    });
  }

  if (selectedMethod.type === "qris" || selectedMethod.type === "bank") {
    lines.push("");
    lines.push(
      "Saya akan mengirim screenshot bukti pembayaran melalui chat WhatsApp ini.",
    );
  }

  return lines;
};

const buildWhatsappMessage = () => {
  const customerName = customerNameInput?.value.trim() || "";
  const tableNumber = tableNumberInput?.value.trim() || "";
  const orderNote = orderNoteInput?.value.trim() || "";
  const totalPrice = getCartTotalPrice();

  const orderText = cart
    .map((item) => {
      const subtotal = item.price * item.qty;
      return `- ${item.name} x${item.qty} = ${formatCurrency(subtotal)}`;
    })
    .join("\n");

  return [
    config.whatsappGreeting,
    "",
    `Nama: ${customerName || "-"}`,
    `Meja: ${tableNumber || "-"}`,
    "",
    "Pesanan:",
    orderText,
    "",
    `Total: ${formatCurrency(totalPrice)}`,
    `Catatan: ${orderNote || "-"}`,
    "",
    ...buildPaymentText(),
  ].join("\n");
};

const updateCheckoutLink = () => {
  if (cart.length === 0) {
    setCheckoutDisabled(true);
    return;
  }

  const whatsappNumber = getWhatsappNumber();

  if (!whatsappNumber) {
    setCheckoutDisabled(true);
    return;
  }

  const message = encodeURIComponent(buildWhatsappMessage());
  checkoutButton.href = `https://wa.me/${whatsappNumber}?text=${message}`;
  setCheckoutDisabled(false);
};

const renderCart = () => {
  const totalQty = getCartTotalQty();
  const totalPrice = getCartTotalPrice();

  if (cartCount) {
    cartCount.textContent = totalQty;
  }

  if (cartTotal) {
    cartTotal.textContent = formatCurrency(totalPrice);
  }

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="empty-state">
        Belum ada pesanan. Silakan pilih menu terlebih dahulu.
      </p>
    `;

    updateCheckoutLink();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${formatCurrency(item.price)} × ${item.qty}</p>
          </div>

          <div class="qty-control">
            <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Kurangi ${escapeHtml(item.name)}">−</button>
            <strong>${item.qty}</strong>
            <button type="button" data-action="increase" data-id="${item.id}" aria-label="Tambah ${escapeHtml(item.name)}">+</button>
          </div>
        </div>
      `,
    )
    .join("");

  updateCheckoutLink();
};

const openCart = () => {
  if (!cartDrawer || !overlay) return;

  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
};

const closeCartDrawer = () => {
  if (!cartDrawer || !overlay) return;

  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
};

categoryTabs?.addEventListener("click", (event) => {
  const button = event.target.closest(".tab");
  if (!button) return;

  activeCategory = button.dataset.category || "all";

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  button.classList.add("active");

  renderMenu();
});

searchInput?.addEventListener("input", renderMenu);

customerNameInput?.addEventListener("input", updateCheckoutLink);
tableNumberInput?.addEventListener("input", updateCheckoutLink);
orderNoteInput?.addEventListener("input", updateCheckoutLink);

paymentMethodSelect?.addEventListener("change", (event) => {
  selectedPaymentMethodId = event.target.value || "";
  renderPaymentInstruction();
  updateCheckoutLink();
});

paymentInstruction?.addEventListener("click", async (event) => {
  const button = event.target.closest(".copy-account-button");
  if (!button) return;

  const value = button.dataset.copy || "";

  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "Tersalin";
    window.setTimeout(() => {
      button.textContent = "Salin Rekening";
    }, 1200);
  } catch (_) {
    alert(`Nomor rekening: ${value}`);
  }
});

menuGrid?.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-button");
  const detailButton = event.target.closest(".detail-button");

  if (addButton) {
    addToCart(Number(addButton.dataset.id));
    return;
  }

  if (detailButton) {
    alert(
      `${detailButton.dataset.name}\n\nSilakan tambahkan ke pesanan atau tanyakan detail ke pelayan.`,
    );
  }
});

cartItems?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.action === "increase") {
    increaseCartItem(id);
  }

  if (button.dataset.action === "decrease") {
    decreaseCartItem(id);
  }
});

checkoutButton?.addEventListener("click", (event) => {
  if (cart.length === 0) {
    event.preventDefault();
    alert("Silakan pilih menu terlebih dahulu.");
    return;
  }

  const whatsappNumber = getWhatsappNumber();

  if (!whatsappNumber) {
    event.preventDefault();
    alert("Nomor WhatsApp belum diatur di config.js.");
    return;
  }

  const customerName = customerNameInput?.value.trim() || "";
  const tableNumber = tableNumberInput?.value.trim() || "";

  if (!customerName || !tableNumber) {
    event.preventDefault();
    alert("Mohon isi nama pemesan dan nomor meja terlebih dahulu.");
    return;
  }

  if (!getSelectedPaymentMethod()) {
    event.preventDefault();
    alert("Mohon pilih metode pembayaran terlebih dahulu.");
    return;
  }

  updateCheckoutLink();
});

directWhatsappButton?.addEventListener("click", (event) => {
  const whatsappNumber = getWhatsappNumber();

  if (!whatsappNumber) {
    event.preventDefault();
    alert("Nomor WhatsApp belum diatur di config.js.");
  }
});

cartButton?.addEventListener("click", openCart);
closeCart?.addEventListener("click", closeCartDrawer);
overlay?.addEventListener("click", closeCartDrawer);

navToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCartDrawer();
    navLinks?.classList.remove("open");
  }
});

applyConfigToPage();
renderMenu();
renderPaymentMethods();
renderCart();
