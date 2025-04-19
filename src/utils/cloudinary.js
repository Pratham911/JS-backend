import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';       //file system


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
});


// const localfilePath = "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg"
const uploadOnCloudinary = async (localfilePath) => {
        try{
            if(!localfilePath) return null //upload the file on cloudinary
                const response= await cloudinary.uploader.upload
                (localfilePath ,{
                    resource_type :"auto"
                })
                //uplosded successfully
                console.log("file uploaded", response.url);
                return response;
                // console.log(response);
                
        }catch(error){
            fs.unlinkSync(localfilePath)     //remove locally save temporary file as the uploaded opretion got failed
            return null
        }
    }

export {uploadOnCloudinary};