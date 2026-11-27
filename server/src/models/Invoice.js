import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPricePaise: { type: Number, required: true, min: 0 },
  lineTotalPaise: { type: Number, required: true, min: 0 },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  reference: { type: String, required: true },
  items: { type: [invoiceItemSchema], required: true },
  subtotalPaise: { type: Number, required: true, min: 0 },
  discountPaise: { type: Number, default: 0, min: 0 },
  totalPaise: { type: Number, required: true, min: 0 },
  amountPaidPaise: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["Paid", "Partial", "Unpaid", "Reversed"], default: "Unpaid" },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Bank", "Cheque", "Credit"], default: "Cash" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

invoiceSchema.index({ shop: 1, reference: 1 }, { unique: true });
invoiceSchema.index({ shop: 1, createdAt: -1 });

export default mongoose.model("Invoice", invoiceSchema);
