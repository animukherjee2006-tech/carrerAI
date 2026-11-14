
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error('Only JPG, PNG, WEBP, PDF, and DOCX files are allowed')
            );
        }
    }
});

module.exports = upload;
