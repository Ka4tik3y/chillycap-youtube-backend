import connectDb from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path: './env'
})



connectDb ();






// import mongoose from "mongoose";
// import { db_name } from "./constants";
// import express from "express";
// const app = express;

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`);
//     app.on("error", (error) => {
//       console.log("error", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listning on PORT ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR", error);
//   }
// })();
 

