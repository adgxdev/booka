import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./modules/admins";
import universityRouter from "./modules/universities";
import userRouter from "./modules/users";
import waitlistRouter from "./modules/waitlists";
import { errorHandler } from "./middlewares/errorHandler";
import booksRouter from "./modules/books";
import { APIError } from "./utils/APIError";
import dotenv from "dotenv";
import { requestId } from "./middlewares/requestId";

dotenv.config();

// Create app
const app = express();

// Core middleware
// Build allowed origins from env vars and localhost; filter falsy values so undefined entries are removed.
const allowedOrigins = [process.env.CLIENT_ORIGIN, process.env.FRONTEND_URL, "http://localhost:3000"].filter(Boolean) as string[];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests like curl, server-to-server, or same-origin requests with no Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(requestId);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/admins", adminRouter);
app.use("/api/universities", universityRouter);
app.use("/api/users", userRouter);
app.use("/api/waitlists", waitlistRouter);
app.use("/api/books", booksRouter);

// 404 handler
app.use((req: Request, _res: Response) => {
  throw APIError.NotFound(`Route ${req.method} ${req.originalUrl} not found`);
});

// Centralized error handler
app.use(errorHandler);

// Start server only if this file is the entry point (avoid auto-start in tests)
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

export default app;