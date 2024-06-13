import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = Schema({
    subscription: {
        type: String,
        default: ""
    }
})

export const Subscription = mongoose.model("Subscriptions", SubscriptionSchema);