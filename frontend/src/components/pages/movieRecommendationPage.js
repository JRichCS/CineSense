import React, { useState, useEffect } from "react";
import MovieAutosuggest from "../MovieAutosuggest";
import axios from "axios";
import getUserInfo from "../../utilities/decodeJwt";
import MovieCard from "../../components/MovieCard";
import { FaFilm, FaSlidersH, FaSearch, FaHistory, FaStar, FaTimes, FaPlay, FaBrain, FaRobot } from "react-icons/fa";

const MovieRecommendationPage = () => {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [previousRecommendations, setPreviousRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [has404, setHas404] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [weights, setWeights] = useState({
    genre: 0.5,
    director: 0.5,
    actor: 0.5,
    rating: 0.5,
  });
  
  const user = getUserInfo();

  useEffect(() => {
    const fetchOnce = async () => {
      if (user?.id && !has404) {
        await loadRecentRecommendations(user.id);
      }
    };

    fetchOnce();
  }, []);

  const loadRecentRecommendations = async (userId) => {
    setRecentLoading(true);
    setError("");

    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/history/recommendations/${userId}`);
      if (res.data && Array.isArray(res.data.recommendations)) {
        setPreviousRecommendations(res.data.recommendations);
      } else {
        setPreviousRecommendations([]);
        setError("Unexpected response format.");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setHas404(true);
      } else {
        setError("Failed to load recent recommendations.");
      }
      setPreviousRecommendations([]);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleMovieSelect = (movie) => {
    if (!selectedMovies.some((m) => m.imdbId === movie.imdbId)) {
      setSelectedMovies((prev) => [...prev, movie]);
    }
  };

  const removeSelectedMovie = (imdbId) => {
    setSelectedMovies((prev) => prev.filter((movie) => movie.imdbId !== imdbId));
  };

  const fetchRecommendations = async () => {
    if (selectedMovies.length === 0) return;
  
    setLoading(true);
    setError('');
    setRecommendations([]);
  
    try {
      if (useOpenAI) {
        // Use OpenAI API route
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/recommend/openai`, {
          movie_ids: selectedMovies.map((m) => m.imdbId),
          weights: weights,
        });
        
        // OpenAI returns just IMDB IDs, so we need to fetch the full movie data
        const moviePromises = response.data.recommendations.map(async (imdbId) => {
          try {
            const movieRes = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/search?q=${imdbId}`);
            return movieRes.data.find(movie => movie.imdbId === imdbId) || { imdbId, primaryTitle: 'Unknown Movie' };
          } catch (err) {
            return { imdbId, primaryTitle: 'Unknown Movie' };
          }
        });
        
        const movieData = await Promise.all(moviePromises);
        
        // Filter out movies that are already in the selected list
        const filteredRecommendations = movieData.filter(movie => 
          !selectedMovies.some(selected => selected.imdbId === movie.imdbId)
        );
        
        setRecommendations(filteredRecommendations);
        
        // Save to history
        await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/history/recommendations/${user.id}`, {
          recommendations: filteredRecommendations,
        });
      } else {
        // Use traditional ML model
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/recommend`, {
          movie_ids: selectedMovies.map((m) => m.imdbId),
          weights: weights,
        });
  
        // Filter out movies that are already in the selected list
        const filteredRecommendations = response.data.recommendations.filter(movie => 
          !selectedMovies.some(selected => selected.imdbId === movie.imdbId)
        );
        
        setRecommendations(filteredRecommendations);
        await axios.post(`${process.env.REACT_APP_BACKEND_SERVER_URI}/history/recommendations/${user.id}`, {
          recommendations: filteredRecommendations,
        });
      }
    } catch (err) {
      setError("Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cine-dark pt-20">
      {/* Header Section */}
      <div className="bg-cine-dark-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-20 w-20 bg-cine-gold rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
            <FaFilm className="h-10 w-10 text-cine-dark" />
          </div>
          <h1 className="text-4xl font-cine-display font-bold text-cine-text mb-4">
            Discover new movies with CineSense
          </h1>
     
          {/* AI Model Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-cine-text font-medium">ML Model</span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cine-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cine-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cine-gold"></div>
            </label>
            
            <div className="flex items-center space-x-3">
              <span className="text-cine-text font-medium">OpenAI</span>
            </div>
          </div>
          
          <p className="text-cine-text-secondary text-sm mt-2">
            {useOpenAI ? 'Using OpenAI' : 'Using traditional ML model'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Movie Search Section */}
            <div className="cine-card p-8">
              <h2 className="text-2xl font-cine-display font-bold text-cine-text mb-6 flex items-center">
                <FaSearch className="mr-3 text-cine-gold" />
                Search & Select Movies
              </h2>
              <MovieAutosuggest onMovieSelect={handleMovieSelect} />
            </div>

            {/* Selected Movies */}
            {selectedMovies.length > 0 && (
              <div className="cine-card p-8">
                <h3 className="text-xl font-cine-display font-bold text-cine-text mb-6 flex items-center">
                  <FaStar className="mr-3 text-cine-gold" />
                  Selected Movies ({selectedMovies.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedMovies.map((movie) => (
                    <div key={movie.imdbId} className="relative group">
                      <MovieCard movie={movie} />
                      <button
                        onClick={() => removeSelectedMovie(movie.imdbId)}
                        className="absolute top-2 right-2 bg-cine-red text-cine-text rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-cine-red-hover"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="cine-button flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cine-dark"></div>
                    ) : (
                      <>
                        <FaPlay className="h-5 w-5" />
                        <span>Get {useOpenAI ? 'OpenAI' : 'ML'} Recommendations</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-cine-red bg-opacity-10 border border-cine-red border-opacity-20 rounded-xl p-6">
                <p className="text-cine-red text-center font-medium">{error}</p>
              </div>
            )}

            {/* Current Recommendations */}
            {recommendations.length > 0 && (
              <div className="cine-card p-8">
                <h3 className="text-xl font-cine-display font-bold text-cine-text mb-6 flex items-center">
                  <FaStar className="mr-3 text-cine-gold" />
                  {useOpenAI ? 'OpenAI' : 'ML'} Recommendations ({recommendations.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((movie) => (
                    <div key={movie.imdbId}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Recommendations */}
            <div className="cine-card p-8">
              <h3 className="text-xl font-cine-display font-bold text-cine-text mb-6 flex items-center">
                <FaHistory className="mr-3 text-cine-gold" />
                Previously Recommended
              </h3>
              {previousRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previousRecommendations.map((movie) => (
                    <div key={movie.imdbId}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              ) : recentLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cine-gold mx-auto mb-4"></div>
                  <p className="text-cine-text-secondary">Loading previous recommendations...</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaHistory className="mx-auto h-12 w-12 text-cine-text-secondary mb-4" />
                  <p className="text-cine-text-secondary">No previous recommendations found.</p>
                  <p className="text-cine-text-secondary text-sm mt-2">Start exploring to build your history!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Weights Panel */}
          <div className="lg:col-span-1">
            <div className="cine-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-cine-display font-bold text-cine-text flex items-center">
                  <FaSlidersH className="mr-2 text-cine-gold" />
                  AI Weights
                </h3>
                <button
                  onClick={() => setShowWeights(!showWeights)}
                  className="text-cine-gold hover:text-cine-gold-hover transition-colors"
                >
                  {showWeights ? 'Hide' : 'Show'}
                </button>
              </div>

              {showWeights && (
                <div className="space-y-6">
                  {["genre", "director", "actor", "rating"].map((key) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-cine-text capitalize">
                          {key}
                        </label>
                        <span className="text-cine-gold font-semibold text-sm">
                          {weights[key]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.01}
                        value={weights[key]}
                        onChange={(e) =>
                          setWeights((prev) => ({
                            ...prev,
                            [key]: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-cine-gray rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-cine-gray">
                    <p className="text-xs text-cine-text-secondary text-center">
                      {useOpenAI 
                        ? 'Adjust these weights to guide OpenAI\'s recommendation strategy'
                        : 'Adjust these weights to fine-tune your ML recommendations'
                      }
                    </p>
                  </div>
                </div>
              )}

              {!showWeights && (
                <div className="text-center py-8">
                  <FaSlidersH className="mx-auto h-8 w-8 text-cine-text-secondary mb-3" />
                  <p className="text-cine-text-secondary text-sm">
                    Click to customize AI weights
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-96 h-96 bg-cine-gold opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-cine-blue opacity-5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default MovieRecommendationPage;
