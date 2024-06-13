const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PremuimPostSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    subheading: {
        type: String,
    },
    amount: {
        type: Number,
        required: true
    },
    isHided: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model("PremuimPost", PremuimPostSchema);