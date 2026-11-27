import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  ipAddress: { type: String, default: "" },
}, { timestamps: true });

auditLogSchema.index({ shop: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
