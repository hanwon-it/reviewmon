document.addEventListener("DOMContentLoaded", () => {
  const search_grid = document.getElementById("search_grid");
  const category_label = document.getElementById("selected_category_label");
  const keyword_label = document.getElementById("searched_keyword");

<<<<<<< HEAD
=======

>>>>>>> solbi
  // 1. 쿼리 파라미터에서 category, keyword 추출
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const keyword = params.get("keyword");

  if (!category || !keyword) {
    alert("잘못된 접근입니다.");
    return;
  }

  // 2. 카테고리 라벨 출력
  const category_text_map = {
    movie: "영화정보",
    person: "감독/배우",
    user: "유저",
  };

  category_label.textContent = `[${category_text_map[category] || "기타"}]`;
  keyword_label.textContent = `"${keyword}"`;

  // 3. 검색 실행
  search_data(keyword, category);
});

// 4. API 호출 후 결과 렌더링
async function search_data(keyword, category) {
  const search_grid = document.getElementById("search_grid");
  search_grid.innerHTML = "";

  try {
    let res, data;

    if (category === "user") {
      res = await fetch(`/api/reviews/search/${encodeURIComponent(keyword)}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.length === 0) {
        search_grid.innerHTML = "<p>검색 결과가 없습니다.</p>";
        return;
      }

      // 유저 리뷰 카드 출력
      data.forEach((review) => {
        const card = document.createElement("div");
        card.className = "movie_item";
        card.innerHTML = `
          <div class="movie_title">"${review.title}"</div>
          <p class="review_author">작성자: ${review.nickname}</p>
          <p class="review_content">${review.content}</p>
          <p class="review_rating">⭐ ${"⭐".repeat(Math.round(review.rating))}</p>
        `;
        search_grid.appendChild(card);
      });

    } else if (category === "movie" || category === "person") {
      const type_param = category === "movie" ? "title" : "person";
      res = await fetch(`/api/movies/search?query=${encodeURIComponent(keyword)}&type=${type_param}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.length === 0) {
        search_grid.innerHTML = "<p>검색 결과가 없습니다.</p>";
        return;
      }

      // 영화/배우 결과 출력
      data.forEach((item) => {
        const card = document.createElement("div");
        card.className = "movie_item";
        card.innerHTML = `
          <img src="${item.poster_path || '/img/default_poster.jpg'}" alt="${item.title}" class="movie_poster" />
          <div class="movie_title">${item.title}</div>
        `;
        card.addEventListener("click", () => {
          window.location.href = `/detailpage.html?movie_id=${item.movie_id}`;
        });
        search_grid.appendChild(card);
      });
    } else {
      search_grid.innerHTML = "<p>지원하지 않는 검색 유형입니다.</p>";
    }
  } catch (err) {
    console.error(err);
    search_grid.innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
  }
}

// 약관/개인정보 팝업
<<<<<<< HEAD
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
=======
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

>>>>>>> solbi
