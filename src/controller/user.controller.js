import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get details from frontend
    const { fullname, username, email, password } = req.body;
    console.log("Fullname:", fullname);

    //validation -> not empty
    if (
        [fullname, username, email, password].some((field) => {
            field?.trim() === "";
        })
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists: check using email/username
    const existedUser = user.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, "Username or Email already exists");
    }

    //check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    //upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    //create user object -> create entry in db
    const userRef = await user.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
    });

    //remove password and refresh token field from response
    const createdUser = await user
        .findById(user._id)
        .select("-password -refreshToken ");

    //check for user creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    //return response
    return res
        .status(201)
        .json(
            new ApiResponse(200),
            createdUser,
            "user registered successfully"
        );
});

export { registerUser };
