const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetRole: {
        type: String,
        required: true,
        default: 'Full Stack Developer'
    },
    careerLevel: {
        type: String,
        default: 'Fresher'
    },
    timeframeMonths: {
        type: Number,
        default: 6
    },
    phases: [{
        phaseNumber: { type: Number, required: true },
        title: { type: String, required: true },
        duration: { type: String, required: true },
        completed: { type: Boolean, default: false },
        goals: [{
            text: { type: String, required: true },
            completed: { type: Boolean, default: false }
        }]
    }],
    overallProgress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

RoadmapSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Roadmap', RoadmapSchema);
