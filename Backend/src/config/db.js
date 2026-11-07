const mongoose = require('mongoose')


async function mongodbC() {
    mongoose.connect(process.env.MONGO_URI)
    console.log("Mongodb Connect")
}

module.exports = mongodbC