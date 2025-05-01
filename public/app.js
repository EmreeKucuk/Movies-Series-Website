
const genreButtons = document.querySelectorAll('.genre-btn');
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortBtn = document.getElementById('sortBtn');


async function createMovieCard(movie) {
  const card = document.createElement('div');
  card.classList.add('movie-card');
  card.dataset.imdbid = movie.imdbID; 
  
  const image = document.createElement('img');
  image.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/250';
  card.appendChild(image);
  
  const content = document.createElement('div');
  content.classList.add('card-content');
  
  const title = document.createElement('h3');
  title.textContent = movie.Title;
  content.appendChild(title);
  
  const year = document.createElement('p');
  year.textContent = `Year: ${movie.Year}`;
  content.appendChild(year);
  
  const rating = document.createElement('p');
  rating.classList.add('rating');
  rating.textContent = 'Rating: Loading...'; 
  
  try {
    const fullMovieDetails = await fetchMovieDetails(movie.imdbID);
    rating.textContent = `Rating: ${getMovieRating(fullMovieDetails)}`;
  } catch (error) {
    console.error('Error fetching movie details for rating:', error);
    rating.textContent = 'Rating: N/A';
  }
  
  content.appendChild(rating);
  
  const favoriteBtn = document.createElement('button');
  favoriteBtn.classList.add('favorite-btn');
  favoriteBtn.textContent = 'Add to Favorites';
  favoriteBtn.addEventListener('click', () => toggleFavorite(movie, favoriteBtn));
  content.appendChild(favoriteBtn);
  
  card.appendChild(content);
  movieGrid.appendChild(card);
}

// add or remove from favorites
function toggleFavorite(movie, button) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
  if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
    favorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    button.classList.remove('active');
    button.textContent = 'Add to Favorites';
  } else {
    favorites.push(movie);
    button.classList.add('active');
    button.textContent = 'Remove from Favorites';
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}


function setFavoriteButtonState(movie, button) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.some(fav => fav.imdbID === movie.imdbID)) {
    button.classList.add('active');
    button.textContent = 'Remove from Favorites';
  }
}


genreButtons.forEach(button => {
  button.addEventListener('click', async () => {
    genreButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const genre = button.dataset.genre;
    const searchTerm = searchInput.value.trim();
    
    movieGrid.innerHTML = '';
    
    const movies = await fetchMoviesByGenre(genre, searchTerm);
    movies.forEach(createMovieCard);
  });
});


searchBtn.addEventListener('click', async () => {
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm === '') {
    alert('Please enter a movie name to search');
    return;
  }
  
  movieGrid.innerHTML = ''; 
  
  const movies = await fetchMoviesByGenre('all', searchTerm);
  movies.forEach(createMovieCard);
});

// check favorites page loads
window.addEventListener('load', () => {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  favorites.forEach((movie) => {
    const movieCards = document.querySelectorAll('.movie-card');
    const card = Array.from(movieCards).find(card => card.dataset.imdbid === movie.imdbID);
    if (card) {
      const button = card.querySelector('.favorite-btn');
      if (button) {
        setFavoriteButtonState(movie, button);
      }
    }
  });


  loadMovies();
});

// load movies
async function loadMovies() {
  const movies = await fetchMoviesByGenre('all');
  movies.forEach(createMovieCard);
}

// sort IMDb rating
sortBtn.addEventListener('click', async () => {
  const movieCards = Array.from(movieGrid.children);

  const moviesWithRatings = await Promise.all(
    movieCards.map(async (card) => {
      const imdbID = card.dataset.imdbid; 
      const fullMovieDetails = await fetchMovieDetails(imdbID);
      return {
        card,
        rating: parseFloat(fullMovieDetails.imdbRating) || 0, 
      };
    })
  );

  // sort in descending 
  moviesWithRatings.sort((a, b) => b.rating - a.rating);

  // clear 
  movieGrid.innerHTML = '';
  moviesWithRatings.forEach(({ card }) => movieGrid.appendChild(card));
});
