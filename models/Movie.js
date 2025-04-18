const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const movieSchema = new mongoose.Schema({
  title: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [commentSchema]
});

module.exports = mongoose.model('Movie', movieSchema);
