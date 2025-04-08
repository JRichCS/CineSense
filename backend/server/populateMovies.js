require('dotenv').config(); // Ensure dotenv is loaded at the start

const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Movie = require('./models/movieModel');  // Your movie model

// OMDB API Key and MongoDB URL from the .env file
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error('MongoDB connection URL is not defined in the .env file');
  process.exit(1); // Exit if no DB_URL is found
}

const OMDB_API_URL = 'http://www.omdbapi.com/';

// Connect to MongoDB using the DB_URL from .env file
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Function to read the CSV file and fetch movies from it
async function fetchAndSaveMoviesFromCSV() {
  const movieTitles = [];

  // Read the CSV file (movieDataset.csv) and extract the tconst (IMDb ID) and primaryTitle
  fs.createReadStream('./python/movieDataset.csv')  // Adjust path if needed
    .pipe(csv())
    .on('data', (row) => {
      const imdbId = row.tconst;
      const primaryTitle = row.primaryTitle;

      if (imdbId && primaryTitle) {
        movieTitles.push({ imdbId, primaryTitle });
      }
    })
    .on('end', async () => {
      console.log('CSV file processed. Total movies found:', movieTitles.length);

      // Now, for each movie, check if it exists in the database and add it if not
      for (const movie of movieTitles) {
        try {
          // Check if the movie already exists in the database
          const existingMovie = await Movie.findOne({ imdbId: movie.imdbId });
          if (!existingMovie) {
            // Create a new movie record if not found
            const newMovie = new Movie({
              primaryTitle: movie.primaryTitle,
              imdbId: movie.imdbId,
            });

            await newMovie.save();
            console.log(`Movie saved: ${movie.primaryTitle}`);
          } else {
            console.log(`Movie already exists: ${movie.primaryTitle}`);
          }
        } catch (error) {
          console.error('Error processing movie:', movie.primaryTitle, error);
        }
      }
    });
}

// Call the function to populate the database
fetchAndSaveMoviesFromCSV();
