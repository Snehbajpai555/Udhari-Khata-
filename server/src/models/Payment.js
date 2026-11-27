import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  partyType: { type: String, enum: ["Customer", "Supplier"], required: true },
  party: { type: mongoose.Schema.Types.ObjectId, required: true },
  amountPaise: { type: Number, required: true, min: 1 },
  method: { type: String, enum: ["Cash", "UPI", "Bank", "Cheque"], required: true },
  status: { type: String, enum: ["Completed", "Reversed"], default: "Completed" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

paymentSchema.index({ shop: 1, transaction: 1 });

export default mongoose.model("Payment", paymentSchema);
