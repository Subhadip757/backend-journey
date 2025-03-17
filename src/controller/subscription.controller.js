import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    if (!channelId) throw new ApiError(404, "channel id is required");

    const existingSubscription = await Subscription.findOne({
        channel: userId,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Channel unsubcribed successfully"));
    }

    await Subscription.create({
        channel: userId,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Subscription added successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId || !isValidObjectId(channelId))
        throw new ApiError(404, "channelId is required");

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
            },
        },
        {
            $unwind: "$subscriberDetails",
        },
        {
            $project: {
                _id: 1,
                "subscriberDetails.username": 1,
                "subscriberDetails.email": 1,
                "subscriberDetails.createdAt": 1,
            },
        },
    ]);

    if (!subscribers.length)
        throw new ApiError(404, "No subscribers found for this channel");

    return res.status(200).json();
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!subscriberId) throw new ApiError(404, "subscriber id is required");

    const subscribed = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
        },
        {
            $lookup: {
                form: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
            },
        },
        {
            $unwind: "channelDetails",
        },
        {
            $project: {
                _id: 1,
                "channelDetails.username": 1,
                "channelDetails.email": 1,
                "channelDetails.createdAt": 1,
            },
        },
    ]);

    if (!channel.length) throw new ApiError(404, "No channels subscribed");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Subscribed channels fetched successfully",
                subscribed
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
