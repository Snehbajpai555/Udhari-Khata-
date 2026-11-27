import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exitCode = 1;
});
