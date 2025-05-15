document.addEventListener("DOMContentLoaded", () => {
  const review_list = document.getElementById("review_list");
  const sort_option = document.getElementById("sort_option");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("로그인 후 이용해주세요.");
    location.href = "/login.html";
    return;
  }

  load_my_reviews("newest", token);

  sort_option.addEventListener("change", (e) => {
    const sort_value = e.target.value;
    load_my_reviews(sort_value, token);
  });
});

async function load_my_reviews(sort_type, token) {
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
      return;
  }

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const user_nickname = await fetch_nickname(token);
    const my_reviews = data.filter((review) => review.nickname === user_nickname);
    render_my_reviews(my_reviews);
  } catch (err) {
    console.error(err);
    alert("리뷰를 불러오는 데 실패했습니다.");
  }
}

function render_my_reviews(reviews) {
  const review_list = document.getElementById("review_list");
  review_list.innerHTML = "";

  if (reviews.length === 0) {
    review_list.innerHTML = "<p>작성한 리뷰가 없습니다.</p>";
    return;
  }

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review_card";
    card.setAttribute("data-id", review.idx);
    card.innerHTML = `
      <div class="review_card_top">
        <span class="review_title">${review.title}</span>
        <span class="review_rating">⭐ ${review.rating.toFixed(1)}</span>
      </div>
      <div class="review_content" data-type="text">${review.content}</div>
      <div class="review_bottom">
        <div class="review_like">❤️ ${review.like_cnt || 0}</div>
        <div class="review_buttons">
          <button class="btn_edit">수정</button>
          <button class="btn_delete">삭제</button>
        </div>
      </div>
    `;
    review_list.appendChild(card);
  });

  review_list.addEventListener("click", async (e) => {
    const card = e.target.closest(".review_card");
    if (!card) return;

    const review_id = card.dataset.id;

    // 삭제 처리
    if (e.target.classList.contains("btn_delete")) {
      if (confirm("리뷰를 삭제하시겠습니까?")) {
        await delete_review(review_id);
        const token = localStorage.getItem("token");
        load_my_reviews(document.getElementById("sort_option").value, token);
      }
    }

    // 수정 처리
    if (e.target.classList.contains("btn_edit")) {
      const content_elem = card.querySelector(".review_content");
      const original_text = content_elem.textContent;

      // 수정모드 활성화
      content_elem.innerHTML = `<textarea class="edit_textarea">${original_text}</textarea>`;
      const buttons = card.querySelector(".review_buttons");
      buttons.innerHTML = `
        <button class="btn_save">저장</button>
        <button class="btn_cancel">취소</button>
      `;
    }

    // 저장 처리
    if (e.target.classList.contains("btn_save")) {
      const new_content = card.querySelector(".edit_textarea").value.trim();
      if (!new_content) {
        alert("내용을 입력해주세요.");
        return;
      }

      await patch_review(review_id, new_content);
      const token = localStorage.getItem("token");
      load_my_reviews(document.getElementById("sort_option").value, token);
    }

    // 취소 처리
    if (e.target.classList.contains("btn_cancel")) {
      const token = localStorage.getItem("token");
      load_my_reviews(document.getElementById("sort_option").value, token);
    }
  });
}

async function patch_review(idx, new_content) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/reviews/${idx}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: new_content }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert("리뷰가 수정되었습니다.");
  } catch (err) {
    console.error(err);
    alert("리뷰 수정 실패");
  }
}

async function delete_review(idx) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/api/reviews/${idx}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert("리뷰가 삭제되었습니다.");
  } catch (err) {
    console.error(err);
    alert("리뷰 삭제 실패");
  }
<<<<<<< HEAD
}
=======
});

// 초기 렌더링
renderReviewCards();

>>>>>>> solbi

async function fetch_nickname(token) {
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.nickname;
  } catch (err) {
    console.error("닉네임 가져오기 실패:", err);
    return null;
  }
}

<<<<<<< HEAD
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
=======
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

>>>>>>> solbi
