const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetRole: {
        type: String,
        required: true,
        default: 'Software Engineer'
    },
    interviewType: {
        type: String,
        enum: ['Technical', 'Behavioral', 'HR', 'System Design'],
        default: 'Technical'
    },
    careerLevel: {
        type: String,
        default: 'Fresher'
    },
    overallScore: {
        type: Number,
        default: 0
    },
    questions: [{
        question: { type: String, required: true },
        category: { type: String, default: 'General' },
        difficulty: { type: String, default: 'Medium' },
        answer: { type: String, default: '' },
        score: { type: Number, default: 0 },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        rubric: {
            clarity: { type: Number, default: 0 },
            technicalAccuracy: { type: Number, default: 0 },
            depth: { type: Number, default: 0 }
        },
        modelAnswer: { type: String, default: '' }
    }],
    feedbackSummary: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'completed'
    }
}, { timestamps: true });

InterviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', InterviewSchema);
