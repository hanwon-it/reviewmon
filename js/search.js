// 모달 닫기 버튼 연결
const modalCloseBtn = document.getElementById("modal_close");
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => {
    document.getElementById("user_review_modal").classList.add("hidden");
  });
}

// 유저 리뷰 모달 열기 함수 (유저 카드 클릭 시)
async function openUserReviewModal(user_idx, nickname) {
  const modal = document.getElementById("user_review_modal");
  const modal_title = document.getElementById("modal_title");
  const modal_reviews = document.getElementById("modal_reviews");

  modal_title.textContent = `"${nickname}" 님의 리뷰`;

  try {
    const res = await fetch(`/reviews/user_reviews?user_idx=${user_idx}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    if (data.length === 0) {
      modal_reviews.innerHTML = "<p>작성한 리뷰가 없습니다.</p>";
    } else {
      modal_reviews.innerHTML = data
        .map(
          (r) => `
        <div class="review_item">
          <strong>${r.movie_title}</strong>
          <p>${r.content}</p>
        </div>
      `
        )
        .join("");
    }
    modal.classList.remove("hidden");
  } catch (err) {
    console.error("리뷰 불러오기 실패:", err);
    modal_reviews.innerHTML = "<p>리뷰를 불러오지 못했습니다.</p>";
    modal.classList.remove("hidden");
  }
}

// 검색 결과 렌더링 함수 (카테고리별)
function renderSearchResults(data, category) {
  const searchGrid = document.getElementById("search_grid");
  let html = "";
  if (!data || (Array.isArray(data) && data.length === 0)) {
    searchGrid.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }
  if (category === "movie") {
    // 카테고리명 표시
    let categoryTitle = `<h2 class='search_category_title'>[영화]로 검색한 결과</h2>`;
    html = Array.isArray(data) ? data.map(movie => `
      <div class="search_card" style="cursor:pointer;" data-movie-id="${movie.movie_id}">
        <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Finstagram%2Ftrumanblack%2Fprofile_pic.jpg&type=a340'}" alt="포스터" class="search_poster" onerror="this.src='https://search.pstatic.net/sunny/?src=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Finstagram%2Ftrumanblack%2Fprofile_pic.jpg&type=a340';" />
        <div class="search_info">
          <h3>${movie.title}</h3>
          <div class="search_rating">
            ${typeof movie.rating === "number" ? `⭐ ${movie.rating.toFixed(1)} / 5.0` : ""}
          </div>
        </div>
      </div>
    `).join("") : "<p>검색 결과가 없습니다.</p>";
    searchGrid.innerHTML = categoryTitle + `<div class="search_grid">${html}</div>`;
    // 카드 클릭 시 detailpage로 이동
    setTimeout(() => {
      document.querySelectorAll('.search_card[data-movie-id]').forEach(card => {
        card.addEventListener('click', function() {
          const movieId = card.getAttribute('data-movie-id');
          if (movieId) {
            window.location.href = `/detailpage.html?movie_id=${movieId}`;
          }
        });
      });
    }, 0);
    return;
  } else if (category === "person") {
    // TMDB 연동: data가 객체(castMovies, directorMovies, people)인지 확인
    let people = [];
    let castMovies = [], directorMovies = [];
    if (data && typeof data === 'object' && (data.castMovies || data.directorMovies || data.people)) {
      castMovies = Array.isArray(data.castMovies) ? data.castMovies : [];
      directorMovies = Array.isArray(data.directorMovies) ? data.directorMovies : [];
      people = Array.isArray(data.people) ? data.people : [];
    } else if (Array.isArray(data)) {
      // 기존 DB 구조 호환(배우/감독 구분)
      data.forEach(movie => {
        if (movie.cast && movie.cast.length > 0) castMovies.push(movie);
        if (movie.director && movie.director.length > 0) directorMovies.push(movie);
      });
    }
    // 1. 인물 프로필 카드 먼저 렌더링
    let html = '';
    if (people.length > 0) {
      html += `<div class=\"profile_grid\">`;
      html += people.map(person => `
        <div class=\"profile_card\" style=\"cursor:pointer;\" data-person-id=\"${person.id}\"> 
          <h2 class=\"profile_title\">검색된 인물</h2>
          <img src=\"${person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Finstagram%2Ftrumanblack%2Fprofile_pic.jpg&type=a340'}\" alt=\"프로필 이미지\" class=\"person_profile_img\" />
          <span class=\"profile_name\">${person.name}</span>
          <span class=\"profile_job\">${person.known_for_department || ''}</span>
        </div>
      `).join("");
      html += `</div>`;
    } else {
      html += `<p>일치하는 인물이 없습니다.</p>`;
    }
    // 2. 프로필 카드 클릭 시 personpage.html로 이동
    setTimeout(() => {
      document.querySelectorAll('.profile_card').forEach(card => {
        card.addEventListener('click', function() {
          const personId = card.getAttribute('data-person-id');
          if (personId) {
            window.location.href = `/personpage.html?person_id=${personId}`;
          }
        });
      });
    }, 0);
    searchGrid.innerHTML = html;
    return;
  } else if (category === "user") {
    html = Array.isArray(data) ? data.map(user => `
      <div class="search_card user_card" style="cursor:pointer;">
        <img src="${user.profile_image_url || 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Finstagram%2Ftrumanblack%2Fprofile_pic.jpg&type=a340'}" alt="프로필 이미지" class="user_profile_img" />
        <div class="search_info">
          <h3 class="user_nickname_link" data-user-idx="${user.user_idx}">${user.nickname}</h3>
        </div>
      </div>
    `).join("") : "<p>검색 결과가 없습니다.</p>";
    // 유저 카드 클릭 시 해당 유저의 리뷰 페이지로 이동
    setTimeout(() => {
      document.querySelectorAll(".user_card").forEach(card => {
        card.addEventListener("click", function(e) {
          const nickname = card.querySelector(".user_nickname_link").textContent;
          if (nickname) {
            window.location.href = `/reviewpage.html?nickname=${encodeURIComponent(nickname)}`;
          }
        });
      });
    }, 0);
    // 유저 카드 그리드 구조를 영화 검색과 동일하게 적용
    searchGrid.innerHTML = `<div class='search_grid user_search_grid'>${html}</div>`;
    return;
  }
  searchGrid.innerHTML = html;
  console.log("검색 결과:", data);
}

