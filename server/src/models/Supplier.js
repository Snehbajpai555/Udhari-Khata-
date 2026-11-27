import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, lowercase: true, default: "" },
  address: { type: String, trim: true, default: "" },
  outstandingPaise: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

supplierSchema.index({ shop: 1, name: 1 });

export default mongoose.model("Supplier", supplierSchema);
