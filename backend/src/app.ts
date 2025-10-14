import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./modules/admins";
import { AppError } from "./packages/error-handler";

// Create app
const app = express();

// Core middleware
const allowedOrigin = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/admins", adminRouter); // e.g. POST /api/admins/create-admin

// 404 handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isKnown = err instanceof AppError;
  const status = isKnown ? err.statusCode : 500;

  if (!isKnown) {
    // eslint-disable-next-line no-console
    console.error("[UnhandledError]", err);
  }

  return res.status(status).json({
    message: err?.message || "Internal Server Error",
    ...(isKnown && err.details ? { details: err.details } : {}),
  });
});

// Start server only if this file is the entry point (avoid auto-start in tests)
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

export default app;