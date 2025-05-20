// 추천영화 데이터만 받아서 home.js의 setupCarousel로 넘김
async function fetchRecommendedMovies() {
  const token = localStorage.getItem('token');
  console.log("📦 불러올 토큰:", token);
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
  console.log("📊 추천 영화 데이터:", data)
  if (!Array.isArray(data)) {
    window.showCustomAlert(data.message || "추천영화 불러오기 실패(로그인 필요)", function() {
      window.location.href = "/index.html";
    });
    return [];
  }
  return data;
}

window.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('carouselTrack')) {
    const movies = await fetchRecommendedMovies();
    if (typeof setupCarousel === 'function') {
      setupCarousel("carouselTrack", "prevBtn", "nextBtn", movies);
    }
  }
});

