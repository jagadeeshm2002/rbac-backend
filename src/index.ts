import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import mongoose from "mongoose";
import routes from "./routes";

dotenv.config();
connectDB();
const app: Express = express();
app.use(express.json());
app.use(cors());
const port = process.env.SERVER_PORT || 3000;

app.use("/api", routes);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log("Server is running");
  });
});
mongoose.connection.once("error", () => {
  console.log("Error connecting to MongoDB");
});
