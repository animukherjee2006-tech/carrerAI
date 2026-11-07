
const mongoose = require('mongoose');

const Userschema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    profileimage: {
        type: String,
        default: ""
    },

    // RESUME DETAILS
    resume: {
        fileName: {
            type: String,
            default: ""
        },
        fileUrl: {
            type: String,
            default: ""
        },
        publicId: {
            type: String,
            default: ""
        },
        mimeType: {
            type: String,
            default: ""
        },
        fileSize: {
            type: Number,
            default: 0
        },
        uploadedAt: {
            type: Date,
            default: null
        },
        indexingStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        resumeId: {
            type: String,
            default: ""
        }
    },

    education: [{
        degree: {
            type: String,
            required: true
        },
        college: {
            type: String,
            required: true
        },
        educationYear: {
            type: String,
            required: true
        }
    }],

    targetRole: {
        type: String,
        default: ""
    },

    careerLevel: {
        type: String,
        enum: ['Student', 'Fresher', 'Experienced'],
        default: 'Student'
    },

    skills: [{
        type: String
    }]

}, { timestamps: true });

const userModel = mongoose.model('User', Userschema);

module.exports = userModel;
