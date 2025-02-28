import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("Local file does not exist:", localFilePath);
            return null;
        }

        console.log("Uploading file to Cloudinary:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // console.log("Cloudinary upload response:", response);

        // Delete the local file after upload
        fs.unlinkSync(localFilePath);
        // console.log("Local file deleted:", localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Delete the local file if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(
                "Local file deleted after failed upload:",
                localFilePath
            );
        }

        return null;
    }
};

export { uploadOnCloudinary };
