import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  amountPaise: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank", "Cheque"], required: true },
  description: { type: String, trim: true, default: "" },
  expenseDate: { type: Date, required: true, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

expenseSchema.index({ shop: 1, expenseDate: -1 });

export default mongoose.model("Expense", expenseSchema);
