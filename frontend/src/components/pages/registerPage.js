import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Unified Color Palette
const PRIMARY_COLOR = "#FFFFFF";    // Text
const SECONDARY_COLOR = "#11100F";  // Background
const ACCENT_COLOR = "#FFFFFF";     // Accents
const BUTTON_COLOR = "#383531";     // Buttons
const TEXT_COLOR = "#FCC705";       // Highlighted Text

const url = `${process.env.REACT_APP_BACKEND_SERVER_URI}/user/signup`;

const Register = () => {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [bgColor, setBgColor] = useState(SECONDARY_COLOR);
  const [bgText, setBgText] = useState("Light Mode");
  const navigate = useNavigate();

  useEffect(() => {
    if (light) {
      setBgColor("#FFFFFF");
      setBgText("Dark Mode");
    } else {
      setBgColor(SECONDARY_COLOR);
      setBgText("Light Mode");
    }
  }, [light]);

  const labelStyling = {
    color: TEXT_COLOR,
    fontWeight: "bold",
    textDecoration: "none",
  };

  const backgroundStyling = {
    background: bgColor,
    color: PRIMARY_COLOR,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const formContainerStyle = {
    backgroundColor: "#1c1b1a",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)",
    width: "100%",
    maxWidth: "400px",
  };

  const buttonStyling = {
    background: BUTTON_COLOR,
    border: "none",
    color: ACCENT_COLOR,
    width: "100%",
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await axios.post(url, data);
      const { accessToken } = res;

      window.alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div style={backgroundStyling}>
      <div style={formContainerStyle}>
        <h3 style={{ color: TEXT_COLOR, textAlign: "center", marginBottom: "1rem" }}>
          Create Account
        </h3>
        <Form>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label style={labelStyling}>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              onChange={handleChange}
              placeholder="Enter username"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label style={labelStyling}>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label style={labelStyling}>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Password"
            />
          </Form.Group>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexSwitchCheckDefault"
              onChange={() => setLight(!light)}
            />
            <label
              className="form-check-label text-muted"
              htmlFor="flexSwitchCheckDefault"
              style={{ fontSize: "0.9rem" }}
            >
              {bgText}
            </label>
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          )}

          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            style={buttonStyling}
          >
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register;
