const express = require('express');
const router = express.Router();
const usercontroller = require('../controller/auth.controller');
const authmiddleware = require('../middleware/auth.middleware');

router.post('/signup', usercontroller.Signup);
router.post('/login', usercontroller.Login);
router.post('/logout', usercontroller.Logout);
router.get('/getme', authmiddleware, usercontroller.getme);


module.exports = router;
