import React, { createContext, useState, useEffect } from "react";
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";
import './index.css';


// We import all the components we need in our app
import Navbar from "./components/navbar";
import LandingPage from "./components/pages/landingPage";
import Login from "./components/pages/loginPage";
import Signup from "./components/pages/registerPage";
import PrivateUserProfile from "./components/pages/privateUserProfilePage";
import MovieRecommendationPage from "./components/pages/movieRecommendationPage"; // Import the new page

import getUserInfo from "./utilities/decodeJwt";

export const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <>
      <Navbar />
      <UserContext.Provider value={user}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route path="/profile" element={<PrivateUserProfile />} />
          <Route path="/recommend" element={<MovieRecommendationPage />} />
        </Routes>
      </UserContext.Provider>
    </>
  );
};

export default App;
