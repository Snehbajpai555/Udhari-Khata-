import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/Auth.routes.js";
import shopRouter from "./routes/Shop.routes.js";
import customerRouter from "./routes/Customer.routes.js";
import transactionRouter from "./routes/Transaction.routes.js";
import productRouter from "./routes/Product.routes.js";
import supplierRouter from "./routes/Supplier.routes.js";
import invoiceRouter from "./routes/Invoice.routes.js";
import cashbookRouter from "./routes/Cashbook.routes.js";
import reportRouter from "./routes/Report.routes.js";

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
app.use("/auth", authRouter);
app.use("/api/shops", shopRouter);
app.use("/api/customers", customerRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/products", productRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/cashbook", cashbookRouter);
app.use("/api/reports", reportRouter);

app.use((error, req, res, next) => {
  console.error(error);
  if (error?.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "The submitted data is invalid." });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: "A matching record already exists." });
  }
  return res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;
