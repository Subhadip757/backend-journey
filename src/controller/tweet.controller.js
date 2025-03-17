import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;
    const userId = req.user?._id;

    if (!tweet) throw new ApiError(400, "Tweet content is required");

    const createdTweet = await Tweet.create({
        tweet,
        likedBy: userId,
    });

    if (!createdTweet) throw new ApiError(500, "Failed to create tweet");

    return res
        .status(201)
        .json(new ApiResponse(201, "Tweet created successfully", createdTweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId))
        throw new ApiError(400, "Valid User ID is required");

    const tweets = await Tweet.aggregate([
        {
            $match: { likedBy: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        {
            $unwind: "$userDetails",
        },
        {
            $project: {
                _id: 1,
                tweet: 1,
                createdAt: 1,
                "userDetails.username": 1,
                "userDetails.email": 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

    if (!tweets.length) throw new ApiError(404, "No tweets found");

    return res
        .status(200)
        .json(new ApiResponse(200, "User tweets fetched successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { tweet } = req.body;

    if (!tweetId || !isValidObjectId(tweetId))
        throw new ApiError(400, "Valid Tweet ID is required");

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { tweet },
        { new: true }
    );

    if (!updatedTweet) throw new ApiError(404, "Tweet not found");

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId))
        throw new ApiError(400, "Valid Tweet ID is required");

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) throw new ApiError(404, "Tweet not found");

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
