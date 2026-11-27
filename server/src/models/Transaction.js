import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  reference: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, default: null },
  type: {
    type: String,
    required: true,
    enum: ["Credit Given", "Payment Received", "Cash Sale", "Expense", "Purchase", "Supplier Payment", "Reversal"],
  },
  transactionDate: { type: Date, required: true, default: Date.now },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
  amountPaise: { type: Number, required: true, min: 0 },
  amountPaidPaise: { type: Number, default: 0, min: 0 },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank", "Cheque", "Credit"], default: "Cash" },
  description: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["Completed", "Reversed"], default: "Completed" },
  reversalOf: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

transactionSchema.index({ shop: 1, transactionDate: -1 });
transactionSchema.index(
  { shop: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
    name: "shop_1_idempotencyKey_1",
  },
);
transactionSchema.set("autoIndex", false);

export default mongoose.model("Transaction", transactionSchema);
