import express from "express";
import {
  requestIdMiddleware,
  requestTimeMiddleware,
  requestLoggerMiddleware,
  helmetMiddleware,
  corsMiddleware,
  createRateLimiter,
  maintenanceMiddleware,
  notFoundMiddleware,
  errorMiddleware,
} from "./middleware";

const app = express();

// 1. Request ID and Timing Metadata
app.use(requestIdMiddleware);
app.use(requestTimeMiddleware);

// 2. Request Logging
app.use(requestLoggerMiddleware);

// 3. Global Security & Limits
app.use(helmetMiddleware());
app.use(corsMiddleware());
app.use(createRateLimiter());

// 4. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Maintenance Mode Check
app.use(maintenanceMiddleware);

// 6. Application Routes
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "HireStack API is running 🚀",
  });
});

// 7. Not Found and Global Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
