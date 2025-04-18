import {v2 as cloudinary} from "cloudinary";
import { response } from "express";
import fs from 'fs';       //file system


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
});


const localfile = "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg"
const uploadResult = async (localfile) => {
        try{
            if(!localfile) return null //upload the file on cloudinary
                const responec= await cloudinary.uploader.upload
                (localfile ,{
                    resource_type :"auto"
                })
                //uplosded successfully
                console.log("file uploaded", response.url);
                return response;
        }catch(error){
            fs.unlinkSync(localfile)     //remove locally save temporary file as the uploaded opretion got failed
            return null
        }
    }

export {uploadResult};