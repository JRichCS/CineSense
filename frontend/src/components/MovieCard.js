import React from 'react';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

const MovieCard = ({ movie }) => {
  return (
    <div
      className="bg-[#11100F] text-white rounded-xl shadow-md w-44 text-center flex-shrink-0"
      style={{
        backgroundColor: "#11100F",
        //boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
        paddingLeft: "1rem",  // Adjust padding for the left side
        paddingRight: "1rem", // Adjust padding for the right side
        paddingTop: "1rem",   // Optional, adjust for top padding if needed
        paddingBottom: "1rem", // Optional, adjust for bottom padding if needed
      }}
    >
      {movie.posterPath ? (
        <img
          src={`${TMDB_IMAGE_BASE}${movie.posterPath}`}
          alt={`${movie.primaryTitle} Poster`}
          className="w-full h-auto rounded-md mb-2"
        />
      ) : (
        <div className="w-full h-60 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-sm mb-2">
          No Image
        </div>
      )}
      <h4 className="text-sm font-semibold break-words whitespace-normal mb-1">
        {movie.primaryTitle}
      </h4>
      <p className="text-xs text-gray-500">{movie.releaseYear}</p>
      {movie.rating && (
        <p className="text-sm text-yellow-600 font-medium mt-1">
          ⭐ {movie.rating}
        </p>
      )}
    </div>
  );
};

export default MovieCard;
