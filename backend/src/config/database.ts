import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI
        if (!mongoURI) {
            throw new Error("MONGODB_URI enviroument variable is not defined")
        }
        
        await mongoose.connect(mongoURI)
        console.log("Successfully connected to MongoDB!")
    } catch (error) {
        console.error(`MongoDB connection error: ${error}`)
        process.exit(1)
    }
}