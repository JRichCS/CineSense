// models/movieModel.js

const mongoose = require('mongoose');

// Define the schema for a movie
const movieSchema = new mongoose.Schema({
  primaryTitle: { type: String, required: true},  // Movie title
  imdbId: { type: String, required: true, unique: true }, // IMDB ID
  posterPath: {type: String},
  releaseYear: {type: Number}
});

// Create a model for the movie
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;  // Export the model so it can be used in other parts of the app
