import React, { useState, useEffect } from "react";
import MovieAutosuggest from "../MovieAutosuggest";
import axios from "axios";
import getUserInfo from "../../utilities/decodeJwt";
import MovieCard from "../../components/MovieCard";
import Button from "react-bootstrap/Button";

// Unified Color Palette
const PRIMARY_COLOR = "#FFFFFF";    // Text
const SECONDARY_COLOR = "#11100F";  // Background
const ACCENT_COLOR = "#FFFFFF";     // Accents
const BUTTON_COLOR = "#383531";     // Buttons
const TEXT_COLOR = "#FCC705";       // Highlighted Text

const MovieRecommendationPage = () => {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [previousRecommendations, setPreviousRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [has404, setHas404] = useState(false);
  const [weights, setWeights] = useState({
    genre: 1,
    director: 1,
    actor: 1,
    rating: 1,
  });
  
  const user = getUserInfo();

  useEffect(() => {
    const fetchOnce = async () => {
      if (user?.id && !has404) {
        await loadRecentRecommendations(user.id);
      }
    };

    fetchOnce();
  }, []); // Empty array = only runs once when component mounts

  const loadRecentRecommendations = async (userId) => {
    setRecentLoading(true);
    setError("");

    try {
      const res = await axios.get(`http://localhost:8081/history/recommendations/${userId}`);
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
      const response = await axios.post('http://localhost:8081/recommend', {
        movie_ids: selectedMovies.map((m) => m.imdbId),
        weights: weights, // <-- Pass the weights here
      });
      console.log(weights)
  
      setRecommendations(response.data.recommendations);
      await axios.post(`http://localhost:8081/history/recommendations/${user.id}`, {
        recommendations: response.data.recommendations,
      });
    } catch (err) {
      setError("Failed to get recommendations");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };
  

  const containerStyle = {
    background: SECONDARY_COLOR,
    color: PRIMARY_COLOR,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    padding: "2rem",
  };
  
  const boxStyle = {
    backgroundColor: "#1c1b1a",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
    width: "100%",
    marginBottom: "2rem",
    marginLeft: "1rem",
    marginRight: "1rem",
    paddingLeft: "1rem",  // Adds padding to prevent clipping on left side
    //paddingRight: "1rem", // Adds padding to prevent clipping on right side
  };

  
  

  return (
    
    <div style={containerStyle}>
      <div
        style={{
          position: "fixed",
          top: "6rem",
          right: "1rem",
          backgroundColor: "#1c1b1a",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
          zIndex: 1000,
          width: "220px",
          color: PRIMARY_COLOR,
          fontSize: "0.85rem",
        }}
      >
        <h4 style={{ color: TEXT_COLOR, marginBottom: "0.75rem", textAlign: "center" }}>
          Tune Weights
        </h4>

        {["genre", "director", "actor", "rating"].map((key) => (
          <div key={key} style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", color: PRIMARY_COLOR, marginBottom: "0.25rem" }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {weights[key]}
            </label>
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
              style={{ width: "100%" }}
            />
          </div>
        ))}
      </div>


      <h2 style={{ textAlign: "center", fontSize: "1.5rem", color: TEXT_COLOR }}>Get Movie Recommendations</h2>
      
      <MovieAutosuggest onMovieSelect={handleMovieSelect} />

      {selectedMovies.length > 0 && (
        <div style={boxStyle}>
          <h3 style={{ color: TEXT_COLOR, textAlign: "center", marginBottom: "1rem" }}>Selected Movies</h3>
          <div className="overflow-x-auto whitespace-nowrap flex gap-4 py-2">
            {selectedMovies.map((movie) => (
              <div key={movie.imdbId} className="inline-block">
                <div className="flex flex-col items-center">
                  <MovieCard movie={movie} />
                  <button
                    onClick={() => removeSelectedMovie(movie.imdbId)}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                  >
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={fetchRecommendations}
        disabled={loading || selectedMovies.length === 0}
        style={{
          background: BUTTON_COLOR,
          color: TEXT_COLOR,
          width: "20%",
          padding: "1rem",
          marginBottom: "2rem",
        }}
      >
        {loading ? "Loading..." : "Get Recommendations"}
      </Button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {recommendations.length > 0 && (
        <div style={boxStyle}>
          <h3 style={{ color: TEXT_COLOR, textAlign: "center", marginBottom: "1rem" }}>Recommended Movies</h3>
          <div className="overflow-x-auto whitespace-nowrap flex gap-4 py-2">
            {recommendations.map((movie) => (
              <div key={movie.imdbId} className="inline-block">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={boxStyle}>
        <h3 style={{ color: TEXT_COLOR, textAlign: "center", marginBottom: "1rem" }}>Previously Recommended Movies</h3>
        {previousRecommendations.length > 0 ? (
          <div className="overflow-x-auto whitespace-nowrap flex gap-4 py-2">
            {previousRecommendations.map((movie) => (
              <div key={movie.imdbId} className="inline-block">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : recentLoading ? (
          <p>Loading previous recommendations...</p>
        ) : (
          <p>No previous recommendations found.</p>
        )}
      </div>
    </div>
  );
};

export default MovieRecommendationPage;
