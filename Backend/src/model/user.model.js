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
    profileImagePublicId: {
        type: String,
        default: ""
    },

    headline: {
        type: String,
        default: "Software Engineer | Aspiring Technologist"
    },

    bio: {
        type: String,
        default: ""
    },

    githubUsername: {
        type: String,
        default: ""
    },

    portfolioUrl: {
        type: String,
        default: ""
    },

    linkedinUrl: {
        type: String,
        default: ""
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
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
        },
        rawText: {
            type: String,
            default: ""
        }
    },

    // ATS & RESUME ANALYSIS CACHE
    resumeAnalysis: {
        overallScore: { type: Number, default: 0 },
        atsCompatibility: { type: Number, default: 0 },
        impactScore: { type: Number, default: 0 },
        brevityScore: { type: Number, default: 0 },
        skillsFound: [{ type: String }],
        missingSkills: [{ type: String }],
        summary: { type: String, default: "" },
        sectionFeedback: [{
            section: { type: String },
            status: { type: String },
            feedback: { type: String }
        }],
        bulletImprovements: [{
            original: { type: String },
            improved: { type: String }
        }],
        analyzedAt: { type: Date, default: null }
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

    experience: [{
        title: { type: String, default: "" },
        company: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" }
    }],

    targetRole: {
        type: String,
        default: "Full Stack Developer"
    },

    careerLevel: {
        type: String,
        enum: ['Student', 'Fresher', 'Experienced'],
        default: 'Student'
    },

    skills: [{
        type: String
    }],

    preferences: {
        theme: { type: String, default: 'dark' },
        jobAlerts: { type: Boolean, default: true },
        targetLocations: [{ type: String }],
        expectedSalary: { type: String, default: "" }
    }

}, { timestamps: true });

const userModel = mongoose.model('User', Userschema);

module.exports = userModel;
