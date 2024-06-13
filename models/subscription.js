const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
    {
        transactionId: {
            type: String,
        },
        orderId: {
            type: String,
        },
        orderCreationId: {
            type: String,
        },
        orderPaymentId: {
            type: String,
        },
        orderSignature: {
            type: String,
        },
        orderStatus: {
            type: String,
            default: "init",
            required: true,
        },
        amount: {
            type: String,
        },
        currency: {
            type: String,
        },
        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "SubscriptionCharges",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        influencerId: {
            type: Schema.Types.ObjectId,
            //   required: true,
            ref: "User",
        },
        purchasedPost: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        },
        premiumPost: {
            type: Schema.Types.ObjectId,
            ref: "PremuimPost",
        },
        startDate: {
            type: Date,
            default: Date.now(),
        },
        expirationDate: {
            type: Date,
        },
        paymentCapture: {
            type: Number,
        },
        catchError: {
            type: String,
        },
        isPlanSubscribed: {
            type: Boolean,
            default: false,
        },
        senderName: {
            type: String,
        },
        message: {
            type: String,
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",
        },
        giftId: {
            type: Schema.Types.ObjectId,
            ref: "Gift",
        },
        callId: {
            type: String,
        },
        referredUserName: {
            type: String,
        },
        paymentMethod: {
            type: String,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
        }, chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
        }, sendMsg: {
            type: String,
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema, 'subscriptions');
