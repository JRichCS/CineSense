import React from 'react';
import { FaStar, FaCalendarAlt, FaFilm } from 'react-icons/fa';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

const MovieCard = ({ movie }) => {
  return (
    <div className="cine-card p-4 w-full max-w-48 group cursor-pointer transform transition-all duration-300 hover:scale-105">
      {/* Movie Poster */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        {movie.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${movie.posterPath}`}
            alt={`${movie.primaryTitle} Poster`}
            className="w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-60 bg-cine-gray rounded-lg flex items-center justify-center border border-cine-light-gray">
            <div className="text-center">
              <FaFilm className="mx-auto h-8 w-8 text-cine-text-secondary mb-2" />
              <p className="text-cine-text-secondary text-sm">No Image</p>
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-cine-gold text-cine-dark px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
            <FaStar className="h-3 w-3" />
            <span>{movie.rating}</span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cine-text leading-tight line-clamp-2 group-hover:text-cine-gold transition-colors duration-300">
          {movie.primaryTitle}
        </h4>
        
        <div className="flex items-center justify-between text-xs text-cine-text-secondary">
          <div className="flex items-center space-x-1">
            <FaCalendarAlt className="h-3 w-3" />
            <span>{movie.releaseYear}</span>
          </div>
          
          {movie.genres && (
            <div className="text-right max-w-20">
              <span className="truncate block" title={movie.genres}>
                {movie.genres.split(',')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {movie.directors && (
          <p className="text-xs text-cine-text-secondary truncate" title={movie.directors}>
            Dir: {movie.directors}
          </p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-cine-gold bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default MovieCard;
