const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubscriptionChargesSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    subscriptionDetails: [{
        amount: {
            type: Number,
            required: true
        },
        packType: {
            type: String,
            enum: ['30', '90', '180'],
            required: true
        },
        charge_description: {
            type: String,
        }
    },]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model("SubscriptionCharges", SubscriptionChargesSchema, "subscriptionCharges");