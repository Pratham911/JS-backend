 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req , res ) =>{
    
// get user details from frontend
// validation (not empty)
// check if user already exist :username ,email
// check for image ,check for avatar
// upload to the cloudinary
// create user object- create entry in DB
// remove password and refreshToken field
// check for user creation 
// return response

    const {username , fillname , password , email} = req.body
    console.log( "email=" , email);
    
    // if (fullname ==="") {
    //     throw new ApiError(400 , "fullname is required" )
    // }

    //this if  proved that the any feild is empty then show error
    if ([fullname , username , email ,password].some((field)=>field?.trim()==="")) {
        throw new ApiError(400 , "All fields is required" )
    }
     
    //below this code tell us that find the user that  match this email or username
    //this $or is a operetor
    const existedUser =  User.findOne({
        $or :[{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"user already exists")
    }
    // console.log(res.files);
    const avatarLocalPath = res.files?.avatar[0]?.path;
    const coverimageLocalPath = res.files?.coverimage[0]?.path;

    //this if check in the multer , avatarlocalPath is there or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    //below the code for upload file from multer to cloudinary 

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    //this if check to avatar is avelible on cloudinary
    if (!avatar) {
        throw new ApiError(400, "avatar is required") 
    }

    //below this code use for data entry in DB-ceate user object
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverImage?.url || "",    //this means if the coverimg url available so get it or show empty
        email,
        password,
        username: username.toLowerCase()
    })

    //in select you need to write about what you do not show to user
    const createdUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(404,"user went wrong while registering user" )
    }

    //return response to user
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User register successfully")
    )
})

export default registerUser;