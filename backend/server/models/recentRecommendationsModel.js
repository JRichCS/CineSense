// models/recentRecommendationsModel.js

const mongoose = require('mongoose');

// Define the schema for a movie
const recentRecommendationSchema = new mongoose.Schema(
    {
        // User ID to distinguish between users
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        // An array of favorited movies
        recommendations: [
            {
              primaryTitle: { type: String, required: true},  // Movie title
              imdbId: { type: String, required: true }, // IMDB ID
              posterPath: {type: String},
              releaseYear: {type: Number},
              recommendedAt: { type: Date, default: Date.now }
            }
          ],
          lastUpdated: {
            type: Date,
            default: Date.now
          }
      },
      // Add to own collection
     
    );


module.exports = mongoose.model("recentRecommendation", recentRecommendationSchema);
