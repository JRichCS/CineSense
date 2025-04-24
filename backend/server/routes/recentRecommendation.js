const express = require('express');
const router = express.Router();
const RecentRecommendation = require('../models/recentRecommendationsModel');

router.post('/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  const { recommendations } = req.body;

  if (!userId || !Array.isArray(recommendations)) {
    return res.status(400).json({ error: 'Missing userId or recommendations array.' });
  }

  try {
    // Extract the IMDb IDs from the incoming recommendations
    const newImdbIds = recommendations.map(movie => movie.imdbId);

    // Fetch the existing recommendations for the user
    const existingRec = await RecentRecommendation.findOne({ userId });

    // If recommendations exist, filter out duplicates by comparing IMDb IDs
    let uniqueRecommendations = recommendations;

    if (existingRec && existingRec.recommendations.length > 0) {
      // Get the existing IMDb IDs
      const existingImdbIds = existingRec.recommendations.map(rec => rec.imdbId);

      // Filter out the new recommendations that already exist in the database
      uniqueRecommendations = recommendations.filter(movie => !existingImdbIds.includes(movie.imdbId));
    }

    // If there are no unique recommendations, send a response to inform the user
    if (uniqueRecommendations.length === 0) {
      return res.status(200).json({ message: 'No new recommendations to add (all recommendations are already saved).' });
    }

    // Map the recommendations to the format for saving
    const recs = uniqueRecommendations.map(movie => ({
      primaryTitle: movie.primaryTitle || '',
      imdbId: movie.imdbId,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,

    }));

    // Create or update the recommendations for the user
    if (existingRec) {
      // Update existing recommendations if any
      existingRec.recommendations = [...existingRec.recommendations, ...recs];
      await existingRec.save();
      return res.status(200).json({ message: 'Recommendations updated.', data: existingRec });
    } else {
      // Otherwise, create a new entry
      const newRec = new RecentRecommendation({
        userId,
        recommendations: recs
      });
      await newRec.save();
      return res.status(201).json({ message: 'Recommendations created.', data: newRec });
    }
  } catch (error) {
    console.error('Error creating recommendations:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// PUT: Update an existing user's recommendations (e.g., add more)
router.put('/recommendations/:userId', async (req, res) => {
    const { userId } = req.params;
    const { recommendations } = req.body;
  
    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Missing or invalid recommendations array.' });
    }
  
    try {
      // Get existing recommendations
      const existing = await RecentRecommendation.findOne({ userId });
  
      if (!existing) {
        return res.status(404).json({ message: 'No recommendation record found for this user.' });
      }
  
      // Get existing IMDb IDs to filter out duplicates
      const existingIds = new Set(existing.recommendations.map(rec => rec.imdbId));
  
      // Filter out any new recommendations that are already present
      const newRecs = recommendations
        .filter(movie => !existingIds.has(movie.imdbId))
        .map(movie => ({
          primaryTitle: movie.primaryTitle || '',
          imdbId: movie.imdbId,
          posterPath: movie.posterPath,
          releaseYear: movie.releaseYear,
        }));
  
      if (newRecs.length === 0) {
        return res.status(200).json({ message: 'No new unique recommendations to add.' });
      }
  
      // Push only new, unique recommendations
      existing.recommendations.unshift(...newRecs);
      existing.lastUpdated = new Date();
  
      await existing.save();
  
      res.json({ message: 'New recommendations added.', data: existing });
    } catch (error) {
      console.error('Error updating recommendations:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
  

// GET: Load recent recommendations for a user
router.get('/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const latestRecs = await RecentRecommendation.findOne({ userId });

    if (!latestRecs || !Array.isArray(latestRecs.recommendations)) {
      return res.status(404).json({ message: 'No recommendations found for this user.' });
    }

    // Sort the recommendations by 'recommendedAt' in descending order
    const sortedRecs = latestRecs.recommendations
      .sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt))
      .slice(0, 25); // Limit to 25 movies

    res.json({ recommendations: sortedRecs });
  } catch (error) {
    console.error('Error loading recommendations:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});



module.exports = router;
