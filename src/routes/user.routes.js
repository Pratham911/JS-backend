import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"

const router = Router()

router.route("/Register").post(upload.fields([
    {
        name:"avatar",
        maxCount :1
    },
    {
        name :"coverImage",
        maxCount: 1
    }
])  ,registerUser)

// this upload is a middleware it's use before the registerUser

export default router;