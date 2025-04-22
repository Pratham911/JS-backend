
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuring Cloudinary with environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded:", response.url);
        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        // Remove the local file if upload fails
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadOnCloudinary };
