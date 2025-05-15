// js/home.js
// 1) Banner Slider
const bannerSlider = document.querySelector('.main-banner-slider');
const track = bannerSlider.querySelector('.banner-track');
const slides = Array.from(track.children);
const prevBanner = bannerSlider.querySelector('.banner-arrow.left');
const nextBanner = bannerSlider.querySelector('.banner-arrow.right');
const indicators = bannerSlider.querySelectorAll('.indicator');
let currentBanner = 0;
const bannerIntervalTime = 3000; // 3초
let bannerInterval;

function goToBanner(idx) {
  track.style.transform = `translateX(-${idx * 100}%)`;
  indicators.forEach((ind, i) => ind.classList.toggle('active', i === idx));
  currentBanner = idx;
}
function nextBannerSlide() {
  const next = (currentBanner + 1) % slides.length;
  goToBanner(next);
}
function prevBannerSlide() {
  const prev = (currentBanner - 1 + slides.length) % slides.length;
  goToBanner(prev);
}
function startBanner() {
  bannerInterval = setInterval(nextBannerSlide, bannerIntervalTime);
}
function pauseBanner() {
  clearInterval(bannerInterval);
}
nextBanner.addEventListener('click', () => { nextBannerSlide(); pauseBanner(); startBanner(); });
prevBanner.addEventListener('click', () => { prevBannerSlide(); pauseBanner(); startBanner(); });
indicators.forEach((ind, idx) => ind.addEventListener('click', () => { goToBanner(idx); pauseBanner(); startBanner(); }));
bannerSlider.addEventListener('mouseenter', pauseBanner);
bannerSlider.addEventListener('mouseleave', startBanner);
startBanner();

// 2) Movie Carousels (Recommended & Upcoming)
let recommendedMovies = [];  // 추후 TMDB API fetch 데이터 넣을 예정
let upcomingMovies = [];     // 추후 TMDB API fetch 데이터 넣을 예정
let visibleCount;
function getVisibleCount() {
  return window.innerWidth < 600 ? 1 : 6;
}

async function fetchMovies(endpoint) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.results.map(item => ({
      title: item.title,
      poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
      rating: item.vote_average
    }));
  } catch (e) {
    console.error('영화 데이터 불러오기 실패', e);
    return [];
  }
}

async function initCarousels() {
  // 예시: TMDB API 사용
  // const apiKey = 'YOUR_API_KEY';
  // recommendedMovies = await fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
  // upcomingMovies = await fetchMovies(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`);

  // 임시 데이터 사용 (하드코딩)
  recommendedMovies = [ /* 기존 movies 배열 내용 */ ];
  upcomingMovies = [ /* 개봉 예정작 임시 배열 */ ];

  visibleCount = getVisibleCount();
  setupCarousel('recommended_carousel', recommendedMovies);
  setupCarousel('upcoming_carousel', upcomingMovies);
}

function setupCarousel(containerId, movieList) {
  const wrapper = document.getElementById(containerId);
  wrapper.innerHTML = '';
  movieList.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie_card';
    card.innerHTML = `
      <div class="movie_poster"></div>
      <div class="movie_info">
        <div class="movie_title">${movie.title}</div>
        <div class="movie_rating">⭐ ${movie.rating}</div>
      </div>
    `;
    card.querySelector('.movie_poster').style.backgroundImage = `url('${movie.poster}')`;
    wrapper.appendChild(card);
  });
  // 초기 위치 세팅
  wrapper.style.transform = 'translateX(0)';
  // TODO: prev/next 버튼 이벤트 바인딩 및 슬라이드 로직 추가
}

window.addEventListener('resize', () => {
  visibleCount = getVisibleCount();
  initCarousels();
});

// 3) 약관 팝업
const termsOverlay = document.getElementById("terms_overlay");
const termsTitle = document.getElementById("terms_title");
