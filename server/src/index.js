import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import router from "./routes/Auth.routes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
app.use("/auth", router);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
