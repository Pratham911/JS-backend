import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";

dotenv.config({
    path: './.env'
})

connectDB() 
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})






/* APPROCH 1 BY IIFA
import express from "express";

const app = express();


(async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Connected to database");
        app.on("error",(err)=>{
            console.log("Error",err);
            throw err
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("error",error);
        throw error
    }
})()

*/

