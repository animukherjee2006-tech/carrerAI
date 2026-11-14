const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/auth.middleware');
const {
    getJobs,
    getJobById,
    trackApplication,
    getUserApplications,
    updateApplicationStatus,
    deleteApplication
} = require('../controller/job.controller');

router.get('/', authmiddleware, getJobs);
router.get('/applications', authmiddleware, getUserApplications);
router.post('/applications', authmiddleware, trackApplication);
router.patch('/applications/:applicationId', authmiddleware, updateApplicationStatus);
router.delete('/applications/:applicationId', authmiddleware, deleteApplication);
router.get('/:id', authmiddleware, getJobById);

module.exports = router;
