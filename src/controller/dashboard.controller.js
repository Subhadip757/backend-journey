import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get Channel Stats
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Valid Channel ID is required");
    }

    const channelStats = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $group: {
                _id: "$owner",
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalSubscribers: { $size: "$subscribers" },
                totalLikes: { $size: "$likes" },
            },
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalVideos: 1,
                totalSubscribers: 1,
                totalLikes: 1,
            },
        },
    ]);

    if (!channelStats.length) {
        throw new ApiError(404, "Channel stats not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Channel stats fetched successfully",
                channelStats[0]
            )
        );
});

// ✅ Get Channel Videos
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Valid Channel ID is required");
    }

    const channelVideos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } }, // Latest videos first
    ]);

    if (!channelVideos.length) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Channel videos fetched successfully",
                channelVideos
            )
        );
});

export { getChannelStats, getChannelVideos };
