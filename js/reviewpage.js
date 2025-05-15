document.addEventListener("DOMContentLoaded", () => {
  const review_cards = document.getElementById("review_cards");
  const sort_option = document.getElementById("sort_option");
  const search_btn = document.querySelector(".search_btn");
  const search_input = document.getElementById("search_input");
  const search_category = document.getElementById("search_category");

  // 초기 로딩 - 최신순 리뷰
  load_reviews("newest");

  // 정렬 옵션 변경
  sort_option.addEventListener("change", (e) => {
    const sort_value = e.target.value;
    load_reviews(sort_value);
  });

  // 검색 버튼 클릭
  search_btn.addEventListener("click", () => {
    const keyword = search_input.value.trim();
    const category = search_category.value;
    if (!keyword) {
      alert("검색어를 입력해주세요.");
      return;
    }
    search_reviews(keyword, category);
  });
});

// 정렬 기반 리뷰 불러오기
async function load_reviews(sort_type) {
  let endpoint = "";

  switch (sort_type) {
    case "newest":
      endpoint = "/api/reviews/latest";
      break;
    case "like_count":
      endpoint = "/api/reviews/recommend";
      break;
    case "rating_high":
      endpoint = "/api/reviews/rate/updown?order=desc";
      break;
    case "rating_low":
      endpoint = "/api/reviews/rate/updown?order=asc";
      break;
    default:
      alert("정렬 기준이 잘못되었습니다.");
      return;
  }

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    render_reviews(data);
  } catch (err) {
    console.error("리뷰 불러오기 실패:", err);
    alert("리뷰를 불러오는 데 실패했습니다.");
  }
}

// 검색 기능
async function search_reviews(keyword, category) {
  try {
    let res, data;

    if (category === "user") {
      res = await fetch(`/api/reviews/search/${encodeURIComponent(keyword)}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);
      render_reviews(data);
    } else if (category === "movie" || category === "person") {
      const type_param = category === "movie" ? "title" : "person";
      res = await fetch(`/api/movies/search?query=${encodeURIComponent(keyword)}&type=${type_param}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 영화 검색 결과를 리뷰처럼 변환해 출력
      const fake_reviews = data.map((movie) => ({
        nickname: "영화 정보",
        title: movie.title,
        rating: movie.rating || 0,
        content: movie.overview || "줄거리 정보 없음",
        like_cnt: movie.like_cnt || 0,
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

// 리뷰 카드 렌더링
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
      <p class="review_author">작성자: ${review.nickname}</p>
      <p class="review_title">영화: ${review.title}</p>
      <p class="review_rating">⭐ ${"⭐".repeat(Math.round(review.rating))}</p>
      <p class="review_content">${review.content}</p>
      <p class="like_count">❤ ${review.like_cnt || 0}</p>
    `;
    review_cards.appendChild(card);
  });
}

// 약관/개인정보 팝업
document.getElementById("open_terms").onclick = () => {
  document.getElementById("terms_overlay").style.display = "flex";
  document.getElementById("terms_title").textContent = "이용약관";
};

document.getElementById("open_privacy").onclick = () => {
  document.getElementById("terms_overlay").style.display = "flex";
  document.getElementById("terms_title").textContent = "개인정보처리방침";
};

document.getElementById("terms_close").onclick = () => {
  document.getElementById("terms_overlay").style.display = "none";
};



// 테스트용 샘플 데이터 (API 없어도 화면 테스트 가능)
const reviews = [
  {
    nickname: "도비123",
    title: "웡카",
    rating: 4,
    content: "초콜릿 마법 같은 영상미와 음악!",
    like_cnt: 12,
  },
  {
    nickname: "movieFan77",
    title: "듄: 파트2",
    rating: 3,
    content: "스토리는 진중했지만 전개가 느림",
    like_cnt: 7,
  },
];


render_reviews(reviews); //테스트용 데이터