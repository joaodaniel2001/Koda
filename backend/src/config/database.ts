import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log("Successfully connected to MongoDB!")
    } catch (error) {
        console.error(`MongoDB connection error: ${error}`)
        process.exit(1)
    }
}