const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    },
    secureUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
    // New fields for engagement tracking
    likes: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        default: []
    },
    comments: {
        type: [{
            name:{
                type:String,
                required:false,
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    views: {
        type: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const SolutionVideo = mongoose.model("solutionVideo", videoSchema);

module.exports = SolutionVideo;