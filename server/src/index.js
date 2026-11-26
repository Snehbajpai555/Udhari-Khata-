import express from "express";
import dotenv from "dotenv";
import router from "./routes/Auth.routes.js";

dotenv.config();

const app = express();

app.use("/auth", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
