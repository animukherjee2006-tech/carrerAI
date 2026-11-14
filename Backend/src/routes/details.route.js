
const express = require('express');
const router = express.Router();

const {
    profilephotoupload,
    uploadeducationdetails,
    updateProfile,
    uploadresume,
    deleteProfileImage
} = require('../controller/adddetails.controller');

const authmiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Delete profile image
router.delete(
    '/profile-image',
    authmiddleware,
    deleteProfileImage
);

router.put(
    '/profile-image',
    authmiddleware,
    upload.single('profileimage'),
    profilephotoupload
);

// Update education
router.put(
    '/education',
    authmiddleware,
    uploadeducationdetails
);

// Upload resume
router.post(
    '/uploadresume',
    authmiddleware,
    upload.single('resume'),
    uploadresume
);

// Update personal profile
router.put(
    '/update',
    authmiddleware,
    updateProfile
);

module.exports = router;
