const express = require('express');
const mysql = require('mysql2');
const app = express();

// Set up the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Replace with your username
    password: '',  // Replace with your password
    database: 'your_database_name'  // Replace with your database name
});

// Serve static files (like CSS)
app.use(express.static('public'));

// Endpoint to get movie data
app.get('/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});

// Endpoint to handle like button
app.post('/like/:id', (req, res) => {
    const movieId = req.params.id;
    db.query('UPDATE movies SET likes = likes + 1 WHERE id = ?', [movieId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.send({ message: 'Liked successfully' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
