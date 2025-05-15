// detailpage.js - 영화 상세 페이지 기능 스크립트

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("review_modal");
  const openBtn = document.getElementById("open_review_modal");
  const closeBtn = document.getElementById("close_modal");
  const overlay = document.querySelector(".modal_overlay");
  const form = document.getElementById("review_form");

  // 모달 열기
  openBtn.addEventListener("click", () => {
    modal.classList.add("show");
  });

  // 모달 닫기
  [closeBtn, overlay].forEach((el) =>
    el.addEventListener("click", () => modal.classList.remove("show"))
  );

  // 폼 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const comment = form.querySelector("textarea").value.trim();

    if (!comment) {
      alert("코멘트를 입력해주세요.");
      return;
    }

    // 예시용 리뷰 카드 생성
    const newCard = document.createElement("div");
    newCard.className = "review_card";
    newCard.innerHTML = `
      <p class="review_author">익명 유저</p>
      <p class="review_rating">⭐⭐⭐⭐✮</p>
      <p class="review_content">${comment}</p>
      <p class="like_count">❤ 0</p>
    `;

    const reviewContainer = document.querySelector(".review_cards");
    reviewContainer.prepend(newCard);
    form.reset();
    modal.classList.remove("show");
  });
});

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
