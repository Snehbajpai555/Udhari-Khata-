import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, required: true, trim: true },
  address: { type: String, trim: true, default: "" },
  category: { type: String, enum: ["Regular", "Retail", "Wholesale"], default: "Regular" },
  openingBalancePaise: { type: Number, default: 0, min: 0 },
  outstandingPaise: { type: Number, default: 0, min: 0 },
  creditLimitPaise: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

customerSchema.index({ shop: 1, phone: 1 });
customerSchema.index({ shop: 1, name: 1 });

export default mongoose.model("Customer", customerSchema);
