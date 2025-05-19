// personpage.js

// person_id 파라미터 추출
function getPersonIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('person_id');
}

async function fetchPersonInfo(person_id) {
  // 백엔드 프록시 API로 요청
  const personRes = await fetch(`/movie/person/${person_id}`);
  const person = await personRes.json();
  const creditsRes = await fetch(`/movie/person/${person_id}/credits`);
  const credits = await creditsRes.json();
  return { person, credits };
}

function renderPersonProfile(person) {
  const section = document.getElementById('person_profile');
  section.innerHTML = `
    <img src="${person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : './img/noimg.png'}" class="person_profile_img" alt="프로필 이미지" />
    <div class="person_profile_info">
      <h2>${person.name}</h2>
      <span>${person.known_for_department || ''}</span><br/>
      <span>${person.birthday ? '출생: ' + person.birthday : ''}</span>
      <div style="margin-top:0.7em;color:var(--color-muted);font-size:1.01rem;">${person.biography ? person.biography.slice(0, 200) + (person.biography.length > 200 ? '...' : '') : ''}</div>
    </div>
  `;
}

function renderMoviesGrid(movies, gridId) {
  const grid = document.getElementById(gridId);
  if (!movies || movies.length === 0) {
    grid.innerHTML = '<p>결과가 없습니다.</p>';
    return;
  }
  grid.innerHTML = movies.map(movie => `
    <div class="search_card" data-movie-id="${movie.id || movie.movie_id}" style="cursor:pointer;">
      <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './img/noimg.png'}" class="search_poster" alt="포스터" />
      <div class="search_info">
        <h3>${movie.title || movie.name}</h3>
        <p>${movie.release_date || ''}</p>
      </div>
    </div>
  `).join('');
  // 카드 클릭 시 detailpage로 이동
  setTimeout(() => {
    grid.querySelectorAll('.search_card[data-movie-id]').forEach(card => {
      card.addEventListener('click', function() {
        const movieId = card.getAttribute('data-movie-id');
        if (movieId) {
          window.location.href = `/detailpage.html?movie_id=${movieId}`;
        }
      });
    });
  }, 0);
}

async function main() {
  const person_id = getPersonIdFromUrl();
  if (!person_id) return;
  // 백엔드 프록시 API 사용
  const { person, credits } = await fetchPersonInfo(person_id);
  renderPersonProfile(person);
  // 배우/감독 분리
  const actorMovies = (credits.cast || []).filter(m => m.poster_path);
  const directorMovies = (credits.crew || []).filter(m => m.job === 'Director' && m.poster_path);
  renderMoviesGrid(actorMovies, 'actor_movies_grid');
  renderMoviesGrid(directorMovies, 'director_movies_grid');
}

document.addEventListener('DOMContentLoaded', main); 