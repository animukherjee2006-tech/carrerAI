const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        default: 'Remote'
    },
    jobUrl: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Saved', 'Applied', 'Interviewing', 'Offered', 'Rejected'],
        default: 'Saved'
    },
    matchScore: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    appliedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

ApplicationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
