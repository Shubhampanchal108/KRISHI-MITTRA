const mongoose = require("mongoose");
const env = require('dotenv').config()

const URL = process.env.MONGODB_URL

async function DB_Connection(){
    try {
        // await mongoose.connect(`${URL}/krishi_mittra`);
        await mongoose.connect(`mongodb://localhost:27017/krishiMittra`);
        console.log("Database connnected sucessfully");
    } catch (error) {
        console.log(`Fail to connect: ${error}`)
    }
}

module.exports = DB_Connection