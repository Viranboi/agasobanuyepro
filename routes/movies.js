const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

router.get('/:title', async (req, res) => {
  const movie = await Movie.findOne({ title: req.params.title });
  if (!movie) return res.status(404).json({ message: 'Not found' });
  res.json(movie);
});

router.post('/:title/like', async (req, res) => {
  const movie = await Movie.findOneAndUpdate({ title: req.params.title }, { $inc: { likes: 1 } }, { new: true, upsert: true });
  res.json(movie);
});

router.post('/:title/dislike', async (req, res) => {
  const movie = await Movie.findOneAndUpdate({ title: req.params.title }, { $inc: { dislikes: 1 } }, { new: true, upsert: true });
  res.json(movie);
});

router.post('/:title/comment', async (req, res) => {
  const { name, text } = req.body;
  const movie = await Movie.findOneAndUpdate(
    { title: req.params.title },
    { $push: { comments: { name, text } } },
    { new: true, upsert: true }
  );
  res.json(movie);
});

module.exports = router;
