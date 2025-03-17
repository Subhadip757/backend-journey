import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
