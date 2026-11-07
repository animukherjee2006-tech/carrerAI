require('dotenv').config();

console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY EXISTS:", !!process.env.CLOUDINARY_API_KEY);
console.log("API SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);

const cloudinary = require('./src/config/cloudinary');

async function test() {
    try {
        const result = await cloudinary.api.ping();
        console.log("SUCCESS:", result);
    } catch (error) {
        console.log("STATUS:", error.http_code);
        console.log("MESSAGE:", error.message);
        console.dir(error, { depth: 5 });
    }
}

test();