import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  sku: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, trim: true, default: "General" },
  purchasePricePaise: { type: Number, required: true, min: 0 },
  sellingPricePaise: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  minimumStock: { type: Number, default: 0, min: 0 },
  expiryDate: { type: Date, default: null },
  active: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ shop: 1, sku: 1 }, { unique: true });
productSchema.index({ shop: 1, name: 1 });

export default mongoose.model("Product", productSchema);
