const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const Movie = require('../models/movieModel');
const router = express.Router();

router.post('/', async (req, res) => {
    const { movie_ids, weights } = req.body;

    if (!Array.isArray(movie_ids) || movie_ids.length === 0) {
        return res.status(400).json({ error: 'movie_ids must be a non-empty array' });
    }

    try {
        // Resolve IMDb IDs from titles if necessary
        const resolvedIds = await Promise.all(
            movie_ids.map(async (entry) => {
                if (entry.startsWith('tt')) return entry;

                const movie = await Movie.findOne({
                    primaryTitle: { $regex: entry, $options: 'i' }
                });

                return movie ? movie.imdbId : null;
            })
        );

        const validImdbIds = resolvedIds.filter(Boolean);

        if (validImdbIds.length === 0) {
            return res.status(404).json({ error: 'No valid IMDb IDs found from input' });
        }

        // Prepare payload for Python script
        const scriptPath = path.join(__dirname, '..', 'python', 'app.py');
        const payload = JSON.stringify({
            imdb_ids: validImdbIds,
            weights: {
                genre: weights?.genre ?? 1,
                director: weights?.director ?? 1,
                actor: weights?.actor ?? 1,
                rating: weights?.rating ?? 1
            }
        });

        /*{ Example JSON
            "movie_ids": ["tt0110912", "tt0137523"],
            "weights": {
                "genre": 2,
                "director": 1,
                "actor": 1.5,
                "rating": 0.5
            }
            }
        */

        // Escape the payload string to safely pass to shell
        const escapedPayload = `'${payload.replace(/'/g, `'\\''`)}'`;
        console.log(escapedPayload)

        exec(`python3 ${scriptPath} ${escapedPayload}`, async (error, stdout, stderr) => {
            if (error) {
                console.error('Python error:', stderr);
                return res.status(500).json({ error: 'Error running Python script' });
            }

            try {
                
                console.log('e', stdout)
                const result = JSON.parse(stdout);
                const imdbIds = result.recommendations;

                if (!Array.isArray(imdbIds) || imdbIds.length === 0) {
                    return res.status(500).json({ error: 'Invalid recommendations returned from Python script' });
                }

                const recommendationsWithTitles = await Promise.all(
                    imdbIds.map(async (imdbId) => await Movie.findOne({ imdbId }))
                );

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
