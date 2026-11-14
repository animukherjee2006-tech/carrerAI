const fs = require('fs');
const path = require('path');
const stream = require('stream');
const cloudinary = require('../config/cloudinary');
const User = require('../model/user.model');
const { analyzeResumeAI } = require('../services/ai.service');

/**
 * Helper to upload buffer to Cloudinary using upload_stream
 */
const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.Readable.from(buffer).pipe(uploadStream);
    });
};

// 1. UPLOAD PROFILE IMAGE
const profilephotoupload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Upload a file first"
            });
        }

        if (!req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: "File buffer is missing. Check Multer storage."
            });
        }

        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication missing"
            });
        }

        let secureUrl = "";
        let publicId = "";

        try {
            const result = await uploadToCloudinary(
                req.file.buffer,
                { folder: 'careerAI/profile' }
            );
            secureUrl = result.secure_url;
            publicId = result.public_id;
        } catch (cloudErr) {
            console.warn("Cloudinary upload fallback to local storage:", cloudErr.message);
            // Local fallback: store file in ./uploads directory
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const localFilename = `${Date.now()}-${req.file.originalname}`;
            const localPath = path.join(uploadsDir, localFilename);
            try {
                fs.writeFileSync(localPath, req.file.buffer);
                secureUrl = `/uploads/${localFilename}`;
                publicId = `local_${Date.now()}`;
            } catch (fsErr) {
                console.error('Local file write failed:', fsErr);
                // Fallback to base64 data URI if local write also fails
                const b64 = req.file.buffer.toString('base64');
                const mime = req.file.mimetype || 'image/png';
                secureUrl = `data:${mime};base64,${b64}`;
                publicId = `local_${Date.now()}`;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profileimage: secureUrl, profileImagePublicId: publicId },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            profileimage: updatedUser.profileimage,
            publicId
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. UPLOAD EDUCATION DETAILS
const uploadeducationdetails = async (req, res) => {
    try {
        const { education } = req.body;

        if (!education) {
            return res.status(400).json({
                success: false,
                message: "Please enter education details first"
            });
        }

        const educationData = typeof education === 'string'
            ? JSON.parse(education)
            : education;

        if (!Array.isArray(educationData)) {
            return res.status(400).json({
                success: false,
                message: "Education must be an array"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { education: educationData } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Education details saved successfully",
            education: updatedUser.education
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. DELETE PROFILE IMAGE
const deleteProfileImage = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User authentication missing" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const publicId = user.profileImagePublicId;
        if (publicId && !publicId.startsWith('local_')) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.warn('Cloudinary delete failed:', err.message);
            }
        }

        // Clear fields in DB
        user.profileimage = "";
        user.profileImagePublicId = "";
        await user.save();

        return res.status(200).json({ success: true, message: "Profile image deleted successfully" });
    } catch (error) {
        console.error('DELETE PROFILE IMAGE ERROR:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            headline,
            bio,
            githubUsername,
            portfolioUrl,
            linkedinUrl,
            targetRole,
            careerLevel,
            skills,
            education,
            experience,
            preferences
        } = req.body;

        const updateData = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: "Name cannot be empty" });
            }
            updateData.name = name.trim();
        }

        if (headline !== undefined) updateData.headline = headline.trim();
        if (bio !== undefined) updateData.bio = bio.trim();
        if (githubUsername !== undefined) updateData.githubUsername = githubUsername.trim();
        if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl.trim();
        if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl.trim();

        if (targetRole !== undefined) {
            updateData.targetRole = targetRole.trim();
        }

        if (careerLevel !== undefined) {
            const allowedLevels = ['Student', 'Fresher', 'Experienced'];
            if (!allowedLevels.includes(careerLevel)) {
                return res.status(400).json({ success: false, message: "Invalid career level" });
            }
            updateData.careerLevel = careerLevel;
        }

        if (skills !== undefined) {
            let parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
            if (Array.isArray(parsedSkills)) {
                updateData.skills = [...new Set(parsedSkills.map(s => String(s).trim()).filter(Boolean))];
            }
        }

        if (education !== undefined) {
            let parsedEducation = typeof education === 'string' ? JSON.parse(education) : education;
            if (Array.isArray(parsedEducation)) {
                updateData.education = parsedEducation.map(item => ({
                    degree: String(item.degree || '').trim(),
                    college: String(item.college || '').trim(),
                    educationYear: String(item.educationYear || '').trim()
                })).filter(e => e.degree && e.college);
            }
        }

        if (experience !== undefined) {
            let parsedExperience = typeof experience === 'string' ? JSON.parse(experience) : experience;
            if (Array.isArray(parsedExperience)) {
                updateData.experience = parsedExperience.map(item => ({
                    title: String(item.title || '').trim(),
                    company: String(item.company || '').trim(),
                    duration: String(item.duration || '').trim(),
                    description: String(item.description || '').trim()
                }));
            }
        }

        if (preferences !== undefined) {
            updateData.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile fields provided"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// 5. RESUME UPLOAD & AUTOMATIC ATS EXTRACTION
const uploadresume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume file (PDF or DOCX)"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let fileUrl = "";
        let publicId = `resume_${req.user.id}_${Date.now()}`;

        // Attempt Cloudinary upload
        try {
            const result = await uploadToCloudinary(
                req.file.buffer,
                {
                    folder: 'careerAI/resumes',
                    resource_type: 'raw',
                    type: 'authenticated',
                    public_id: `${req.user.id}/resume-${Date.now()}`
                }
            );
            fileUrl = result.secure_url;
            publicId = result.public_id;
        } catch (cloudErr) {
            console.warn("Cloudinary resume upload fallback to local storage:", cloudErr.message);
            // Local fallback: store file in ./uploads directory
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const localFilename = `${Date.now()}-${req.file.originalname}`;
            const localPath = path.join(uploadsDir, localFilename);
            try {
                fs.writeFileSync(localPath, req.file.buffer);
                fileUrl = `/uploads/${localFilename}`;
            } catch (fsErr) {
                console.error('Local file write failed:', fsErr);
                fileUrl = '';
            }
        }

        const oldPublicId = user.resume?.publicId;

        // Try extracting text from the uploaded buffer
        let extractedText = "";
        try {
            const rawString = req.file.buffer.toString('utf-8', 0, Math.min(req.file.buffer.length, 100000));
            extractedText = rawString.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, " ").replace(/\s+/g, " ").trim();
        } catch (e) {
            extractedText = `Resume file: ${req.file.originalname}`;
        }

        // Save resume metadata in User document
        user.resume = {
            fileName: req.file.originalname,
            fileUrl: fileUrl,
            publicId: publicId,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedAt: new Date(),
            indexingStatus: 'completed',
            resumeId: publicId,
            rawText: extractedText.slice(0, 15000)
        };

        // Run AI ATS analysis
        const analysis = await analyzeResumeAI({
            resumeText: extractedText,
            targetRole: user.targetRole || 'Software Engineer',
            careerLevel: user.careerLevel || 'Fresher'
        });

        user.resumeAnalysis = {
            ...analysis,
            analyzedAt: new Date()
        };

        // Automatically sync extracted skills with user profile if empty or add new
        if (analysis.skillsFound && analysis.skillsFound.length > 0) {
            const combinedSkills = new Set([...(user.skills || []), ...analysis.skillsFound]);
            user.skills = Array.from(combinedSkills);
        }

        await user.save();

        // Cleanup old resume if present in Cloudinary
        if (oldPublicId && !oldPublicId.startsWith('local_') && cloudinary.uploader) {
            try {
                await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw', type: 'authenticated' });
            } catch (delErr) {
                // Ignore cleanup errors
            }
        }

        return res.status(200).json({
            success: true,
            message: "Resume uploaded and analyzed successfully",
            data: {
                fileName: user.resume.fileName,
                fileSize: user.resume.fileSize,
                uploadedAt: user.resume.uploadedAt,
                indexingStatus: user.resume.indexingStatus,
                resumeId: user.resume.resumeId,
                analysis: user.resumeAnalysis
            }
        });

    } catch (error) {
        console.error("Resume upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Resume upload and processing failed",
            error: error.message
        });
    }
};

module.exports = {
    profilephotoupload,
    uploadeducationdetails,
    updateProfile,
    deleteProfileImage,
    uploadresume
};