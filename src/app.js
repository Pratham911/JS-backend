import cookieParser from "cookie-parser";
import cors from "cors";
import express, { urlencoded } from "express";


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

//data get in virous form like ulr,file,json
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended:true ,limit:"16kb"}))
app.use(express.static("public") )
app.use(cookieParser())


//routes
import userRouter from "./controllers/user.controller.js"


//routes decleration 
app.use("/api/v1/users" , userRouter)   //this code going to routes file in. user


export default app;

