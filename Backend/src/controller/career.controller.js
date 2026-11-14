const User = require('../model/user.model');
const Interview = require('../model/interview.model');
const Roadmap = require('../model/roadmap.model');
const Application = require('../model/application.model');
const Job = require('../model/job.model');
const {
    analyzeResumeAI,
    matchResumeWithJobAI,
    generateCareerGuidanceAI,
    analyzeSkillGapAI,
    generateRoadmapAI,
    analyzeGithubAI
} = require('../services/ai.service');

// 1. DASHBOARD OVERVIEW & METRICS
const getDashboardOverview = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Calculate Profile Completion
        let profileFields = 0;
        const totalFields = 6;
        if (user.name) profileFields++;
        if (user.profileimage) profileFields++;
        if (user.education && user.education.length > 0) profileFields++;
        if (user.skills && user.skills.length > 0) profileFields++;
        if (user.targetRole) profileFields++;
        if (user.resume && user.resume.fileUrl) profileFields++;
        const profileCompletion = Math.round((profileFields / totalFields) * 100);

        // 2. Resume Score
        const resumeScore = user.resumeAnalysis?.overallScore || (user.resume?.fileUrl ? 75 : 0);

        // 3. Interview Activity & Average Score
        const interviews = await Interview.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
        const avgInterviewScore = interviews.length > 0
            ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviews.length)
            : 0;

        // 4. Roadmap Progress
        const roadmap = await Roadmap.findOne({ user: user._id });
        const roadmapProgress = roadmap?.overallProgress || 0;

        // 5. Job Applications
        const applications = await Application.find({ user: user._id }).sort({ updatedAt: -1 }).limit(5);
        const savedJobsCount = await Application.countDocuments({ user: user._id, status: 'Saved' });
        const activeApplicationsCount = await Application.countDocuments({ user: user._id, status: { $in: ['Applied', 'Interviewing'] } });

        // 6. Overall Career Readiness Score (weighted formula)
        // Profile completion (20%), Resume score (30%), Roadmap progress (25%), Interview prep (25%)
        const careerReadinessScore = Math.round(
            (profileCompletion * 0.20) +
            (resumeScore * 0.30) +
            (roadmapProgress * 0.25) +
            (avgInterviewScore > 0 ? avgInterviewScore * 0.25 : (user.skills?.length > 3 ? 15 : 5))
        );

        // 7. Recent Activity feed
        const recentActivity = [];
        if (user.resume?.uploadedAt) {
            recentActivity.push({
                type: 'resume',
                title: 'Resume Analyzed',
                description: `ATS score: ${resumeScore}% for ${user.targetRole}`,
                date: user.resume.uploadedAt
            });
        }
        interviews.forEach(int => {
            recentActivity.push({
                type: 'interview',
                title: `${int.interviewType} Interview Completed`,
                description: `Score: ${int.overallScore}/100 with ${int.questions.length} questions answered`,
                date: int.createdAt
            });
        });
        applications.forEach(app => {
            recentActivity.push({
                type: 'job',
                title: `Job ${app.status}: ${app.jobTitle}`,
                description: `${app.company} • ${app.location}`,
                date: app.updatedAt
            });
        });
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 8. Recommended Jobs preview
        const recommendedJobs = await Job.find({ isActive: true }).limit(4).lean();

        // 9. Personalized suggestions
        const suggestions = [];
        if (!user.resume?.fileUrl) {
            suggestions.push({
                title: 'Upload your Resume',
                description: 'Get an instant ATS compatibility score and missing skills analysis.',
                action: '/resume-analyzer',
                icon: 'FileText'
            });
        } else if (resumeScore < 80) {
            suggestions.push({
                title: 'Boost Resume ATS Score',
                description: 'Incorporate quantifiable metrics and missing high-impact technical keywords.',
                action: '/resume-analyzer',
                icon: 'TrendingUp'
            });
        }

        if (interviews.length === 0) {
            suggestions.push({
                title: 'Practice AI Mock Interview',
                description: 'Test your technical depth and system design in realistic interactive simulations.',
                action: '/interview-prep',
                icon: 'MessageSquare'
            });
        }

        if (!roadmap) {
            suggestions.push({
                title: 'Generate Career Roadmap',
                description: `Set up a structured ${user.targetRole} milestone timeline.`,
                action: '/roadmap',
                icon: 'Compass'
            });
        }

        return res.status(200).json({
            success: true,
            dashboard: {
                user: {
                    name: user.name,
                    email: user.email,
                    headline: user.headline,
                    targetRole: user.targetRole,
                    careerLevel: user.careerLevel,
                    skills: user.skills || [],
                    profileimage: user.profileimage
                },
                metrics: {
                    careerReadinessScore,
                    resumeScore,
                    profileCompletion,
                    roadmapProgress,
                    avgInterviewScore,
                    interviewsCount: interviews.length,
                    savedJobsCount,
                    activeApplicationsCount
                },
                recentActivity: recentActivity.slice(0, 5),
                recommendedJobs,
                suggestions
            }
        });

    } catch (error) {
        console.error('Dashboard Overview Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load dashboard overview' });
    }
};

