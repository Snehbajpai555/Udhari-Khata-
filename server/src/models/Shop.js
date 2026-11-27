import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessType: {
      type: String,
      required: true,
      enum: ["manufacturer", "retailer", "wholesaler", "affiliate", "service", "other"],
    },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

shopSchema.index({ owner: 1, name: 1 });

export default mongoose.model("Shop", shopSchema);
