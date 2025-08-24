import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        mongoose.connection.on('error', (err) => console.error("Database connection error:", err));
        mongoose.connection.on('disconnected', () => console.log("Database Disconnected"));

        await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
};

export default connectDB;
