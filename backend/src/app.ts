import express from "express";
import {
  requestIdMiddleware,
  requestTimeMiddleware,
  requestLoggerMiddleware,
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  maintenanceMiddleware,
  notFoundMiddleware,
  errorMiddleware,
} from "./middleware";
import { authRouter } from "./modules/auth";
import { usersRouter } from "./modules/users";
import { companiesRouter } from "./modules/companies";
import { departmentsRouter } from "./modules/departments";
import { recruitersRouter } from "./modules/recruiters";
import { jobsRouter } from "./modules/jobs";
import { candidateRouter } from "./modules/candidates";


const app = express();

// 1. Request ID and Timing Metadata
app.use(requestIdMiddleware);
app.use(requestTimeMiddleware);

// 2. Request Logging
app.use(requestLoggerMiddleware);

// 3. Global Security & Limits
app.use(helmetMiddleware());
app.use(corsMiddleware());
app.use(generalLimiter);

// 4. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Maintenance Mode Check
app.use(maintenanceMiddleware);

// 6. Application Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/recruiters", recruitersRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/candidates", candidateRouter);

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
