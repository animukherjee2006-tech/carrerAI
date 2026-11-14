const Interview = require('../model/interview.model');
const User = require('../model/user.model');
const {
    generateInterviewQuestionsAI,
    evaluateInterviewAnswerAI
} = require('../services/ai.service');

// 1. START NEW INTERVIEW SESSION
const startInterview = async (req, res) => {
    try {
        const { targetRole, interviewType, count = 5 } = req.body;
        const user = await User.findById(req.user.id);

        const role = targetRole || user.targetRole || 'Software Engineer';
        const type = interviewType || 'Technical';
        const level = user.careerLevel || 'Fresher';

        const questions = await generateInterviewQuestionsAI({
            targetRole: role,
            careerLevel: level,
            interviewType: type,
            count
        });

        const formattedQuestions = questions.map((q, idx) => ({
            question: q.question || q.text || `Question ${idx + 1}`,
            category: q.category || 'General Competency',
            difficulty: q.difficulty || 'Medium',
            answer: '',
            score: 0,
            strengths: [],
            weaknesses: [],
            rubric: { clarity: 0, technicalAccuracy: 0, depth: 0 },
            modelAnswer: ''
        }));

        const interview = await Interview.create({
            user: user._id,
            targetRole: role,
            interviewType: type,
            careerLevel: level,
            overallScore: 0,
            questions: formattedQuestions,
            status: 'in-progress'
        });

        return res.status(201).json({
            success: true,
            interview
        });

    } catch (error) {
        console.error('Start Interview Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate interview questions' });
    }
};

// 2. SUBMIT ANSWER AND EVALUATE
const submitAnswer = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { questionIndex, answer } = req.body;

        const interview = await Interview.findOne({ _id: interviewId, user: req.user.id });
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview session not found' });
        }

        const q = interview.questions[questionIndex];
        if (!q) {
            return res.status(400).json({ success: false, message: 'Invalid question index' });
        }

        const evaluation = await evaluateInterviewAnswerAI({
            question: q.question,
            answer: answer || '',
            targetRole: interview.targetRole,
            interviewType: interview.interviewType
        });

        q.answer = answer;
        q.score = evaluation.score || 70;
        q.strengths = evaluation.strengths || [];
        q.weaknesses = evaluation.weaknesses || [];
        q.rubric = evaluation.rubric || { clarity: 7, technicalAccuracy: 7, depth: 7 };
        q.modelAnswer = evaluation.modelAnswer || '';

        // Recalculate overall score across answered questions
        const answered = interview.questions.filter(item => item.answer && item.answer.trim().length > 0);
        if (answered.length > 0) {
            const sum = answered.reduce((acc, curr) => acc + curr.score, 0);
            interview.overallScore = Math.round(sum / answered.length);
        }

        if (answered.length === interview.questions.length) {
            interview.status = 'completed';
        }

        await interview.save();

        return res.status(200).json({
            success: true,
            evaluation,
            interview
        });

    } catch (error) {
        console.error('Submit Answer Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to evaluate answer' });
    }
};

// 3. GET INTERVIEW HISTORY
const getInterviewHistory = async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-questions.modelAnswer')
            .lean();

        return res.status(200).json({
            success: true,
            interviews
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. GET SINGLE INTERVIEW DETAILS
const getInterviewDetails = async (req, res) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.interviewId, user: req.user.id });
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        return res.status(200).json({ success: true, interview });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    startInterview,
    submitAnswer,
    getInterviewHistory,
    getInterviewDetails
};
