//마이페이지 버튼 활성화
const go_mypage = document.querySelector(".btn_mypage");
go_mypage.addEventListener("click", function () {
  window.location.href = "/mypage.html";
});

// 모달 닫기 버튼 연결
document.getElementById("modal_close").addEventListener("click", () => {
  document.getElementById("user_review_modal").classList.add("hidden");
});

// 1. 서치페이지 띄우기
// 1-1. 유저 검색 기능 활성화 함수
// 1-1-1. 키워드로 유저 검색
async function search_user(keyword) {
  const res = await fetch(
    `/reviews/search_nickname?keyword=${encodeURIComponent(keyword)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

// 1-1-2. user_idx 값으로 중복 제거
function deduplicate_users(users) {
  const seen = new Set();
  return users.filter((user) => {
    if (seen.has(user.user_idx)) return false;
    seen.add(user.user_idx);
    return true;
  });
}
// 1-1-3. user_idx 기준 리뷰 모달 세팅 함수
async function openUserReviewModal(user_idx, nickname) {
  const modal = document.getElementById("user_review_modal");
  const modal_title = document.getElementById("modal_title");
  const modal_reviews = document.getElementById("modal_reviews");

  modal_title.textContent = `"${nickname}" 님의 리뷰`;

  try {
    console.log(user_idx);
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

// 1-1-4. 검색 결과 화면에 띄우기
function render_user_cards(users) {
  const search_grid = document.getElementById("search_grid");
  search_grid.innerHTML = "";

  const unique_users = deduplicate_users(users);

  if (unique_users.length === 0) {
    search_grid.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }

  unique_users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user_card";
    card.innerHTML = `
      <img src="${user.profile_image_url || "/img/default_user.png"}" />
      <div class="nickname">${user.nickname}</div>
    `;
    card.addEventListener("click", () => {
      openUserReviewModal(user.user_idx, user.nickname);
    });
    search_grid.appendChild(card);
  });
}

// 1-n. 검색 기능 활성화
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const keyword = params.get("keyword");

  if (!category || !keyword) {
    alert("잘못된 접근입니다.");
    return;
  }

  console.log("선택된 카테고리:", category);
  console.log("입력된 키워드:", keyword);

  if (category === "user") {
    try {
      const user_results = await search_user(keyword);
      render_user_cards(user_results);
    } catch (err) {
      console.error("유저 검색 오류:", err);
      showNoResults("검색 오류가 발생했습니다.");
    }
  }
});

// 약관/개인정보 팝업
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
