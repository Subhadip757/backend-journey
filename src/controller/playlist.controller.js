import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?._id;

    if (!userId) throw new ApiError(404, "User not found");

    if (!name || !description)
        throw new ApiError(404, "All the fields are required");

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: [],
    });

    if (!playlist) {
        throw new ApiError(404, "Failed to create Playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist Created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) throw new ApiError(404, "User id is required");

    const pipeline = await Playlist.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) },
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
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                videoCount: { $size: "$videoDetails" },
            },
        },
    ]);

    if (!pipeline.length) throw new ApiError(404, "No playlist from the user");

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Playlist fetched successfully", userPlaylist)
        );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user?._id;

    if (!playlistId) throw new ApiError(404, "Playlist id is required");

    const playlist = await Playlist.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(playlistId) },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
    ]);

    if (!playlist.length) throw new ApiError(404, "Playlist not found");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId)
        throw new ApiError(404, "Playlist ID or Video ID is required");

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new ApiError(404, "Playlist not found");

    if (playlist.video.includes(videoId)) {
        throw new ApiError(404, "video already exists");
    }

    playlist.video.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Added to playlist successfully", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new ApiError(404, "Playlist not found");

    playlist.video = playlist.video.filter((id) => id.toString() !== videoId);

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, "Removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    if (!playlistId) throw new ApiError(404, "Playlist id is required");

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) throw new ApiError(404, "Playlist not found");

    return res
        .status(200)
        .json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?._id;

    if (!name || !description)
        throw new ApiError(404, "Fields cannot be empty");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description },
        },
        {
            new: true,
        }
    );

    if (!updatedPlaylist) throw new ApiError("Playlist not found");
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
