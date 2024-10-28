const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /create - User registration
router.post("/create", async (req, res) => {
  let { username, email, password, age } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let createdUser = await userModel.create({
      username,
      email,
      password: hash,
      age,
    });

    let token = jwt.sign({ email }, "shhhhhhhhh");
    res.cookie("token", token);
    res.send(createdUser);
  } catch (err) {
    res.status(500).send("Error creating user");
  }
});

// GET /login - Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// POST /login - User login
router.post("/login", async (req, res) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("User not found");

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: user.email }, "shhhhhhhhh");
      res.cookie("token", token);
      res.send("yes you can login");
    } else {
      res.status(401).send("Invalid password");
    }
  });
});

// GET /logout - User logout
router.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

module.exports = router;
