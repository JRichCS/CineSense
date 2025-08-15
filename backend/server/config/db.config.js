const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

module.exports = () => {
    const databaseParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    try{
        mongoose.connect(process.env.DB_URL)
        if (process.env.NODE_ENV !== 'production') {
            console.log("The backend has connected to the MongoDB database.")
        }
    } catch(error){
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${error} could not connect`)
        }
    }
}

