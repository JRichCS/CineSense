// routes/movieSearch.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/movieModel'); // Assuming you have a model to query movies

// Search for movies by IMDb ID or Movie Title
router.get("/", async (req, res) => {
  const { q } = req.query;  // The query parameter containing the IMDb ID or movie name

  if (!q) {
    return res.status(400).json({ error: "Search query parameter is required." });
  }

  try {
    // Search for movies by title or IMDb ID (case-insensitive)
    const movies = await Movie.find({
      $or: [
        { primaryTitle: { $regex: q, $options: "i" } },  // Search by movie name
        { imdbId: { $regex: q, $options: "i" } }        // Search by IMDb ID
      ]
    }).limit(5);  // Limit the number of results to 5

    if (movies.length === 0) {
      return res.status(404).json({ error: "No movies found with that name or IMDb ID." });
    }

    // Send back the movie details including IMDb ID and title
    const movieDetails = movies.map((movie) => ({
      imdbId: movie.imdbId,
      title: movie.primaryTitle, // Include primaryTitle here
    }));

    return res.json(movieDetails);
  } catch (error) {
    console.error("Error searching for movies:", error);
    return res.status(500).json({ error: "Failed to search for movies." });
  }
});

module.exports = router;
