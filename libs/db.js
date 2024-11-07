import mongoose from "mongoose";

const DbConnect = async ()=> {
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB is Connected")
    } catch (error) {
        console.log("Database connection Failed", error);
    }
}

export default DbConnect;