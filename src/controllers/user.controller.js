 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshTokens = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken ()

        //then we need to save refreshtoken to db coz of not asking user for password everytime
        user.refreshToken = refreshToken       //this is how we store in db   
        await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500,"somthing wend wrong while generate access and refresh tokens")
    }
}

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

    const {username , fullname , password , email } = req.body
    console.log( "email" , email);
    
    // if (fullname ==="") {
    //     throw new ApiError(400 , "fullname is required" )
    // }

    //this if  proved that the any feild is empty then show error
    if (
        [fullname , username , email ,password].some
        ((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields is required" )
    }
    
    //below this code tell us that find the user that  match this email or username
    //this $or is a operetor
    const existedUser = await User.findOne({
        $or :[{email},{username}]
    })

    if(existedUser){
        throw new ApiError(409,"user already exists")
    }
    // console.log(res.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // console.log("REQ.BODY =", req.body);
    // console.log("REQ.FILES =", req.files);

    //this if check in the multer , avatarlocalPath is there or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "locally avatar is required")
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
        coverImage: coverImage?.url || "",    //this means if the coverimg url available so get it or show empty
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

const loginUser = asyncHandler (async(req ,res ) =>{
    //req-body -> Data
    //username or email 
    //find the user
    // password check
    // generate access and refresh token
    // send this tokens in cookies

    const {username , password , email} = req.body

    if (!username || !email) {
        throw new ApiError(400 , "username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    
    if (!user) {
        throw new ApiError(401 , "user does not exist")
    }
    //User = this user is from db user
    //user = created by me
    const ispasswordvalied = await user.isPasswordCorrect(password)

    if (!ispasswordvalied) {
        throw new ApiError(400,"password is incorrect")
    }

    const {accessToken,refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    //below we send cookie
    const options = {
        httpOnly:true,     //by this modified only backend or server
        secure :true
    }
    return res
    .status(201)
    .cookie("accessToken" ,accessToken ,options)
    .cookie("refreshToken",refreshToken , options)
    .json(
        new ApiResponse(200,{user:loggedIn , accessToken,refreshToken},"user logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req,res) =>{

    await User.findByIdAndUpdate(
        //step1= how to find user
        //step 2 = what you want to update
        req.user._id,
        {
            $set:{
                refreshToken :undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly:true,     //by httponly and secure data true ,data is modified from backend or server
        secure :true
    }
    return res
    .status(200)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken =req.cookies.refreshAccessToken || req.body.refreshAccessToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"incoming Refresh token unauthorisied request ")
    }

   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
 
     const user = await User.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(404,"invalid refresh token")
     }
 
     if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(401,"Refresh token is used or expired")
     }
 
     const options = {
         httpOnly : true,
         secure : true
     }
 
     const {accessToken , newRefreshToken}  =await generateAccessTokenAndRefreshTokens(user._id)
     return res
     .status(201)
     .cookies(accessToken , accessToken ,options)
     .cookies(refreshToken , newRefreshToken ,options)
     .json(
         new ApiResponse(
             202,
             {accessToken ,refreshToken: newRefreshToken},
             "access token successfully"
         )
     )
   } catch (error) {
        throw new ApiError(401 ,error?.message || "invalid refersh token")
   }
})

const changedPassword = asyncHandler(async (req,res) =>{
    
    const {oldPassword ,newPassword} = req.body
    const user = User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(404 , "old password invalid")
    }

    user.password = new newPassword 

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json( new ApiResponse( 200,{} , "password changed succussfully"))

})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user ,"current user fetch succussfully"))

})

const updateAccoutDetail = asyncHandler(async(req,res)=>{

    const {fullname , email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400 ,"All feilds are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                fullname,
                email
            }
        },
        {new : true}       // by this we know our updated detail
    ).select("-password")

    return res
    .status()
    .json(new ApiResponse(200, req.user ,"Account detail update succussfully"))

})

const updateUserAvatar = asyncHandler(async(req,res) =>{

    const avatarLoacalPath = req.file?.path

    if (!avatarLoacalPath) {
        throw new ApiError(404 , "avatar file missingr")
    }

    const avatar = await uploadOnCloudinary(avatarLoacalPath)

    if (!avatar.url) {
        throw new ApiError(404 , "error while uploading")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-passsword")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar update succussfully"))

})

const updateUserCoverImage = asyncHandler(async(req,res) =>{

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(404,"cover image missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400,"error while uploading")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    )
    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image update succussfully"))

})


export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changedPassword,
    getCurrentUser,
    updateAccoutDetail,
    updateUserAvatar,
    updateUserCoverImage
} ;
