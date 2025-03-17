import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    //TODO: toggle like on video
    if (!videoId) throw new ApiError(401, "Video id is required");

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully"));
    }

    await Like.create({
        video: videoId,
        likedBy: userId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    //TODO: toggle like on comment
    if (!commentId) throw new ApiError(401, "Comment id is required");

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Comment unliked successfully"));
    }

    await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;
    //TODO: toggle like on tweet

    if (!tweetId) throw new ApiError(401, "Tweet id is required");

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet unliked successfully"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: userId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) throw new ApiError(401, "User not found");

    const { page = 1, limit = 10 } = req.query;

    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        {
            $unwind: "$videoDetails",
        },
        {
            $project: {
                _id: "$videoDetails._id",
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                thumbnail: "$videoDetails.thumbnail",
                duration: "$videoDetails.duration",
                views: "$videoDetails.views",
                createdAt: "$videoDetails.createdAt",
            },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: parseInt(limit),
        },
    ]);

    if (!likedVideo || likedVideo.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Liked videos fetched successfully",
                likedVideo
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
