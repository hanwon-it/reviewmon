// ===================== 메인 배너 슬라이드 =====================
// 메인 상단의 배너 이미지를 자동/수동으로 넘기는 기능
const bannerTrack = document.querySelector(".banner-track");
const banners = document.querySelectorAll(".banner-link");
const indicators = document.querySelectorAll(".banner-indicators .indicator");
const leftBtn = document.querySelector(".banner-arrow.left");
const rightBtn = document.querySelector(".banner-arrow.right");
let idx = 0;
let timer = null;

// 배너를 해당 인덱스로 이동
function showBanner(i) {
  idx = i;
  bannerTrack.style.transform = `translateX(-${i * 100}%)`;
  indicators.forEach((ind, j) => ind.classList.toggle("active", i === j));
}
// 다음 배너로 이동
function nextBanner() {
  showBanner((idx + 1) % banners.length);
}
// 이전 배너로 이동
function prevBanner() {
  showBanner((idx - 1 + banners.length) % banners.length);
}
// 자동 슬라이드 시작
function autoSlide() {
  timer = setInterval(nextBanner, 5000);
}
// 수동 조작 시 자동 슬라이드 재시작
function resetAutoSlide() {
  clearInterval(timer);
  autoSlide();
}
// 배너 화살표 버튼 이벤트
rightBtn.onclick = () => {
  nextBanner();
  resetAutoSlide();
};
leftBtn.onclick = () => {
  prevBanner();
  resetAutoSlide();
};
// 인디케이터(점) 클릭 이벤트
indicators.forEach((ind, i) => {
  ind.onclick = () => {
    showBanner(i);
    resetAutoSlide();
  };
});
// 페이지 진입 시 첫 배너 표시 및 자동 슬라이드 시작
showBanner(0);
autoSlide();
// ===================== 배너 슬라이드 끝 =====================

// ===================== 추천 영화 캐러셀 =====================
// 로그인한 사용자에게 맞는 추천 영화 목록을 받아와 캐러셀로 보여줌
async function fetchRecommendedMovies() {
  const token = localStorage.getItem('token');
  // console.log("불러올 토큰:", token);
  if (!token) {
    window.showCustomAlert("로그인이 필요합니다.", function() {
      window.location.href = "/index.html";
    });
    return [];
  }
  const res = await fetch('/movie/recommend', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("추천 영화 데이터:", data)
  if (!Array.isArray(data)) {
    window.showCustomAlert(data.message || "추천영화 불러오기 실패(로그인 필요)", function() {
      window.location.href = "/index.html";
    });
    return [];
  }
  return data;
}
// DOMContentLoaded: 추천 캐러셀 영역이 있으면 추천 영화 fetch 및 캐러셀 세팅
window.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('carouselTrack')) {
    const movies = await fetchRecommendedMovies();
    if (typeof setupCarousel === 'function') {
      setupCarousel("carouselTrack", "prevBtn", "nextBtn", movies);
    }
  }
});
// ===================== 추천 영화 캐러셀 끝 =====================

// ===================== 인기 영화 캐러셀 =====================
// 인기 영화 목록을 받아와 캐러셀로 보여줌
fetch("/movie/popular")
  .then((res) => res.json())
  .then((data) => {
    console.log("인기영화 응답", data);
    setupCarousel("carouselTrack2", "prevBtn2", "nextBtn2", data);
  })
  .catch((err) => {
    console.error("인기 영화 불러오기 실패", err);
  });
// ===================== 인기 영화 캐러셀 끝 =====================

// ===================== 공통 캐러셀 함수 =====================
// 여러 영화 리스트를 좌우로 넘길 수 있는 캐러셀 UI로 만들어주는 함수
function setupCarousel(trackId, prevBtnId, nextBtnId, movies) {
  const track = document.getElementById(trackId);
  let index = 0;

  // 영화 카드 생성 및 track에 추가
  movies.forEach((movie) => {
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/200x300?text=No+Image";
    img.alt = movie.title || "제목 없음";

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("movie-info");

    const titleDiv = document.createElement("div");
    titleDiv.classList.add("movie-title");
    titleDiv.textContent = movie.title || "제목 없음";

    const ratingDiv = document.createElement("div");
    ratingDiv.classList.add("movie-rating");
    ratingDiv.textContent = movie.popularity
      ? `⭐ ${movie.popularity.toFixed(1)}`
      : "평점 없음";

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(ratingDiv);
    li.appendChild(img);
    li.appendChild(infoDiv);

    // 영화 카드 클릭 시 detailpage로 이동
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      window.location.href = `/detailpage.html?movie_id=${movie.movie_id}`;
    });

    track.appendChild(li);
  });

  // 캐러셀 좌우 이동 처리
  const itemWidth = track.firstElementChild?.offsetWidth || 200;
  const visibleCount = 6;
  const maxIndex = movies.length - visibleCount;

  document.getElementById(nextBtnId).addEventListener("click", () => {
    if (index < maxIndex) {
      index++;
      track.style.transition = "transform 0.5s ease";
      track.style.transform = `translateX(-${itemWidth * index}px)`;
    }
  });

  document.getElementById(prevBtnId).addEventListener("click", () => {
    if (index > 0) {
      index--;
      track.style.transition = "transform 0.5s ease";
      track.style.transform = `translateX(-${itemWidth * index}px)`;
    }
  });
}
// ===================== 공통 캐러셀 함수 끝 =====================

// ===================== 페이지 진입 시 토큰 체크 =====================
// 로그인하지 않은 사용자는 접근 불가, 알림 후 로그인 페이지로 이동
if (!localStorage.getItem('token')) {
  window.showCustomAlert('로그인이 필요합니다.', function() {
    window.location.href = '/index.html';
  });
}
// ===================== 토큰 체크 끝 =====================
