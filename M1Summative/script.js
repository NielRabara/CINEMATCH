// script.js
const API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const OMDB_KEY = 'a39def2e';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const ENDPOINTS = {
    popular: `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`,
    top_rated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`,
    upcoming: `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`,
    search: `${BASE_URL}/search/movie?api_key=${API_KEY}&query="`
};

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const navBtns = document.querySelectorAll('.nav-btn');

getMovies(ENDPOINTS.popular);

// MAIN FETCH
async function getMovies(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.results) {
            showMovies(data.results);
        } else {
            main.innerHTML = `<h2 class="text-center col-span-full">No movies found.</h2>`;
        }
    } catch (error) {
        console.error(error);
    }
}

// RENDER CARD 


async function showMovies(movies) {
    main.innerHTML = '';
    const likedMovies = JSON.parse(localStorage.getItem('myLikes')) || [];

    for (const movie of movies) {
        const { id, title, poster_path, overview, release_date } = movie;
        const isLiked = likedMovies.includes(id);

        const movieEl = document.createElement('div');
        
        movieEl.classList.add('movie-card', 'bg-gray-900', 'rounded-xl', 'overflow-hidden', 'shadow-xl', 'relative', 'group', 'border', 'border-gray-800', 'transition-all', 'duration-300');

        const imageSrc = poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750?text=No+Image';
        const year = release_date ? release_date.split('-')[0] : 'N/A';

        movieEl.innerHTML = `
            <div class="h-[450px] w-full relative z-0">
                <img src="${imageSrc}" alt="${title}" class="w-full h-full object-cover opacity-90 transition-opacity duration-300">
            </div>

            <div class="absolute inset-0 bg-gray-900/95 p-6 
                        transform translate-y-full group-hover:translate-y-0 transition-transform 
                        duration-300 overflow-y-auto z-10 pb-28">
                
                <h3 class="font-bold text-xl mb-3 text-pink-500">Overview</h3>
                
                <p class="text-sm text-gray-200 font-medium leading-relaxed">
                    ${overview || "No details available."}
                </p>
            </div>
            
            <div class="absolute bottom-0 left-0 right-0 bg-gray-900 p-4 z-20 border-t border-gray-800 shadow-lg">
                <h3 class="text-lg font-bold text-white truncate mb-2" title="${title}">${title}</h3>
                
                <div class="flex justify-between items-center">
                    <span class="text-pink-400 text-sm font-bold border border-pink-900/50 bg-pink-900/20 px-2 py-0.5 rounded">${year}</span>
                    
                    <div class="flex items-center gap-3">
                        <div id="ratings-${id}" class="flex gap-2">
                             <span class="w-16 h-4 bg-gray-700 rounded animate-pulse"></span>
                        </div>
                        
                        <button onclick="toggleLike(${id})" class="focus:outline-none transform active:scale-110 transition-transform hover:text-pink-500">
                            <span id="icon-${id}" class="material-icons text-2xl ${isLiked ? 'text-pink-500' : 'text-gray-600'}">
                                ${isLiked ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        main.appendChild(movieEl);
        fetchRatings(id); 
    }
}

// FETCH RATINGS
async function fetchRatings(tmdbId) {
    try {
        const idRes = await fetch(`${BASE_URL}/movie/${tmdbId}/external_ids?api_key=${API_KEY}`);
        const idData = await idRes.json();
        
        if(idData.imdb_id) {
            const omdbRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${idData.imdb_id}`);
            const omdbData = await omdbRes.json();
            
            const rt = omdbData.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value || '';
            const imdb = omdbData.imdbRating || '';
            
            // Update the UI
            const container = document.getElementById(`ratings-${tmdbId}`);
            if(container && (rt || imdb)) {
                container.innerHTML = `
                    ${rt ? `<span class="bg-red-100 text-red-600 px-1 rounded border border-red-200">🍅 ${rt}</span>` : ''}
                    ${imdb ? `<span class="bg-yellow-100 text-yellow-700 px-1 rounded border border-yellow-200">⭐ ${imdb}</span>` : ''}
                `;
            } else if (container) {
                container.innerHTML = `<span class="text-gray-500">No Ratings</span>`;
            }
        }
    } catch (e) { console.log(e); }
}

// TOGGLE LIKE
function toggleLike(id) {
    let favorites = JSON.parse(localStorage.getItem('myLikes')) || [];
    const icon = document.getElementById(`icon-${id}`);

    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        if(icon) {
            icon.innerText = 'favorite_border';
            icon.classList.remove('text-pink-500');
            icon.classList.add('text-gray-600');
        }
    } else {
        favorites.push(id);
        if(icon) {
            icon.innerText = 'favorite';
            icon.classList.remove('text-gray-600');
            icon.classList.add('text-pink-500');
        }
    }
    localStorage.setItem('myLikes', JSON.stringify(favorites));
}

// SHOW FAVORITES
async function showFavorites() {
    navBtns.forEach(btn => btn.classList.remove('active-btn'));
    event.target.classList.add('active-btn');

    const favorites = JSON.parse(localStorage.getItem('myLikes')) || [];
    
    if (favorites.length === 0) {
        main.innerHTML = `<h2 class="text-center col-span-full text-2xl text-pink-400 font-bold">No likes yet! Go add some ❤️</h2>`;
        return;
    }

    main.innerHTML = '<h2 class="text-center w-full col-span-full text-white text-xl animate-pulse">Loading your favorites...</h2>';
    const promises = favorites.map(id => 
        fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`).then(res => res.json())
    );

    const movies = await Promise.all(promises);
    showMovies(movies);
}

// CATEGORY SWITCH
function switchCategory(category) {
    navBtns.forEach(btn => btn.classList.remove('active-btn'));
    const btns = Array.from(navBtns);
    const target = btns.find(b => b.innerText.toLowerCase().includes(category.replace('_',' ')));
    if(target) target.classList.add('active-btn');

    getMovies(ENDPOINTS[category]);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = search.value;
    if(term) {
        getMovies(ENDPOINTS.search + term);
        search.value = '';
        navBtns.forEach(b => b.classList.remove('active-btn'));
    }
});