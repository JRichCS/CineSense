const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = (userId, email, username, password ) => {
    return jwt.sign({id: userId, email, username},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'24h'
    })
 }

module.exports.generateAccessToken = generateAccessToken