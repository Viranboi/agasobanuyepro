const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('videosite.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    thumbnail TEXT,
    iframe TEXT NOT NULL,
    category TEXT NOT NULL  -- Added category column
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER,
    username TEXT,
    comment TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS likes (
    video_id INTEGER PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (video_id) REFERENCES videos(id)
  )`);
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Serve the index.html file when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all videos
app.get('/videos', (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;  // Number of movies per page
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE title LIKE ? LIMIT ? OFFSET ?", [`%${search}%`, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return the list of videos
  });
});

// Get movies by category
app.get('/videos/category/:category', (req, res) => {
  const category = req.params.category;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;  // Number of movies per page
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = ? LIMIT ? OFFSET ?", [category, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return movies for the specified category
  });
});

// Get movies by Power Movies category
app.get('/videos/category/power-movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = 'Power Movies' LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return power movies
  });
});

// Get movies by Indian Movies category
app.get('/videos/category/indian-movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = 'Indian Movies' LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return Indian movies
  });
});

// Get movies by Comedy Movies category
app.get('/videos/category/comedy-movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = 'Comedy Movies' LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return comedy movies
  });
});

// Get movies by Cartoon Movies category
app.get('/videos/category/cartoon-movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = 'Cartoon Movies' LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return cartoon movies
  });
});

// Get movies by Other Movies category
app.get('/videos/category/other-movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.all("SELECT * FROM videos WHERE category = 'Other Movies' LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json(rows); // Return other movies
  });
});

// Get a single video
app.get('/video/:id', (req, res) => {
  const videoId = req.params.id;
  db.get("SELECT * FROM videos WHERE id = ?", [videoId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Video not found" });
    res.json(row); // Return a specific video data
  });
});

// Add a new video
app.post('/add-video', (req, res) => {
  const { title, thumbnail, iframe, category } = req.body;
  if (!title || !iframe || !thumbnail || !category) return res.status(400).json({ error: "Missing fields" });

  db.run("INSERT INTO videos (title, thumbnail, iframe, category) VALUES (?, ?, ?, ?)", [title, thumbnail, iframe, category], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run("INSERT INTO likes (video_id, count) VALUES (?, 0)", [this.lastID]);
    res.json({ id: this.lastID }); // Return the new video's ID
  });
});

// Like a video
app.post('/like/:id', (req, res) => {
  const videoId = req.params.id;
  db.get("SELECT * FROM videos WHERE id = ?", [videoId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Video not found" });

    db.run("UPDATE likes SET count = count + 1 WHERE video_id = ?", [videoId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Get likes count
app.get('/likes/:id', (req, res) => {
  db.get("SELECT count FROM likes WHERE video_id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ likes: row ? row.count : 0 });
  });
});

// Post comment
app.post('/comment/:id', (req, res) => {
  const { username, comment } = req.body;
  const videoId = req.params.id;

  if (!username || !comment) return res.status(400).json({ error: "Missing fields" });

  db.get("SELECT * FROM videos WHERE id = ?", [videoId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Video not found" });

    db.run("INSERT INTO comments (video_id, username, comment) VALUES (?, ?, ?)", [videoId, username, comment], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Get comments
app.get('/comments/:id', (req, res) => {
  db.all("SELECT username, comment, date FROM comments WHERE video_id = ? ORDER BY date DESC", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get related videos by title similarity
app.get('/related/:id', (req, res) => {
  db.get("SELECT title FROM videos WHERE id = ?", [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Not found" });
    const keyword = row.title.split(' ')[0]; // Use the first word of the title for similarity
    db.all("SELECT * FROM videos WHERE title LIKE ? AND id != ?", [`%${keyword}%`, req.params.id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows);
    });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
