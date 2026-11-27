import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["Owner", "Manager", "Staff"], required: true },
    permissions: {
      customers: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true },
      inventory: { type: Boolean, default: true },
      reports: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

staffSchema.index({ shop: 1, user: 1 }, { unique: true });

export default mongoose.model("Staff", staffSchema);
