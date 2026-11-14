const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

const authUser = require('./routes/auth.route');
const profileDetails = require('./routes/details.route');
const chatStore = require('./routes/chat.route');
const careerRoute = require('./routes/career.route');
const jobRoute = require('./routes/job.route');
const interviewRoute = require('./routes/interview.route');
const notificationRoute = require('./routes/notification.route');

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-ai-service-key']
}));

// API Routes
app.use('/api/auth', authUser);
app.use('/api/profile', profileDetails);
app.use('/api/chat', chatStore);
app.use('/api/career', careerRoute);
app.use('/api/jobs', jobRoute);
app.use('/api/interviews', interviewRoute);
app.use('/api/notifications', notificationRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'CareerAI Node.js Backend',
        status: 'healthy',
        timestamp: new Date()
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;