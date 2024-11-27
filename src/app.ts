import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import mongoose from "mongoose";
import routes from "./routes";
import { corsOptions } from "./config/corsOptions";
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();
const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
const port = process.env.SERVER_PORT || 3000;

app.use("/api", routes);
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
  });
  
  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
  });


mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log("Server is running");
  });
});
mongoose.connection.once("error", () => {
  console.log("Error connecting to MongoDB");
});

export default app