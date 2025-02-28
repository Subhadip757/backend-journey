import mongoose, { Schema } from "mongoose";

const subcscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, //one who is subcsribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subcscriptionSchema);
