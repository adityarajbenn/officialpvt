const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        userType: {
            type: String,
            enum: ['influencer', 'user', 'agency', 'admin'],
            required: true
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            match: [/^[\w&.\-]+$/]
        },
        name: {
            type: String
        },
        message: {
            type: String
        },
        instagram: {
            type: String
            // unique: true,
        },
        facebook: {
            type: String

            // unique: true,
        },
        twitter: {
            type: String
        },
        linkedin: {
            type: String
        },
        addMoreLinks: [
            {
                image: {
                    type: String
                },
                link: {
                    type: String
                },
                name: {
                    type: String
                }
            }
        ],
        email: {
            type: String,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        password: {
            type: String,
            match: [
                /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{8,}/,
                'Password should have atleast 8 characters, 1 special character, 1 capital alphabet, 1 small alphabet and 1 digit.'
            ]
        },
        userProfileImage: {
            type: String
        },

        userBio: {
            type: String
        },

        bankDetails: {
            accountNumber: {
                type: Number
            },
            accountHolderName: {
                type: String
            },
            ifsc: {
                type: String
            },
            bankName: {
                type: String
            },
            address: {
                type: String
            }
        },
        address: {
            type: String
        },
        referredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        influencer: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        user: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        isVerifiedEmail: {
            type: Boolean,
            default: false
        },
        lastActive: {
            type: Date,
            default: Date
        },
        commission: {
            type: Number,
            default: 0.25
        },
        referralCommission: {
            type: Number,
            default: process.env.INFLUENCER_COMMISSION
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        currency: {
            type: String
        },
        country: {
            type: String
        },
        referralType: {
            type: String,
            enum: ['agency', 'influencer']
        },
        referralKey: {
            type: String,
            unique: true,
            sparse: true
        },
        isCloudFlareEnabled: {
            // This is for testing purposes
            type: Boolean,
            default: true
        },
        isBlacklisted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('User', userSchema);
