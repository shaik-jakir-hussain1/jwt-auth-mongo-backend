const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Import the auth routes
const authRoutes = require("./routes/auth");

// Route to render index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Use the authentication routes
app.use(authRoutes);

// Start the server and log a confirmation message
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});