const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const Movie = require('../models/movieModel');
const router = express.Router();

router.post('/', async (req, res) => {
    const { movie_ids } = req.body;

    if (!Array.isArray(movie_ids) || movie_ids.length === 0) {
        return res.status(400).json({ error: 'movie_ids must be a non-empty array' });
    }

    try {
        // Validate and resolve IMDb IDs (handle cases where titles were sent instead)
        const resolvedIds = await Promise.all(
            movie_ids.map(async (entry) => {
                if (entry.startsWith('tt')) {
                    return entry;
                } else {
                    const movie = await Movie.findOne({
                        primaryTitle: { $regex: entry, $options: 'i' }
                    });

                    return movie ? movie.imdbId : null;
                }
            })
        );

        // Filter out any that couldn't be resolved
        const validImdbIds = resolvedIds.filter(Boolean);

        if (validImdbIds.length === 0) {
            return res.status(404).json({ error: 'No valid IMDb IDs found from input' });
        }

        // 🧠 Send the list of IMDb IDs as a JSON string to Python
        const scriptPath = path.join(__dirname, '..', 'python', 'app.py');
        const inputString = JSON.stringify(validImdbIds);

        exec(`python3 ${scriptPath} '${inputString}'`, async (error, stdout, stderr) => {
            if (error) {
                console.error('Python error:', stderr);
                return res.status(500).json({ error: 'Error running Python script' });
            }

            try {
                const result = JSON.parse(stdout);
                const imdbIds = result.recommendations;

                if (!Array.isArray(imdbIds) || imdbIds.length === 0) {
                    return res.status(500).json({ error: 'Invalid recommendations returned from Python script' });
                }

                // Convert IMDb IDs to movie titles
                const recommendationsWithTitles = await Promise.all(imdbIds.map(async (imdbId) => {
                    const movie = await Movie.findOne({ imdbId: imdbId });
                    return movie ? movie.primaryTitle : imdbId;
                }));

                res.json({ recommendations: recommendationsWithTitles });
            } catch (parseErr) {
                console.error('Parse error:', parseErr);
                res.status(500).json({ error: 'Failed to parse Python output' });
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error while processing request' });
    }
});

module.exports = router;
