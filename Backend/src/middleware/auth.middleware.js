
const jwt = require('jsonwebtoken');
const users = require('../model/user.model');

const authmiddleware = async (req, res, next) => {
    try {
        // 1. Get token from cookie or Authorization header
        let token = req.cookies?.token;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        // 2. Check token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }

        // 3. Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');

            return res.status(500).json({
                success: false,
                message: 'Authentication configuration error'
            });
        }

        // 4. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const userId = decoded.id || decoded._id || decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload'
            });
        }

        // 5. Find authenticated user
        const user = await users
            .findById(userId)
            .select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // 6. Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.error('Auth Middleware Error:', error.message);

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'CastError'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication server error'
        });
    }
};

module.exports = authmiddleware;
