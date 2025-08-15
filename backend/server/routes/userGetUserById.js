const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newUserModel = require("../models/userModel");

router.get("/getUserById", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send("userId is required");
  }

  try {
    const user = await newUserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
