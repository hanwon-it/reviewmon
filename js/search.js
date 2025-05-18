// TMDB API 키 (인코딩 처리까지 포함)
const TMDB_API_KEY = encodeURIComponent("1dc4fbac48abb39eeb4fbd6c9d845bd3");

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

document.querySelector(".search_btn").addEventListener("click", (e) => {
  e.preventDefault();

  const category = document.getElementById("search_category").value;
  const keyword = document.getElementById("search_input").value.trim();

  if (!keyword) {
    alert("검색어를 입력해주세요.");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("category", category);
  url.searchParams.set("keyword", keyword);
  history.pushState({}, "", url);

  const category_label = document.getElementById("selected_category_label");
  const keyword_label = document.getElementById("searched_keyword");

  const category_text_map = {
    movie: "영화정보",
    person: "감독/배우",
    user: "유저",
  };

  category_label.textContent = `[${category_text_map[category] || "기타"}]`;
  keyword_label.textContent = `"${keyword}"`;

  search_data(keyword, category);
});

function showNoResults(message = "검색 결과가 없습니다.") {
  const grid = document.getElementById("search_grid");
  grid.innerHTML = `<p>${message}</p>`;
}

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

      data.slice(0, 25).forEach((user) => {
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

      data.slice(0, 25).forEach((item) => {
        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Image";

        const card = createCard({
          image: posterUrl,
          title: item.title || item.name || "제목 없음",
          onClick: () => {
            if (category === "person") {
              if (!item.id) {
                alert("해당 인물 정보가 부족합니다.");
                return;
              }
              openPersonModal(item.id, item.name || "이름 없음");
            } else {
              window.location.href = `/detailpage.html?movie_id=${item.movie_id}`;
            }
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

// ✅ 출연작 모달
async function openPersonModal(personId, personName) {
  console.log("열린 인물 ID:", personId); // 디버깅용

  const modal = document.getElementById("person_modal");
  const modalTitle = document.getElementById("person_modal_title");
  const modalBody = document.getElementById("person_modal_body");

  modalTitle.textContent = `${personName}의 출연작`;
  modalBody.innerHTML = `<p>출연작 불러오는 중...</p>`;
  modal.style.display = "flex";

  try {
    const res = await fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=ko-KR`);
    const data = await res.json();

    console.log("열린 인물 ID:", item.id); // ← 여기에 undefined 나오면 100% 문제


    if (!data.cast || data.cast.length === 0) {
      modalBody.innerHTML = `<p>출연작이 없습니다.</p>`;
      return;
    }

    modalBody.innerHTML = "";
    data.cast.slice(0, 25).forEach((movie) => {
      const div = document.createElement("div");
      div.className = "movie_item";

      const img = document.createElement("img");
      img.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/200x300?text=No+Image";
      img.alt = movie.title;

      const title = document.createElement("div");
      title.className = "movie_title";
      title.textContent = movie.title;

      div.appendChild(img);
      div.appendChild(title);
      modalBody.appendChild(div);
    });

  } catch (err) {
    console.error("출연작 조회 실패:", err);
    modalBody.innerHTML = `<p>출연작을 불러오는 데 실패했습니다.</p>`;
  }
}

document.getElementById("person_modal_close").onclick = () => {
  document.getElementById("person_modal").style.display = "none";
};

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
