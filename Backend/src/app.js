const express = require('express')
const cookieparser = require('cookie-parser')
const authuser= require('../src/routes/auth.route')
const uploaddetails = require('../src/routes/details.route')
const app = express()

app.use(express.json())
app.use(cookieparser())

app.use('/api/auth',authuser);
app.use('/api/profile',uploaddetails)

module.exports = app