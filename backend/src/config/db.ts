import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

/**
 * Connects to MongoDB Atlas via Mongoose. Safe to call multiple times —
 * subsequent calls are no-ops once a connection is established.
 */
export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri);
  isConnected = true;

  mongoose.connection.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected");
  });
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
}
