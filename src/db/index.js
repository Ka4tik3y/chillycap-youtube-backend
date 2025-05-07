import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${db_name}`
    );
    console.log(
      `/n MONGO DB CONNECTED !! HOST: ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("MONGODB CONNNECTION ERROR", error);
    process.exit(1);
  }
};
export default connectDb;
