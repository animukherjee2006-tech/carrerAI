
const uploadtocloudinary = require('../utils/cloudinary.utils');
const User = require('../model/user.model');

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

        const result = await uploadtocloudinary(
            req.file.buffer,
            { folder: 'careerAI/profile' }
        );

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profileimage: result.secure_url },
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
            publicId: result.public_id
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error.message);
        console.error("HTTP CODE:", error.http_code);
        console.dir(error, { depth: 5 });

        return res.status(error.http_code || 500).json({
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

        if (!Array.isArray(educationData) || educationData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Education must be a non-empty array"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: { education: educationData }
            },
            {
                new: true,
                runValidators: true
            }
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



// UPDATE COMPLETE USER PROFILE
const updateProfile = async (req, res) => {
    try {
        const {
            name,
            targetRole,
            careerLevel,
            skills,
            education
        } = req.body;

        const updateData = {};

        // 1. Update Name
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }
            updateData.name = name.trim();
        }

        // 2. Update Target Role
        if (targetRole !== undefined) {
            updateData.targetRole = targetRole.trim();
        }

        // 3. Update Career Level
        if (careerLevel !== undefined) {
            const allowedLevels = [
                'Student',
                'Fresher',
                'Experienced'
            ];

            if (!allowedLevels.includes(careerLevel)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid career level"
                });
            }

            updateData.careerLevel = careerLevel;
        }

        // 4. Update Skills
        if (skills !== undefined) {
            let parsedSkills;

            try {
                parsedSkills = typeof skills === 'string'
                    ? JSON.parse(skills)
                    : skills;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid skills format"
                });
            }

            if (
                !Array.isArray(parsedSkills) ||
                !parsedSkills.every(skill =>
                    typeof skill === 'string' && skill.trim()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Skills must be an array of strings"
                });
            }

            updateData.skills = [
                ...new Set(parsedSkills.map(skill => skill.trim()))
            ];
        }

        // 5. Update Education
        if (education !== undefined) {
            let parsedEducation;

            try {
                parsedEducation = typeof education === 'string'
                    ? JSON.parse(education)
                    : education;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid education format"
                });
            }

            if (!Array.isArray(parsedEducation)) {
                return res.status(400).json({
                    success: false,
                    message: "Education must be an array"
                });
            }

            const validEducation = parsedEducation.every(item =>
                item &&
                typeof item.degree === 'string' &&
                item.degree.trim() &&
                typeof item.college === 'string' &&
                item.college.trim() &&
                typeof item.educationYear === 'string' &&
                item.educationYear.trim()
            );

            if (!validEducation) {
                return res.status(400).json({
                    success: false,
                    message: "Each education entry must contain degree, college and educationYear"
                });
            }

            updateData.education = parsedEducation.map(item => ({
                degree: item.degree.trim(),
                college: item.college.trim(),
                educationYear: item.educationYear.trim()
            }));
        }

        // 6. Check Empty Update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile fields provided"
            });
        }

        // 7. Update Database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
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


// 4. RESUME PDF UPLOAD
const uploadresume = async (req, res) => {
    let uploadedFile = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume PDF"
            });
        }

        // Validate MIME type and actual PDF signature
        if (
            req.file.mimetype !== 'application/pdf' ||
            !req.file.buffer.subarray(0, 5).equals(
                Buffer.from('%PDF-')
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Only valid PDF files are allowed"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Upload new PDF as an authenticated raw asset
        const result = await uploadtocloudinary(
            req.file.buffer,
            {
                folder: 'careerAI/resumes',
                resource_type: 'raw',
                type: 'authenticated',
                public_id: `${req.user.id}/resume-${Date.now()}.pdf`
            }
        );

        uploadedFile = result;

        const oldPublicId = user.resume?.publicId;

        // Save resume metadata in MongoDB
        user.resume = {
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            mimeType: 'application/pdf',
            fileSize: req.file.size,
            uploadedAt: new Date(),
            indexingStatus: 'pending',
            resumeId: result.public_id
        };

        await user.save();

        // Delete previous resume only after successful DB update
        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(
                    oldPublicId,
                    {
                        resource_type: 'raw',
                        type: 'authenticated'
                    }
                );
            } catch (deleteError) {
                console.error(
                    "Old resume deletion failed:",
                    deleteError.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            data: {
                fileName: user.resume.fileName,
                fileSize: user.resume.fileSize,
                uploadedAt: user.resume.uploadedAt,
                indexingStatus: user.resume.indexingStatus,
                resumeId: user.resume.resumeId
            }
        });

    } catch (error) {

        // Cleanup newly uploaded asset if DB save fails
        if (uploadedFile?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedFile.public_id,
                    {
                        resource_type: 'raw',
                        type: 'authenticated'
                    }
                );
            } catch (cleanupError) {
                console.error(
                    "Cloudinary cleanup failed:",
                    cleanupError.message
                );
            }
        }

        console.error("Resume upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Resume upload failed"
        });
    }
};

module.exports = {
    profilephotoupload,
    uploadeducationdetails,
    updateProfile,
    uploadresume
};
