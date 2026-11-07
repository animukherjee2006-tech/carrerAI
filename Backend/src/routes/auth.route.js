const express = require('express')
const router = express.Router()
const usercontroller = require('../controller/auth.controller')



router.post('/signup',usercontroller.Signup)
router.post('/login',usercontroller.Login)
router.post('/logout',usercontroller.Logout);

module.exports = router

