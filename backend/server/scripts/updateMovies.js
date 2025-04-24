require('dotenv').config({ path: '../.env' });

const axios = require('axios');
const mongoose = require('mongoose');
const Movie = require('../models/movieModel'); // Adjust path if necessary

const TMDB_API_KEY = "c7b1056ba9aa5d51fb314f3903482f6d";
const DB_URL = process.env.DB_URL;

if (!DB_URL || !TMDB_API_KEY) {
  console.error('Missing DB_URL or TMDB_API_KEY in .env');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function updateMoviesWithTMDbData() {
  try {
    const movies = await Movie.find({});
    console.log(`📋 Total movies to check: ${movies.length}`);

    for (const movie of movies) {
      if (movie.posterPath && movie.releaseYear) {
        console.log(`⏭️ Skipping (already updated): ${movie.primaryTitle}`);
        continue;
      }

      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/find/${movie.imdbId}`,
          {
            params: {
              api_key: TMDB_API_KEY,
              external_source: 'imdb_id',
            },
          }
        );

        const tmdbMovie = response.data.movie_results?.[0];
        if (!tmdbMovie) {
          console.warn(`⚠️ No TMDb data found for: ${movie.imdbId}`);
          continue;
        }

        movie.posterPath = tmdbMovie.poster_path || null;
        movie.releaseYear = tmdbMovie.release_date
          ? parseInt(tmdbMovie.release_date.slice(0, 4))
          : null;

        await movie.save();
        console.log(`✅ Updated: ${movie.primaryTitle}`);
      } catch (err) {
        console.error(`❌ Error updating ${movie.imdbId}:`, err.message);
      }
    }

    console.log('🎉 Movie updates complete.');
  } catch (err) {
    console.error('❌ Error fetching movies:', err);
  } finally {
    mongoose.connection.close();
  }
}

updateMoviesWithTMDbData();
