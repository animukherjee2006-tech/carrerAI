const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token & Cookie
const generateToken = (userId, res) => {
    const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'career-ai-jwt-fallback-secret-2026',
        { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return token;
};

// REGISTER
async function Signup(req, res) {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            targetRole: 'Full Stack Developer',
            careerLevel: 'Fresher',
            skills: ['JavaScript', 'React', 'Node.js']
        });

        const token = generateToken(newUser._id, res);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                headline: newUser.headline,
                profileimage: newUser.profileimage,
                education: newUser.education,
                targetRole: newUser.targetRole,
                careerLevel: newUser.careerLevel,
                skills: newUser.skills
            }
        });

    } catch (err) {
        console.error('Signup Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
}

// LOGIN
async function Login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id, res);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                headline: user.headline,
                profileimage: user.profileimage,
                education: user.education,
                targetRole: user.targetRole,
                careerLevel: user.careerLevel,
                skills: user.skills
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
}

// LOGOUT
async function Logout(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        console.error('Logout Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
}

// GET CURRENT USER PROFILE
const getme = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





module.exports = {
    Signup,
    Login,
    Logout,
    getme,

};
