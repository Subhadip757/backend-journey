import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const pipeline = [
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) },
        },
        {
            $lookup: {
                from: "users", // Refers to the "User" collection
                localField: "owner", // Field in "Comment"
                foreignField: "_id", // Field in "User"
                as: "userDetails",
            },
        },
        {
            $unwind: "$userDetails",
        },
        {
            $project: {
                content: 1,
                "userDetails.fullname": 1, // Select only the user's name
                createdAt: 1,
            },
        },
        {
            $sort: { createdAt: -1 }, // Latest comments first
        },
    ];

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate(pipeline),
        options
    );

    if (!comments || comments.docs.length === 0) {
        throw new ApiError(404, "No comments found for this video");
    }

    res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", comments)
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content, videoId } = req.body;

    const userId = req.user._id;

    if (!content) {
        throw new ApiError(400, "Comment cannot be empty");
    }
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { newComment } = req.body;
    const userId = req.user?._id;

    // Validate input
    if (!newComment?.trim()) {
        throw new ApiError(400, "New comment cannot be empty");
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    // Check if the comment exists
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the authenticated user is the owner of the comment
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    // Update the comment content
    comment.content = newComment;

    // Save the updated comment to the database
    await comment.save();

    // Return the response
    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);

    if (!comment) throw new ApiError(400, "Comment not found");

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(
            400,
            "You are not authorized to delete this comment"
        );
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment Deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
