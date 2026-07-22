import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middlewares/rateLimiter";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import propertiesRoutes from "./modules/properties/property.routes";
import leasesRoutes from "./modules/leases/leases.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import messagesRoutes from "./modules/messages/messages.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";



const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser())
// app.use(globalLimiter)

app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api", reviewsRoutes);

export default app;