// 검색 실행 함수 (카테고리/검색어)
function doSearch(category, keyword) {
  const searchGrid = document.getElementById("search_grid");
  let apiUrl = "";
  switch (category) {
    case "movie":
      apiUrl = `/movie/search?query=${encodeURIComponent(keyword)}&type=title`;
      break;
    case "person":
      apiUrl = `/movie/search?query=${encodeURIComponent(keyword)}&type=person`;
      break;
    case "user":
      apiUrl = `/auth/search/${encodeURIComponent(keyword)}`;
      break;
  }
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => renderSearchResults(data, category))
    .catch(err => {
      searchGrid.innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
      console.error("검색 오류:", err);
    });
}

// DOMContentLoaded 시 URL 파라미터로 검색 실행
// 그리고 검색창에서 검색 시에도 실행

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const keyword = params.get("keyword");
  const searchBtn = document.getElementById("search_btn");
  const searchInput = document.getElementById("search_input");
  const searchCategory = document.getElementById("search_category");

  function normalizeQuery(query) {
    return query.replace(/\s/g, ""); // 모든 공백 제거
  }

  // URL 파라미터로 진입 시 자동 검색
  if (category && keyword) {
    doSearch(category, normalizeQuery(keyword));
    if (searchCategory) searchCategory.value = category;
    if (searchInput) searchInput.value = keyword;
  }

  // 검색 실행을 위한 공통 함수 (버튼/엔터 모두 사용)
  function handleSearch() {
    let query = searchInput.value.trim();
    if (!query) {
      alert("검색어를 입력하세요.");
      return;
    }
    if (query.length < 2) {
      // 알림창이 바로 사라지지 않도록 setTimeout으로 포커스 이동
      window.showCustomAlert("검색어는 최소 2글자 이상 입력해야 합니다.", function() {
        setTimeout(() => searchInput.focus(), 10);
      });
      return;
    }
    query = normalizeQuery(query);
    doSearch(searchCategory.value, query);
  }

  // 검색 버튼 클릭 시
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
  }
  // 검색 input에서 Enter 시
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    });
  }
});
