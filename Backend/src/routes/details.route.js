
const express = require('express');
const router = express.Router();

const {
    profilephotoupload,
    uploadeducationdetails,
    updateProfile,
    uploadresume
} = require('../controller/adddetails.controller');

const authmiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.put(
    '/profile-image',
    authmiddleware,
    upload.single('profileimage'),
    profilephotoupload
);

router.put(
    '/education',
    authmiddleware,
    uploadeducationdetails
);

router.post(
    '/uploadresume',
    authmiddleware,
    upload.single('resume'),
    uploadresume
);
router.put(
    '/update',
    authmiddleware,
    updateProfile
);

router.post('/uploadresume',authmiddleware,uploadresume)
module.exports = router;
