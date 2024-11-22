import mongoose from "mongoose";

const connectDB: () => Promise<void> = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL!);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

export default connectDB;