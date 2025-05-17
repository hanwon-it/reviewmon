// js/reviewpage.js

// — 만약 헤더의 마이페이지 버튼 구현이 되어 있지 않다면 아래 코드 주석 해제
// const go_mypage = document.querySelector(".btn_mypage");
// go_mypage?.addEventListener("click", () => {
//   window.location.href = "/mypage.html";
// });

document.addEventListener("DOMContentLoaded", () => {
  const review_cards = document.getElementById("review_cards");
  const sort_option = document.getElementById("sort_option");
  const search_btn = document.querySelector(".search_btn");
  const search_input = document.getElementById("search_input");
  const search_category = document.getElementById("search_category");

  // 1) URL에서 movie_id 파라미터 추출
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("movie_id");
  if (!movieId) {
    review_cards.innerHTML = "<p>영화 ID가 제공되지 않았습니다.</p>";
    return;
  }

  // 2) 초기 로딩 - 최신순 리뷰
  load_reviews("newest");

  // 3) 정렬 옵션 변경 이벤트
  sort_option.addEventListener("change", (e) => {
    load_reviews(e.target.value);
  });

  // 4) 검색 기능
  search_btn.addEventListener("click", () => {
    const keyword = search_input.value.trim();
    const category = search_category.value;
    if (!keyword) {
      alert("검색어를 입력해주세요.");
      return;
    }
    search_reviews(keyword, category);
  });

  // — 리뷰 불러오기 함수 (movie_id + sort 파라미터)
  async function load_reviews(sort_type) {
    // ← 이 라인이 fetch 호출부입니다!
    const endpoint = `/api/reviews/movies/${movieId}?sort=${sort_type}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      render_reviews(data);
    } catch (err) {
      console.error("리뷰 불러오기 실패:", err);
      review_cards.innerHTML = "<p>리뷰를 불러오는 데 실패했습니다.</p>";
    }
  }

  // — 검색 함수 (user / movie / person)
  async function search_reviews(keyword, category) {
    try {
      if (category === "user") {
        // 사용자명으로 리뷰 검색 (movie_id 필터 포함)
        const res = await fetch(
          `/api/reviews/search?movie_id=${movieId}&category=user&keyword=${encodeURIComponent(
            keyword
          )}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        render_reviews(data);
      } else if (category === "movie" || category === "person") {
        // 영화·인물 검색해서 가짜 리뷰로 변환
        const type_param = category === "movie" ? "title" : "person";
        const res = await fetch(
          `/api/movies/search?query=${encodeURIComponent(
            keyword
          )}&type=${type_param}`
        );
        const movies = await res.json();
        if (!res.ok) throw new Error(movies.message);

        const fake_reviews = movies.map((movie) => ({
          nickname: "영화 정보",
          title: movie.title,
          rating: movie.rating || 0,
          content: movie.overview || "줄거리 정보 없음",
          like_cnt: movie.like_cnt || 0,
          create_at: movie.release_date || "",
        }));
        render_reviews(fake_reviews);
      } else {
        alert("잘못된 검색 카테고리입니다.");
      }
    } catch (err) {
      console.error("검색 실패:", err);
      alert("검색 중 오류가 발생했습니다.");
    }
  }
});

// — 리뷰 카드 렌더링
function render_reviews(reviews) {
  const review_cards = document.getElementById("review_cards");
  review_cards.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    review_cards.innerHTML = "<p>리뷰가 없습니다.</p>";
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review_card";
    card.innerHTML = `
      <div class="review_header">
        <strong class="review_nickname">${review.nickname}</strong>
        <span class="review_rating">⭐ ${review.rating}</span>
      </div>
      <p class="review_content">${review.content}</p>
      <div class="review_footer">
        <span class="like_count">👍 ${review.like_cnt || 0}</span>
        <span class="review_date">${
          review.create_at ? formatDate(review.create_at) : ""
        }</span>
      </div>
    `;
    review_cards.appendChild(card);
  });
}

// — 날짜 포맷팅 (‘YYYY-MM-DD HH:MM’)
function formatDate(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D} ${h}:${m}`;
}

// — 약관 팝업 오픈/닫기 처리
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

// — 테스트용 샘플 데이터 (API 없을 때 화면 확인용)
const reviews = [
  {
    nickname: "도비123",
    title: "웡카",
    rating: 4,
    content: "초콜릿 마법 같은 영상미와 음악!",
    like_cnt: 12,
    create_at: Date.now(),
  },
  {
    nickname: "movieFan77",
    title: "듄: 파트2",
    rating: 3,
    content: "스토리는 진중했지만 전개가 느림",
    like_cnt: 7,
    create_at: Date.now(),
  },
];
render_reviews(reviews);
