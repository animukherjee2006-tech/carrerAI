
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {

        if (!Buffer.isBuffer(fileBuffer)) {
            return reject(new Error('Invalid file buffer'));
        }

        const {
            folder = 'careerAI',
            resource_type = 'image',
            public_id,
            type = 'upload'
        } = options;

        const uploadOptions = {
            folder,
            resource_type,
            type
        };

        if (public_id) {
            uploadOptions.public_id = public_id;
        }

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(error);
                }

                console.log('Upload Successful:', result.secure_url);
                resolve(result);
            }
        ).end(fileBuffer);
    });
};

module.exports = uploadToCloudinary;
