import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
  type: { type: String, enum: ["Stock In", "Stock Out", "Adjustment", "Sale", "Purchase", "Reversal"], required: true },
  quantity: { type: Number, required: true },
  balanceAfter: { type: Number, required: true, min: 0 },
  unitCostPaise: { type: Number, min: 0, default: null },
  reason: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

stockMovementSchema.index({ shop: 1, product: 1, createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
