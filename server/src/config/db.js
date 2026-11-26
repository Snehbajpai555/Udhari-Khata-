import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully.");
};

export default connectDB;
