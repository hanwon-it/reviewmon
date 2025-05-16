document.addEventListener("DOMContentLoaded", () => {
  const search_grid = document.getElementById("search_grid");
  const category_label = document.getElementById("selected_category_label");
  const keyword_label = document.getElementById("searched_keyword");

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const keyword = params.get("keyword");

  if (!category || !keyword) {
    alert("잘못된 접근입니다.");
    return;
  }

  const category_text_map = {
    movie: "영화정보",
    person: "감독/배우",
    user: "유저",
  };

  category_label.textContent = `[${category_text_map[category] || "기타"}]`;
  keyword_label.textContent = `"${keyword}"`;

  search_data(keyword, category);
});

// ✅ 돋보기(검색) 버튼 클릭 시 재검색
document.querySelector(".search_btn").addEventListener("click", (e) => {
  e.preventDefault();

  const category = document.getElementById("search_category").value;
  const keyword = document.getElementById("search_input").value.trim();

  if (!keyword) {
    alert("검색어를 입력해주세요.");
    return;
  }

  // ✅ URL 변경 (뒤로 가기 등 브라우저 이력 반영)
  const url = new URL(window.location.href);
  url.searchParams.set("category", category);
  url.searchParams.set("keyword", keyword);
  history.pushState({}, "", url);

  // ✅ 카테고리와 키워드 라벨 업데이트
  const category_label = document.getElementById("selected_category_label");
  const keyword_label = document.getElementById("searched_keyword");

  const category_text_map = {
    movie: "영화정보",
    person: "감독/배우",
    user: "유저",
  };

  category_label.textContent = `[${category_text_map[category] || "기타"}]`;
  keyword_label.textContent = `"${keyword}"`;

  // ✅ 실제 검색 실행
  search_data(keyword, category);
});

// ✅ 공통: 결과 없음 출력 함수
function showNoResults(message = "검색 결과가 없습니다.") {
  const grid = document.getElementById("search_grid");
  grid.innerHTML = `<p>${message}</p>`;
}

// ✅ 공통: 카드 생성 함수
function createCard({ image, title, onClick }) {
  const card = document.createElement("div");
  card.className = "movie_item";
  card.innerHTML = `
    <img src="${image}" alt="${title}" class="movie_poster" />
    <div class="movie_title">${title}</div>
  `;
  if (onClick) card.addEventListener("click", onClick);
  return card;
}

// ✅ 검색 데이터 처리
async function search_data(keyword, category) {
  const search_grid = document.getElementById("search_grid");
  search_grid.innerHTML = "";

  try {
    let res, data;

    if (category === "user") {
      res = await fetch(`/auth/search/${encodeURIComponent(keyword)}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (!data || data.length === 0) {
        return showNoResults();
      }

      data.forEach((user) => {
        const card = createCard({
          image: user.profile_image_url || "/img/default_user.png",
          title: user.nickname,
          onClick: () => {
            window.location.href = `/profile.html?user=${user.email}`;
          },
        });
        search_grid.appendChild(card);
      });

    } else if (category === "movie" || category === "person") {
      const type = category === "movie" ? "title" : "person";
      res = await fetch(`/api/movies/search?query=${encodeURIComponent(keyword)}&type=${type}`);
      data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (!data || data.length === 0) {
        return showNoResults();
      }

      data.forEach((item) => {
        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "/img/default_poster.jpg";

        const card = createCard({
          image: posterUrl,
          title: item.title || "제목 없음",
          onClick: () => {
            window.location.href = `/detailpage.html?movie_id=${item.movie_id}`;
          },
        });

        search_grid.appendChild(card);
      });

    } else {
      return showNoResults("지원하지 않는 검색 유형입니다.");
    }
  } catch (err) {
    console.error("검색 오류:", err);
    showNoResults("검색 중 오류가 발생했습니다.");
  }
}

// ✅ 약관/개인정보처리방침 팝업
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
