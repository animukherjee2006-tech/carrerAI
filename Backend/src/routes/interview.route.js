const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/auth.middleware');
const {
    startInterview,
    submitAnswer,
    getInterviewHistory,
    getInterviewDetails
} = require('../controller/interview.controller');

router.post('/start', authmiddleware, startInterview);
router.post('/:interviewId/submit', authmiddleware, submitAnswer);
router.get('/history', authmiddleware, getInterviewHistory);
router.get('/:interviewId', authmiddleware, getInterviewDetails);

module.exports = router;
