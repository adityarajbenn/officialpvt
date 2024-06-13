const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userDetailsSchema = new Schema(
    {
        influencerId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }, influencerUserName: {
            type: String
            // required: true,
            // ref: 'User'
        }, videoCount: {
            type: Number,
            default: 0,
            // required: true
        }, imageCount: {
            type: Number,
            default: 0,
            // required: true
        }, postCount: {
            type: Number,
            default: 0,
            // required: true
        }, duration: {
            type: Number,
            default: 0,
            // required: true
        }, referredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            // required: true
        }, withdrawlAmount: {
            type: Number,
            default: 0
            // required: true
        }
    }, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}
)

module.exports = mongoose.model('userDetails', userDetailsSchema)
