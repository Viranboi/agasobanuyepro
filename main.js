let movies = [];
let selectedMovie = null;

document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  document.getElementById('searchBar').addEventListener('input', searchMovies);
  document.getElementById('commentForm').addEventListener('submit', postComment);
  document.getElementById('likeBtn').addEventListener('click', likeMovie);
});

function loadMovies() {
  fetch('/movies')
    .then(res => res.json())
    .then(data => {
      movies = data;
      displayMovies(data);
    });
}

function displayMovies(movieArray) {
  const container = document.getElementById('movieList');
  container.innerHTML = '';

  movieArray.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.innerHTML = `
      <img src="${movie.thumbnail}" alt="${movie.title}">
      <h4>${movie.title}</h4>
    `;
    div.onclick = () => openMovie(movie);
    container.appendChild(div);
  });
}

function searchMovies(e) {
  const keyword = e.target.value.toLowerCase();
  const filtered = movies.filter(m => m.title.toLowerCase().includes(keyword));
  displayMovies(filtered);
}

function openMovie(movie) {
  selectedMovie = movie;
  document.getElementById('movieList').classList.add('hidden');
  document.getElementById('playerSection').classList.remove('hidden');
  document.getElementById('videoTitle').innerText = movie.title;
  document.getElementById('videoThumb').src = movie.thumbnail;
  document.getElementById('videoIframe').src = movie.link;
  document.getElementById('likeCount').innerText = movie.likes || 0;

  loadComments(movie.id);
  showRelatedMovies(movie.title);
}

function loadComments(movieId) {
  fetch(`/comments/${movieId}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('commentList');
      list.innerHTML = '';
      data.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<strong>${c.username}:</strong> ${c.text}`;
        list.appendChild(div);
      });
    });
}

function postComment(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const text = document.getElementById('commentText').value.trim();

  if (!username || !text) return;

  fetch('/comment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ movie_id: selectedMovie.id, username, text })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById('commentForm').reset();
    loadComments(selectedMovie.id);
  });
}

function likeMovie() {
  fetch(`/like/${selectedMovie.id}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      document.getElementById('likeCount').innerText = data.likes;
      selectedMovie.likes = data.likes;
    });
}

function showRelatedMovies(title) {
  const keyword = title.split(' ')[0].toLowerCase();
  const related = movies.filter(m => m.title.toLowerCase().includes(keyword) && m.id !== selectedMovie.id);
  const container = document.getElementById('relatedList');
  container.innerHTML = '';

  related.forEach(movie => {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.innerHTML = `
      <img src="${movie.thumbnail}" alt="${movie.title}">
      <h4>${movie.title}</h4>
    `;
    div.onclick = () => openMovie(movie);
    container.appendChild(div);
  });
}
