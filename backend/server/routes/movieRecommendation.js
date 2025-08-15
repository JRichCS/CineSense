const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');
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
        

        exec(`python3 ${scriptPath} ${escapedPayload}`, async (error, stdout, stderr) => {
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

// OpenAI API route for movie recommendations
router.post('/openai', async (req, res) => {
    const { movie_ids, weights } = req.body;

    if (!Array.isArray(movie_ids) || movie_ids.length === 0) {
        return res.status(400).json({ error: 'movie_ids must be a non-empty array' });
    }

    // Set default weights if not provided
    const defaultWeights = {
        genre: .5,
        director: .5,
        actor: .5,
        rating: .5
    };
    
    const finalWeights = { ...defaultWeights, ...weights };

    try {
        // Get movie details for the input IDs to provide context to OpenAI
        const inputMovies = await Promise.all(
            movie_ids.map(async (imdbId) => {
                const movie = await Movie.findOne({ imdbId });
                return movie;
            })
        );

        const validMovies = inputMovies.filter(Boolean);
        
        if (validMovies.length === 0) {
            return res.status(404).json({ error: 'No valid movies found from input IDs' });
        }

        // Prepare movie information for OpenAI prompt
        const movieContext = validMovies.map(movie => ({
            title: movie.primaryTitle,
            year: movie.startYear,
            genre: movie.genres,
            rating: movie.rating,
            director: movie.directors
        }));

        // Create weight-adjusted prompt based on user preferences
        let systemPrompt = `You are a movie recommendation expert. Based on the provided movies, suggest 10 similar movies that users would enjoy. `;
        
        // Add weight-specific instructions
        if (finalWeights.genre !== 0.5) {
            if (finalWeights.genre > 0.5) {
                systemPrompt += `GENRE is highly important (weight: ${finalWeights.genre}) - prioritize movies with similar genres. `;
            } else {
                systemPrompt += `GENRE is less important (weight: ${finalWeights.genre}) - genre differences are acceptable. `;
            }
        }
        
        if (finalWeights.director !== 0.5) {
            if (finalWeights.director > 0.5) {
                systemPrompt += `DIRECTOR is highly important (weight: ${finalWeights.director}) - prioritize movies by the same or similar directors. `;
            } else {
                systemPrompt += `DIRECTOR is less important (weight: ${finalWeights.director}) - director differences are acceptable. `;
            }
        }
        
        if (finalWeights.actor !== 0.5) {
            if (finalWeights.actor > 0.5) {
                systemPrompt += `ACTORS are highly important (weight: ${finalWeights.actor}) - prioritize movies with the same or similar actors. `;
            } else {
                systemPrompt += `ACTORS are less important (weight: ${finalWeights.actor}) - actor differences are acceptable. `;
            }
        }
        
        if (finalWeights.rating !== 0.5) {
            if (finalWeights.rating > 0.5) {
                systemPrompt += `RATING is highly important (weight: ${finalWeights.rating}) - prioritize movies with similar ratings. `;
            } else {
                systemPrompt += `RATING is less important (weight: ${finalWeights.rating}) - rating differences are acceptable. `;
            }
        }
        
        systemPrompt += `Use these weight preferences to guide your recommendations. Return ONLY a JSON array of IMDB IDs (tt format) without any additional text or explanation. Example format: ["tt0111161", "tt0068646", "tt0468569"]`;

        // Create OpenAI API request
        const apiKey = process.env.OpenAI_API_KEY || process.env.OPENAI_API_KEY || process.env.openai_api_key;
        
        
        if (!apiKey) {
            throw new Error('OpenAI API key not found in environment variables. Please check your .env file.');
        }
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `Based on these movies: ${JSON.stringify(movieContext)}, suggest 10 similar movies. Return only the IMDB IDs in JSON format.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error('OpenAI API Response:', openaiResponse.status, errorText);
            throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        }

        const openaiData = await openaiResponse.json();
        const content = openaiData.choices[0].message.content;

        // Parse the IMDB IDs from OpenAI response
        let recommendedIds;
        try {
            // Clean the response and parse JSON
            const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
            recommendedIds = JSON.parse(cleanedContent);
            
            if (!Array.isArray(recommendedIds)) {
                throw new Error('Response is not an array');
            }
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', content);
            return res.status(500).json({ error: 'Failed to parse OpenAI recommendations' });
        }

        // Validate that all returned IDs are in valid IMDB format
        const validImdbIds = recommendedIds.filter(id => 
            typeof id === 'string' && id.startsWith('tt') && id.length >= 9
        );

        if (validImdbIds.length === 0) {
            return res.status(500).json({ error: 'No valid IMDB IDs returned from OpenAI' });
        }

        // Return the recommended IMDB IDs with weight information
        res.json({ 
            recommendations: validImdbIds.slice(0, 10), // Ensure max 10 recommendations
            source: 'openai',
            weights_used: finalWeights,
            input_movies: movieContext.length
        });

    } catch (error) {
        console.error('OpenAI recommendation error:', error);
        res.status(500).json({ 
            error: 'Failed to get OpenAI recommendations',
            details: error.message 
        });
    }
});

// Test route for OpenAI API
router.get('/openai/test', async (req, res) => {
    try {
        const apiKey = process.env.OpenAI_API_KEY || process.env.OPENAI_API_KEY || process.env.openai_api_key;
        const envVars = Object.keys(process.env).filter(key => key.toLowerCase().includes('openai'));
        
        res.json({ 
            message: 'OpenAI route is working',
            usage: 'POST /openai with movie_ids array to get recommendations',
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            availableEnvVars: envVars,
            envFileLoaded: !!process.env.NODE_ENV || Object.keys(process.env).length > 10
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
