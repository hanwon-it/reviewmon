// 배너 슬라이드
const bannerTrack = document.querySelector(".banner-track");
const banners = document.querySelectorAll(".banner-link");
const indicators = document.querySelectorAll(".banner-indicators .indicator");
const leftBtn = document.querySelector(".banner-arrow.left");
const rightBtn = document.querySelector(".banner-arrow.right");
let idx = 0;
let timer = null;

function showBanner(i) {
  idx = i;
  bannerTrack.style.transform = `translateX(-${i * 100}%)`;
  indicators.forEach((ind, j) => ind.classList.toggle("active", i === j));
}

function nextBanner() {
  showBanner((idx + 1) % banners.length);
}
function prevBanner() {
  showBanner((idx - 1 + banners.length) % banners.length);
}
function autoSlide() {
  timer = setInterval(nextBanner, 5000);
}
function resetAutoSlide() {
  clearInterval(timer);
  autoSlide();
}

// 버튼 이벤트
rightBtn.onclick = () => {
  nextBanner();
  resetAutoSlide();
};
leftBtn.onclick = () => {
  prevBanner();
  resetAutoSlide();
};

// 인디케이터 클릭 이벤트
indicators.forEach((ind, i) => {
  ind.onclick = () => {
    showBanner(i);
    resetAutoSlide();
  };
});

// 자동 슬라이드 시작
showBanner(0);
autoSlide();

// 배너 끝

// 🎬 추천 영화 캐러셀
fetch("/api/recommendations/1")
  .then((res) => res.json())
  .then((data) => {
    setupCarousel("carouselTrack", "prevBtn", "nextBtn", data);
  })
  .catch((err) => {
    console.error("추천 영화 불러오기 실패", err);
  });

// 🔥 인기 영화 캐러셀
fetch("/api/popular")
  .then((res) => res.json())
  .then((data) => {
    setupCarousel("carouselTrack2", "prevBtn2", "nextBtn2", data);
  })
  .catch((err) => {
    console.error("인기 영화 불러오기 실패", err);
  });

// ✅ 공통 캐러셀 함수
function setupCarousel(trackId, prevBtnId, nextBtnId, movies) {
  const track = document.getElementById(trackId);
  let index = 0;

  // 카드 생성
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

    track.appendChild(li);
  });

  // 슬라이드 이동 처리
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

// 약관 팝업 오픈/닫기 처리
const termsOverlay = document.getElementById("terms_overlay");
const termsTitle = document.getElementById("terms_title");

document.getElementById("open_terms").onclick = (e) => {
  e.preventDefault();
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "이용약관";
};
document.getElementById("open_privacy").onclick = (e) => {
  e.preventDefault();
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "개인정보처리방침";
};
document.getElementById("terms_close").onclick = () => {
  termsOverlay.style.display = "none";
};
