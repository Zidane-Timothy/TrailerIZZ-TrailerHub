const API_KEY = 'api_key=29c70bc6f664ab4ffe181138f61b38ea';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const GENRES_API = `https://api.themoviedb.org/3/genre/movie/list?${API_KEY}&language=en-US`;
const TRENDING_API = `https://api.themoviedb.org/3/trending/all/day?${API_KEY}`;

const main = document.getElementById('main');
const navbar = document.getElementById('nav-bar');

getMovies(API_URL);
getGenres(GENRES_API);

// Sends a request to the API and retrieves a list of popular movies sorted by popularity and calls the `showMovies(movies)` function to populate the webpage with the movies.
async function getMovies(url) {
  const resp = await fetch(url);
  const respData = await resp.json();
  console.log(respData);
  showMovies(respData.results);
}


// Empties the `main` element, populates the `main` element with a `div` element for each movie, retrieves the first movie trailer and a list of similar movies for each movie and populates each movie `div` with the movie's poster, title, rating, overview, trailer, and similar movies.
async function showMovies(movies) {
  main.innerHTML = '';
  for (const movie of movies) {
    const { poster_path, title, vote_average, overview, id } = movie;
    
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');

    // Retrieve the first movie trailer
    const trailersResp = await fetch(`${BASE_URL}/movie/${id}/videos?${API_KEY}`);
    const trailersData = await trailersResp.json();
    const trailers = trailersData.results.filter(trailer => trailer.type === 'Trailer');
    const trailerKey = trailers.length > 0 ? trailers[0].key : '';
    
    const imageUrl = poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750?text=No+Image';
    
    movieEl.innerHTML = `
      <img src="${imageUrl}" alt="${title}">
      <div class="movie-info">
        <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
      </div>
      <div class="overview">
        <h3>${title}</h3>
        <h3>Overview</h3>
        ${overview}
         <div class="trailers">
          ${trailerKey ? `<button class="play-button" data-trailer="${trailerKey}"><span>WATCH TRAILER</span></button>` : '<h3>Sorry! No trailer available.</h3>'}
        </div>
        <h3>Similar Movies</h3>
        <div class="similar-movies">
          ${await getSimilarMovies(id).then(similarMovies => {
            if (similarMovies.length > 0) {
              return similarMovies.map(similarMovie => `
                <div class="similar-movie">
                  <img src="${similarMovie.poster_path ? IMG_PATH + similarMovie.poster_path : 'https://via.placeholder.com/500x750?text=No+Image'}" alt="${similarMovie.title}">
                  <h4>${similarMovie.title}</h4>
                </div>
              `).join('');
            } else {
              return '<h3>Sorry! No similar movies available.</h3>';
            }
          })}
        </div>
      </div>
    `;

    main.appendChild(movieEl);
    const playButtons = movieEl.querySelectorAll('.play-button');
    playButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const trailerKey = button.getAttribute('data-trailer');
        const trailerUrl = `https://www.youtube.com/embed/${trailerKey}`;
        window.open(trailerUrl, 'trailerWindow', 'width=640,height=360');
      });
    });
  }
}

// Sends a request to the API and retrieves a list of similar movies for a given movie ID.
async function getSimilarMovies(movieID) {
  const resp = await fetch(`${BASE_URL}/movie/${movieID}/similar?${API_KEY}`);
  const respData = await resp.json();
  return respData.results;
}

// Returns a CSS class based on the movie's rating.
function getClassByRate(vote) {
  if (vote >= 8) {
    return 'green';
  } else if (vote >= 5) {
    return 'orange';
  } else {
    return 'red';
  }
}

// Retrieves a list of all available movie genres from the API, populates a dropdown menu with the genres and calls the `showGenres(genreList)` function.
async function getGenres(url) {
  const resp = await fetch(url);
  const respData = await resp.json();
  console.log(respData.genres);
  showGenres(respData.genres);
}

// Sends a request to the API and retrieves a list of movies that match the selected genre and calls the `showMovies(movies)` function to populate the webpage with the movies.
async function searchByGenre(genreID) {
  const resp = await fetch(`https://api.themoviedb.org/3/discover/movie?${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genreID}&with_original_language=en`);
  const respData = await resp.json();
  showMovies(respData.results);
}

// Creates a dropdown menu and populates it with the available genres, appends the dropdown menu to the `navbar` element and calls the `searchByGenre(genreID)` function when a user selects a genre.
function showGenres(genreList) {
  const selectEl = document.createElement('select');
  selectEl.classList.add('genre-select');
  const defaultOptionEl = document.createElement('option');
  defaultOptionEl.selected = true;
  defaultOptionEl.disabled = true;
  defaultOptionEl.textContent = 'Genre';
  selectEl.appendChild(defaultOptionEl);
  genreList.forEach((genre) => {
    const optionEl = document.createElement('option');
    optionEl.value = genre.id;
    optionEl.textContent = genre.name;
    selectEl.appendChild(optionEl);
  });

  navbar.innerHTML = '';
  navbar.appendChild(selectEl);
  selectEl.addEventListener('change', () => {
    searchByGenre(selectEl.value);
  });
}

// Adds an event listener to the search form submit button, prevents the form from submitting by default retrieves the user's search query and sends a request to the API to search for movies that match the query and calls the `showMovies(movies)` function to populate the webpage with the movies.
const searchForm = document.querySelector('form');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = searchForm.querySelector('input').value;
  const searchURL = `${BASE_URL}/search/movie?${API_KEY}&query=${searchTerm}`;
  getMovies(searchURL);
});
