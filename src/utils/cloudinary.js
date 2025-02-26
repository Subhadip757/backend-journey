import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        //upload the file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        //file has been uploaded succussfully
        console.log("File uploaded successfully", response.url);
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload got failed
    }
};

const uploadResult = await cloudinary.uploader
    .upload(
        "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
        {
            public_id: "shoes",
        }
    )
    .catch((error) => {
        console.log(error);
    });

console.log(uploadResult);

export { uploadOnCloudinary };
