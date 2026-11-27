import mongoose from "mongoose";
import { ensureTransactionIndexes } from "../utils/ensureTransactionIndexes.js";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  await mongoose.connect(mongoUri);
  await ensureTransactionIndexes();
  console.log("MongoDB connected successfully.");
};

export default connectDB;
