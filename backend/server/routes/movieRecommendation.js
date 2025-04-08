const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const Movie = require('../models/movieModel'); // Assuming you have a model to query movies
const router = express.Router();

router.post('/', async (req, res) => {
    const { movie_name } = req.body;

    if (!movie_name) {
        return res.status(400).json({ error: 'movie_name is required' });
    }

    let imdbId = movie_name;

    // Check if the movie_name is an IMDb ID (starts with 'tt')
    if (!movie_name.startsWith('tt')) {
        try {
            // Log the query before executing it
            console.log('Searching for movie by title:', movie_name);

            // If it's not an IMDb ID, find the IMDb ID from the movie title
            const movie = await Movie.findOne({
                primaryTitle: { $regex: movie_name, $options: 'i' }  // Case-insensitive search
            });

            console.log('Search result for movie:', movie);

            if (!movie) {
                return res.status(404).json({ error: 'Movie not found by title' });
            }

            imdbId = movie.imdbId;  // Get IMDb ID from the database
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Error querying the database for movie ID' });
        }
    }

    console.log('Final IMDb ID to be used:', imdbId);

    // Now run the Python script with the IMDb ID
    const scriptPath = path.join(__dirname, '..', 'python', 'app.py');  // Adjust the path as needed

    exec(`python3 ${scriptPath} "${imdbId}"`, async (error, stdout, stderr) => {
        if (error) {
            console.error('Python error:', stderr);
            return res.status(500).json({ error: 'Error running Python script' });
        }

        try {
            const result = JSON.parse(stdout);

            // Ensure the result is an array of IMDb IDs
            const imdbIds = result.recommendations;

            if (!Array.isArray(imdbIds) || imdbIds.length === 0) {
                return res.status(500).json({ error: 'Invalid recommendations returned from Python script' });
            }

            // Convert IMDb IDs to movie titles
            const recommendationsWithTitles = await Promise.all(imdbIds.map(async (imdbId) => {
                const movie = await Movie.findOne({ imdbId: imdbId });
                return movie ? movie.primaryTitle : imdbId;  // Use IMDb ID if no movie is found
            }));

            res.json({ recommendations: recommendationsWithTitles });
        } catch (parseErr) {
            console.error('Parse error:', parseErr);
            res.status(500).json({ error: 'Failed to parse Python output' });
        }
    });
});

module.exports = router;
