import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.mongodb_URI, {
            dbName: "UserInfo",
        })
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error)
    }
}

export default connectDb;