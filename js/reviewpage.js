//마이페이지 버튼 활성화
const go_mypage = document.querySelector(".btn_mypage");
go_mypage.addEventListener("click", function () {
  window.location.href = "/mypage.html";
});

//리뷰 상세 페이지 활성화
document.addEventListener("DOMContentLoaded", () => {
  const review_cards = document.getElementById("review_cards");
  const sort_option = document.getElementById("sort_option");
  const search_btn = document.querySelector(".search_btn");
  const search_input = document.getElementById("search_input");
  const search_category = document.getElementById("search_category");

  // URL에서 movie_id 또는 nickname 파라미터 추출
  const params = new URLSearchParams(window.location.search);
  const movie_id = params.get("movie_id");
  const nickname = params.get("nickname");

  if (movie_id) {
    // 영화별 리뷰
    fetch(`/reviews/movie/${movie_id}`)
      .then((res) => res.json())
      .then(async (data) => {
        let filtered = Array.isArray(data)
          ? data.filter((r) => String(r.movie_id) === String(movie_id))
          : [];
        if (filtered.length > 0 && filtered[0].movie_title) {
          const h2 = document.querySelector("main.review_list_page h2");
          if (h2)
            h2.textContent = `[${filtered[0].movie_title}]의 리뷰 (${filtered.length})`;
        }
        function sortAndRender(option) {
          let sorted = [...filtered];
          switch (option) {
            case "newest":
              sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              break;
            case "like_count":
              sorted.sort((a, b) => (b.like_cnt || 0) - (a.like_cnt || 0));
              break;
            case "rating_high":
              sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
            case "rating_low":
              sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
              break;
          }
          fetchLikedReviewIds().then(() => render_reviews(sorted));
        }
        sortAndRender("newest");
        const sort_option = document.getElementById("sort_option");
        sort_option.onchange = (e) => {
          sortAndRender(e.target.value);
        };
      })
      .catch((err) => {
        console.error("영화 리뷰 불러오기 실패:", err);
        fetchLikedReviewIds().then(() => render_reviews([]));
      });
    return;
  } else if (nickname) {
    // 유저별 리뷰
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해 주세요.");
      window.location.href = "/login.html";
      return;
    }
    fetch(`/reviews/user/${encodeURIComponent(nickname)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (data) => {
        let filtered = Array.isArray(data)
          ? data.filter((r) => r.nickname === nickname)
          : [];
        if (filtered.length > 0) {
          const h2 = document.querySelector("main.review_list_page h2");
          if (h2) h2.textContent = `[${nickname}]의 리뷰 (${filtered.length})`;
        }
        function sortAndRender(option) {
          let sorted = [...filtered];
          switch (option) {
            case "newest":
              sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              break;
            case "like_count":
              sorted.sort((a, b) => (b.like_cnt || 0) - (a.like_cnt || 0));
              break;
            case "rating_high":
              sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
              break;
            case "rating_low":
              sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
              break;
          }
          fetchLikedReviewIds().then(() => render_reviews(sorted));
        }
        sortAndRender("newest");
        const sort_option = document.getElementById("sort_option");
        sort_option.onchange = (e) => {
          sortAndRender(e.target.value);
        };
      })
      .catch((err) => {
        console.error("유저 리뷰 불러오기 실패:", err);
        fetchLikedReviewIds().then(() => render_reviews([]));
      });
    return;
  }

  // 기본: 최신순 리뷰
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
    await fetchLikedReviewIds();
    render_reviews(data);
  } catch (err) {
    console.error("리뷰 불러오기 실패:", err);
    await fetchLikedReviewIds();
    render_reviews([]);
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
      res = await fetch(
        `/api/movies/search?query=${encodeURIComponent(
          keyword
        )}&type=${type_param}`
      );
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

// 좋아요한 리뷰 id 리스트를 저장할 변수
let likedReviewIds = [];

// 페이지 진입 시 좋아요한 리뷰 id 리스트 불러오기
async function fetchLikedReviewIds() {
  const token = localStorage.getItem("token");
  if (!token) {
    likedReviewIds = [];
    return;
  }
  try {
    const res = await fetch("/reviews/user/me/review-likes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      likedReviewIds = await res.json();
    } else {
      likedReviewIds = [];
    }
  } catch {
    likedReviewIds = [];
  }
}

// render_reviews 함수 내 하트 색상 및 클릭 이벤트 수정
function render_reviews(reviews) {
  const review_cards = document.getElementById("review_cards");
  review_cards.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    review_cards.innerHTML = "<p>리뷰가 없습니다.</p>";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const isUserPage = !!params.get("nickname");
  const token = localStorage.getItem("token");

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review_card";
    // 날짜 포맷팅
    let dateStr = "";
    if (review.createdAt) {
      const d = new Date(review.createdAt);
      dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    // 별점 SVG 및 평점 숫자
    const ratingNum =
      typeof review.rating === "number" && !isNaN(review.rating)
        ? review.rating.toFixed(1)
        : "-";
    const starsSVG =
      typeof review.rating === "number" && !isNaN(review.rating)
        ? getStarSVG(review.rating)
        : "-";
    // 좋아요(하트) 상태: likedReviewIds에 포함되어 있으면 빨간색
    const isLiked = likedReviewIds.includes(String(review._id));
    card.innerHTML = `
      <div class="review_card_main" style="display:flex;flex-direction:column;gap:0.2em;">
        ${
          isUserPage
            ? `<p class=\"review_author\"><a href=\"/detailpage.html?movie_id=${review.movie_id}\" class=\"review_nickname_link\">${review.movie_title}</a></p>`
            : `<p class=\"review_author\"><a href=\"/reviewpage.html?nickname=${encodeURIComponent(
                review.nickname
              )}\" class=\"review_nickname_link\">${review.nickname}</a></p>`
        }
        <div class="review_rating_row">
          <span class="review_stars">${starsSVG}</span>
          <span class="review_rating_num">(${ratingNum} / 5.0)</span>
        </div>
        <p class="review_content">${review.content}</p>
      </div>
      <div class="review_bottom_row" style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:1.1em;">
        <span class="like_count" data-review-id="${
          review._id
        }"><span class="heart_icon" style="cursor:pointer;font-size:1.1em;color:${
      isLiked ? "red" : "#888"
    };">❤</span> <span class="like_num">${review.like_cnt || 0}</span></span>
        <span class="review_date">${dateStr ? `작성일: ${dateStr}` : ""}</span>
      </div>
    `;
    review_cards.appendChild(card);
  });

  // 하트(좋아요) 클릭 이벤트 바인딩
  document.querySelectorAll(".like_count .heart_icon").forEach((icon) => {
    icon.addEventListener("click", async function () {
      const parent = this.closest(".like_count");
      const reviewId = parent.getAttribute("data-review-id");
      if (!token) {
        alert("로그인 후 이용해 주세요.");
        window.location.href = "/login.html";
        return;
      }
      const isLiked = this.style.color === "red";
      try {
        let res;
        if (!isLiked) {
          // 좋아요 추가
          res = await fetch(`/reviews/${reviewId}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // 좋아요 취소
          res = await fetch(`/reviews/${reviewId}/like`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        const data = await res.json();
        if (res.ok) {
          // UI 갱신
          this.style.color = !isLiked ? "red" : "#888";
          parent.querySelector(".like_num").textContent = data.like_cnt;
          // likedReviewIds 동기화
          if (!isLiked) {
            likedReviewIds.push(String(reviewId));
          } else {
            likedReviewIds = likedReviewIds.filter(
              (id) => id !== String(reviewId)
            );
          }
        } else {
          alert(data.message || "처리 실패");
        }
      } catch (err) {
        alert("서버 오류");
      }
    });
  });
}

// 페이지 진입 시 좋아요한 리뷰 id 리스트 먼저 불러오기
(async function () {
  await fetchLikedReviewIds();
})();

function getStarSVG(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
    } else if (rating >= i - 0.5) {
      stars += `<svg width="20" height="20" viewBox="0 0 24 24" style="vertical-align:middle;"><defs><linearGradient id="half"><stop offset="50%" stop-color="#FFD700"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9" fill="url(#half)" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else {
      stars += `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
    }
  }
  return stars;
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
