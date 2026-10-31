import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.name} (Host: ${conn.connection.host})`);
  } catch (error: any) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};
