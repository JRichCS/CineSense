import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaFilm, FaUser, FaLock, FaSignInAlt } from "react-icons/fa";

const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/user/login`;

const Login = () => {
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const { data: res } = await axios.post(url, data);
      const { accessToken } = res;
      localStorage.setItem("accessToken", accessToken);
      navigate("/");
      window.location.reload();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cine-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-cine-gold rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
            <FaFilm className="h-8 w-8 text-cine-dark" />
          </div>
          <h2 className="text-3xl font-cine-display font-bold text-cine-text mb-2">
            Welcome Back
          </h2>
          <p className="text-cine-text-secondary">
            Sign in to discover your next favorite movie
          </p>
        </div>

        {/* Form */}
        <div className="cine-card p-8 animate-slide-up">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-cine-text mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-cine-text-secondary" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="cine-input pl-10 w-full"
                  placeholder="Enter your username"
                  value={data.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cine-text mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-cine-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="cine-input pl-10 pr-12 w-full"
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-cine-text-secondary hover:text-cine-gold transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-cine-text-secondary hover:text-cine-gold transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-cine-red bg-opacity-10 border border-cine-red border-opacity-20 rounded-lg p-4">
                <p className="text-cine-red text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="cine-button w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cine-dark"></div>
              ) : (
                <>
                  <FaSignInAlt className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-cine-text-secondary">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-cine-gold hover:text-cine-gold-hover font-medium transition-colors duration-300"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cine-gold opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cine-blue opacity-5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
