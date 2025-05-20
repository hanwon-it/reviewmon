//마이 리뷰 페이지 활성화
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

  review_list.onclick = async function(e) {
    const card = e.target.closest(".review_card");
    if (!card) return;
    const review_id = card.getAttribute("data-id");
    if (!review_id) return;

    // 삭제 처리
    if (e.target.classList.contains("btn_delete")) {
      window.showCustomConfirm("리뷰를 삭제하시겠습니까?", async () => {
        await delete_review(review_id);
        const token = localStorage.getItem("token");
        load_my_reviews(document.getElementById("sort_option").value, token);
      });
      return;
    }

    // 수정 처리
    if (e.target.classList.contains("btn_edit")) {
      const content_elem = card.querySelector(".review_content");
      const original_text = content_elem.textContent;
      // 별점 추출
      const ratingElem = card.querySelector(".review_rating_num");
      let original_rating = 0;
      if (ratingElem) {
        const match = ratingElem.textContent.match(/([\d.]+)/);
        if (match) original_rating = parseFloat(match[1]);
      }
      // 별점 입력 UI + textarea
      content_elem.innerHTML = `
        <div class="edit_rating_row">
          ${getEditableStarSVG(original_rating)}
          <span class="edit_rating_value">${original_rating}</span> / 5.0
        </div>
        <textarea class="edit_textarea">${original_text}</textarea>
      `;
      const buttons = card.querySelector(".review_buttons");
      buttons.innerHTML = `
        <button class="btn_save">저장</button>
        <button class="btn_cancel">취소</button>
      `;
      // 별점 이벤트 바인딩
      const edit_rating_row = card.querySelector(".edit_rating_row");
      let currentRating = original_rating;
      edit_rating_row.addEventListener("mousemove", (ev) => {
        if (ev.target.classList.contains("star")) {
          const value = parseFloat(ev.target.getAttribute("data-value"));
          updateEditableStars(edit_rating_row, value);
          edit_rating_row.querySelector(".edit_rating_value").textContent = value;
        }
      });
      edit_rating_row.addEventListener("mouseleave", () => {
        updateEditableStars(edit_rating_row, currentRating);
        edit_rating_row.querySelector(".edit_rating_value").textContent = currentRating;
      });
      edit_rating_row.addEventListener("click", (ev) => {
        if (ev.target.classList.contains("star")) {
          currentRating = parseFloat(ev.target.getAttribute("data-value"));
          updateEditableStars(edit_rating_row, currentRating);
          edit_rating_row.querySelector(".edit_rating_value").textContent = currentRating;
        }
      });
    }

    // 저장 처리
    if (e.target.classList.contains("btn_save")) {
      const new_content = card.querySelector(".edit_textarea").value.trim();
      const new_rating = parseFloat(card.querySelector(".edit_rating_value").textContent) || 0;
      if (!new_content) {
        alert("내용을 입력해주세요.");
        return;
      }
      await patch_review(review_id, new_content, new_rating);
      const token = localStorage.getItem("token");
      load_my_reviews(document.getElementById("sort_option").value, token);
    }

    // 취소 처리
    if (e.target.classList.contains("btn_cancel")) {
      const token = localStorage.getItem("token");
      load_my_reviews(document.getElementById("sort_option").value, token);
    }
  };
});

async function load_my_reviews(sort_type, token) {
  let endpoint = "/reviews/me";
  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // 정렬 적용
    let sorted = [...data];
    switch (sort_type) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    render_my_reviews(sorted);
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
    card.setAttribute("data-id", review._id || review.idx);
    // 날짜 포맷팅
    let dateStr = '';
    if (review.createdAt) {
      const d = new Date(review.createdAt);
      dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
    }
    // 별점 SVG 및 평점 숫자
    const ratingNum = typeof review.rating === "number" && !isNaN(review.rating) ? review.rating.toFixed(1) : "-";
    const starsSVG = typeof review.rating === "number" && !isNaN(review.rating) ? getStarSVG(review.rating) : "-";
    card.innerHTML = `
      <div class="review_card_top">
        ${(review.movie_title && review.movie_title !== 'undefined') ? `<span class="review_movie_title">[${review.movie_title}]</span>` : ''}
        <span class="review_date_top">${dateStr ? `${dateStr}` : ''}</span>
      </div>
      <div class="review_rating_row" style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
        <span class="review_stars">${starsSVG}</span>
        <span class="review_rating_num">(${ratingNum} / 5.0)</span>
      </div>
      <div class="review_content" data-type="text">${review.content}</div>
      <div class="review_bottom_row">
        <span class="like_count">❤️ ${review.like_cnt || 0}</span>
        <div class="review_buttons">
          <button class="btn_edit">수정</button>
          <button class="btn_delete">삭제</button>
        </div>
      </div>
    `;
    review_list.appendChild(card);
  });
}

async function patch_review(idx, new_content, new_rating) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/reviews/${idx}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: new_content, rating: new_rating }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // 커스텀 알림 모달로 대체
    window.showCustomAlert("리뷰가 수정되었습니다.");
  } catch (err) {
    console.error(err);
    window.showCustomAlert("리뷰 수정 실패");
  }
}

async function delete_review(idx) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`/reviews/${idx}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // 커스텀 알림 모달로 대체
    window.showCustomAlert("리뷰가 삭제되었습니다.");
  } catch (err) {
    console.error(err);
    window.showCustomAlert("리뷰 삭제 실패");
  }
}

// 초기 렌더링
// renderReviewCards();

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

function getStarSVG(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += `<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"#FFD700\" stroke=\"#FFD700\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;\"><polygon points=\"12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9\"/></svg>`;
    } else if (rating >= i - 0.5) {
      stars += `<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"vertical-align:middle;\"><defs><linearGradient id=\"half\"><stop offset=\"50%\" stop-color=\"#FFD700\"/><stop offset=\"50%\" stop-color=\"transparent\"/></linearGradient></defs><polygon points=\"12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9\" fill=\"url(#half)\" stroke=\"#FFD700\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>`;
    } else {
      stars += `<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#FFD700\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align:middle;\"><polygon points=\"12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9\"/></svg>`;
    }
  }
  return stars;
}

function getEditableStarSVG(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += `<span class="star editable" data-value="${i}">&#9733;</span>`;
    } else if (rating >= i - 0.5) {
      stars += `<span class="star editable half" data-value="${i - 0.5}">&#9733;</span>`;
    } else {
      stars += `<span class="star editable" data-value="${i}">&#9734;</span>`;
    }
  }
  return stars;
}

function updateEditableStars(rowElem, rating) {
  const stars = rowElem.querySelectorAll(".star");
  stars.forEach(star => {
    const value = parseFloat(star.getAttribute("data-value"));
    if (rating >= value) {
      star.innerHTML = "&#9733;";
    } else {
      star.innerHTML = "&#9734;";
    }
  });
}

// 커스텀 confirm 모달 함수 추가
window.showCustomConfirm = function(message, onConfirm) {
  const old = document.getElementById('custom_alert_modal');
  if (old) old.remove();
  const modal = document.createElement('div');
  modal.id = 'custom_alert_modal';
  modal.innerHTML = `
    <div class="custom_alert_overlay"></div>
    <div class="custom_alert_box">
      <div class="custom_alert_message">${message}</div>
      <div style="display:flex;gap:1.2em;justify-content:center;">
        <button class="custom_alert_btn confirm">확인</button>
        <button class="custom_alert_btn cancel">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.confirm').onclick = function() {
    modal.remove();
    if (onConfirm) onConfirm();
  };
  modal.querySelector('.cancel').onclick = function() {
    modal.remove();
  };
};
