
const dns = require('node:dns');

// DNS configuration for Cloudinary connectivity
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();

const app = require('./src/app');
const mongodbC = require('./src/config/db');

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongodbC();

// Start Server
app.listen(PORT, () => {
    console.log('Server is connected to PORT:', PORT);
});
