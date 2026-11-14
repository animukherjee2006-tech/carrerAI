const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/auth.middleware');
const {
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
} = require('../controller/career.controller');

// Dashboard metrics
router.get('/dashboard', authmiddleware, getDashboardOverview);

// Resume Analysis
router.get('/resume/analysis', authmiddleware, getResumeAnalysis);
router.post('/resume/reanalyze', authmiddleware, reanalyzeResume);
router.post('/resume/match-job', authmiddleware, matchResumeWithJob);

// Career Guidance & Skill Gap
router.get('/guidance', authmiddleware, getCareerGuidance);
router.get('/skill-gap', authmiddleware, getSkillGap);

// Roadmap
router.get('/roadmap', authmiddleware, getRoadmap);
router.put('/roadmap/goal', authmiddleware, updateRoadmapGoal);
router.post('/roadmap/regenerate', authmiddleware, regenerateRoadmap);

// GitHub Analysis
router.post('/github/analyze', authmiddleware, analyzeGithub);

module.exports = router;
