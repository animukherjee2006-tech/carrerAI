const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
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
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        default: 'Full-time'
    },
    experienceLevel: {
        type: String,
        enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead'],
        default: 'Entry Level'
    },
    salary: {
        type: String,
        default: '$85,000 - $115,000'
    },
    description: {
        type: String,
        required: true
    },
    skillsRequired: [{
        type: String
    }],
    applyUrl: {
        type: String,
        default: '#'
    },
    source: {
        type: String,
        default: 'CareerAI Verified Jobs'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

JobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', JobSchema);
