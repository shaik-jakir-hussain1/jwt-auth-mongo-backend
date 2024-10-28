const mongoose = require("mongoose");

// Connect to MongoDB with error handling
mongoose
  .connect(`mongodb://127.0.0.1:27017/authtestapp`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, min: 0 }, // Optional: Set a minimum age
});

// Export the user model
module.exports = mongoose.model("User", userSchema);
