import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./src/config/env.js";
import { prisma } from "./src/lib/prisma.js";
import { errorHandler, notFound } from "./src/middleware/error-handler.js";
import { originGuard } from "./src/middleware/origin-guard.js";
import authRoutes from "./src/routes/auth.routes.js";
import menuRoutes from "./src/routes/menu.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import settingRoutes from "./src/routes/setting.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import paymentMethodRoutes from "./src/routes/payment-method.routes.js";

const app = express();
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable("x-powered-by");
if (env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
      directives: {
        // Safari dapat memaksa asset localhost HTTP menjadi HTTPS jika directive
        // ini aktif. Development lokal tidak menggunakan sertifikat TLS.
        "upgrade-insecure-requests": env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE"] }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(originGuard);

app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Server API Menu Cafe berjalan!" });
});
app.use("/api/auth", authRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);

app.get("/login", (_req, res) => res.sendFile(path.join(rootDirectory, "public", "login.html")));
app.get("/dashboard", (_req, res) => res.sendFile(path.join(rootDirectory, "public", "dashboard.html")));
app.get("/dashboard/categories", (_req, res) => res.sendFile(path.join(rootDirectory, "public", "categories.html")));
app.get("/dashboard/payment-methods", (_req, res) => res.sendFile(path.join(rootDirectory, "public", "payment-methods.html")));
app.get("/dashboard/settings", (_req, res) => res.sendFile(path.join(rootDirectory, "public", "settings.html")));
app.use("/uploads", express.static(path.join(rootDirectory, "uploads"), {
  dotfiles: "deny",
  fallthrough: false,
  immutable: true,
  maxAge: "30d",
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
}));

app.use(express.static(path.join(rootDirectory, "public"), { index: "index.html", dotfiles: "deny" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return notFound(req, res);
  if (req.accepts("html")) return res.status(404).sendFile(path.join(rootDirectory, "public", "404.html"));
  return next();
});
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`PANAMA CORNER berjalan di http://localhost:${env.PORT}`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} diterima. Menutup server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
