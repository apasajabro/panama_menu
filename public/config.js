const appConfig = {
  restaurantName: "Panama Corner",
  brandSubtitle: "Food & Drink Menu",

  whatsappNumber: "6289678199199",
  whatsappGreeting: "Halo Panama Corner, saya ingin pesan:",
  directWhatsappMessage: "Halo Panama Corner, saya ingin pesan.",

  heroTitle: "Makan, ngemil, ngopi — semua ada di sini.",
  heroDescription:
    "Pilih makanan, snack, atau minuman favoritmu langsung dari HP.",

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
    {
      id: "qris",
      name: "QRIS",
      shortLabel: "QRIS",
      description: "Scan QRIS, lalu kirim bukti pembayaran lewat WhatsApp.",
      instruction:
        "Silakan scan QRIS Panama Corner sesuai total pesanan. Setelah membayar, kirim screenshot bukti pembayaran di chat WhatsApp ini.",
      type: "qris",
      qrImage: "assets/payment/qris-panama-corner.jpg",
      note: "Pastikan nominal pembayaran sesuai total pesanan.",
    },
    {
      id: "bank_transfer",
      name: "Transfer Bank",
      shortLabel: "Transfer",
      description: "Transfer ke rekening resto, lalu kirim bukti pembayaran.",
      instruction:
        "Silakan transfer sesuai total pesanan ke salah satu rekening Panama Corner. Setelah membayar, kirim screenshot bukti transfer di chat WhatsApp ini.",
      type: "bank",
      accounts: [
        {
          bankName: "BCA",
          accountNumber: "1234567890",
          accountHolder: "PANAMA CORNER",
        },
        {
          bankName: "BRI",
          accountNumber: "9876543210",
          accountHolder: "PANAMA CORNER",
        },
      ],
      note: "Pesanan diproses setelah pembayaran dikonfirmasi oleh kasir.",
    },
  ],
};
