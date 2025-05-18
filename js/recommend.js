// 추천영화 데이터만 받아서 home.js의 setupCarousel로 넘김
async function fetchRecommendedMovies() {
  const token = localStorage.getItem('token');
  const res = await fetch('/movie/recommend', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    alert(data.message || "추천영화 불러오기 실패(로그인 필요)");
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

