const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReferSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referee_email: {
        type: String,
        required: true
    },
    refereeId: {
        type: Schema.Types.ObjectId,
    },
    user_points: {
        type: Number
    },
    referee_points: {
        type: Number
    },
    commision: {
        type: Number
    },
    isJoined: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model("Refer", ReferSchema, "refer");