// 2. RESUME ANALYZER CONTROLLER
const getResumeAnalysis = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            resume: user.resume,
            analysis: user.resumeAnalysis
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const reanalyzeResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { targetRole, careerLevel, resumeText } = req.body;
        const textToAnalyze = resumeText || user.resume?.rawText || `Resume of ${user.name} specializing in ${user.skills?.join(', ')}`;

        const analysis = await analyzeResumeAI({
            resumeText: textToAnalyze,
            targetRole: targetRole || user.targetRole || 'Software Engineer',
            careerLevel: careerLevel || user.careerLevel || 'Fresher'
        });

        user.resumeAnalysis = {
            ...analysis,
            analyzedAt: new Date()
        };
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Resume re-analyzed successfully',
            analysis: user.resumeAnalysis
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const matchResumeWithJob = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { jobDescription, targetRole } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ success: false, message: 'Job description is required' });
        }

        const resumeText = user.resume?.rawText || `Skills: ${user.skills?.join(', ')}. Target: ${user.targetRole}`;
        const matchResult = await matchResumeWithJobAI({
            resumeText,
            jobDescription,
            targetRole: targetRole || user.targetRole
        });

        return res.status(200).json({
            success: true,
            data: matchResult
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. CAREER GUIDANCE
const getCareerGuidance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const targetRole = req.query.targetRole || user.targetRole || 'Full Stack Developer';
        const careerLevel = req.query.careerLevel || user.careerLevel || 'Fresher';

        const guidance = await generateCareerGuidanceAI({
            targetRole,
            careerLevel,
            currentSkills: user.skills || []
        });

        return res.status(200).json({ success: true, guidance });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. SKILL GAP ANALYZER
const getSkillGap = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const targetRole = req.query.targetRole || user.targetRole || 'Full Stack Developer';

        const skillGap = await analyzeSkillGapAI({
            targetRole,
            currentSkills: user.skills || []
        });

        return res.status(200).json({ success: true, skillGap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. CAREER ROADMAP
const getRoadmap = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let roadmap = await Roadmap.findOne({ user: user._id });

        if (!roadmap) {
            // Generate initial roadmap
            const generated = await generateRoadmapAI({
                targetRole: user.targetRole || 'Full Stack Developer',
                careerLevel: user.careerLevel || 'Fresher',
                timeframeMonths: 6,
                currentSkills: user.skills || []
            });

            roadmap = await Roadmap.create({
                user: user._id,
                targetRole: generated.targetRole,
                careerLevel: user.careerLevel || 'Fresher',
                timeframeMonths: 6,
                phases: generated.phases,
                overallProgress: 0
            });
        }

        return res.status(200).json({ success: true, roadmap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateRoadmapGoal = async (req, res) => {
    try {
        const { phaseIndex, goalIndex, completed } = req.body;
        const roadmap = await Roadmap.findOne({ user: req.user.id });

        if (!roadmap) {
            return res.status(404).json({ success: false, message: 'Roadmap not found' });
        }

        if (roadmap.phases[phaseIndex] && roadmap.phases[phaseIndex].goals[goalIndex]) {
            roadmap.phases[phaseIndex].goals[goalIndex].completed = Boolean(completed);

            // Re-calculate progress
            let totalGoals = 0;
            let completedGoals = 0;
            roadmap.phases.forEach(phase => {
                let phaseAllDone = true;
                phase.goals.forEach(g => {
                    totalGoals++;
                    if (g.completed) completedGoals++;
                    else phaseAllDone = false;
                });
                phase.completed = phaseAllDone && phase.goals.length > 0;
            });

            roadmap.overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
            await roadmap.save();
        }

        return res.status(200).json({ success: true, roadmap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const regenerateRoadmap = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { targetRole, timeframeMonths } = req.body;

        const generated = await generateRoadmapAI({
            targetRole: targetRole || user.targetRole,
            careerLevel: user.careerLevel,
            timeframeMonths: timeframeMonths || 6,
            currentSkills: user.skills || []
        });

        const roadmap = await Roadmap.findOneAndUpdate(
            { user: user._id },
            {
                targetRole: generated.targetRole,
                timeframeMonths: timeframeMonths || 6,
                phases: generated.phases,
                overallProgress: 0
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, roadmap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. GITHUB ANALYSIS
const analyzeGithub = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { username } = req.body;
        const gitUser = username || user.githubUsername || 'developer';

        const result = await analyzeGithubAI({ username: gitUser });

        if (username && username !== user.githubUsername) {
            user.githubUsername = username;
            await user.save();
        }

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardOverview,
    getResumeAnalysis,
    reanalyzeResume,
    matchResumeWithJob,
    getCareerGuidance,
    getSkillGap,
    getRoadmap,
    updateRoadmapGoal,
    regenerateRoadmap,
    analyzeGithub
};
