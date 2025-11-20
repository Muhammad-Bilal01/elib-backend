import mongoose from "mongoose";
import { config } from "./config.ts";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to database successfully!");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Error: Connection Failed,", err);
    });

    await mongoose.connect(config.databaseUrl ?? "");
  } catch (error) {
    console.error("Error: Connection Failed,", error);
    process.exit(1);
  }
};

export default connectDb;
