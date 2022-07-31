import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });
    console.log("DATABASE CONNECTED");
  } catch {
    console.log("ERROR OCCURED");
    process.exit(1);
  }
};

export default connectDB;
