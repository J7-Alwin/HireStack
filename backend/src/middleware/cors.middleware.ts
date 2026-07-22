import { RequestHandler } from "express";
import cors from "cors";
import { env } from "../config";

export const corsMiddleware = (): RequestHandler => {
  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [env.CLIENT_URL];

      // In development, allow localhost origins
      if (process.env.NODE_ENV === "development") {
        if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Request-ID"],
  }) as RequestHandler;
};
