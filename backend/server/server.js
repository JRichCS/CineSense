require('dotenv').config();

const express = require("express");
const app = express();
const cors = require('cors')
const loginRoute = require('./routes/userLogin')
const getAllUsersRoute = require('./routes/userGetAllUsers')
const registerRoute = require('./routes/userSignUp')
const getUserByIdRoute = require('./routes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userEditUser')
const deleteUser = require('./routes/userDeleteAll')
const movieRecommendationRoute = require('./routes/movieRecommendation');  // recommender route
const movieAutosuggestRoute = require('./routes/movieSearch'); // route for movie autosuggest
const recentRecommendationRoutes = require('./routes/recentRecommendation'); // route for recent recommendations

const SERVER_PORT = process.env.PORT || 8081;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

dbConnection()

// Secure CORS configuration for production
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))

app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)

app.use('/recommend', movieRecommendationRoute);
app.use('/history', recentRecommendationRoutes);

app.use('/search', movieAutosuggestRoute);

app.listen(SERVER_PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
    }
})
