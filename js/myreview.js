// 리뷰 카드 렌더링 스크립트

// 1. 리뷰 데이터 (임시 샘플 데이터)
const reviews = [
  {
    title: "웡카",
    content: "환상적인 영상미와 음악! 초콜릿이 당기게 만드는 마법 같은 영화!",
    rating: 5,
    likeCount: 12,
  },
  {
    title: "듄: 파트2",
    content: "정치, 액션, 드라마가 모두 어우러진 SF 대서사시.",
    rating: 4,
    likeCount: 8,
  },
];

// 2. 리뷰 카드 출력 함수
function renderReviewCards() {
  const reviewList = document.getElementById("review_list");
  reviewList.innerHTML = ""; // 기존 카드 초기화 (플레이스홀더 제거)

  reviews.forEach((review, index) => {
    const card = document.createElement("div");
    card.className = "review_card";
    card.setAttribute("data-index", index); // 수정/삭제용 식별자 부여

    card.innerHTML = `
      <div class="review_card_top">
        <span class="review_title">${review.title}</span>
        <span class="review_rating">${"⭐".repeat(review.rating)}</span>
      </div>
      <div class="review_content">${review.content}</div>
      <div class="review_bottom">
        <div class="review_like">❤️ ${review.likeCount}</div>
        <div class="review_buttons">
          <button class="btn_edit">수정</button>
          <button class="btn_delete">삭제</button>
        </div>
      </div>
    `;

    reviewList.appendChild(card);
  });
}

// 3. 수정/삭제 버튼 이벤트 위임 처리
document.getElementById("review_list").addEventListener("click", (e) => {
  const card = e.target.closest(".review_card");
  const index = card?.dataset.index;

  if (e.target.classList.contains("btn_edit")) {
    alert(`👉 ${reviews[index].title} 리뷰 수정 기능은 아직 준비 중이에요.`);
  }

  if (e.target.classList.contains("btn_delete")) {
    if (confirm("정말 이 리뷰를 삭제하시겠어요?")) {
      reviews.splice(index, 1); // 데이터에서 삭제
      renderReviewCards(); // 다시 렌더링
    }
  }
});

// 초기 렌더링
renderReviewCards();

// 약관 / 개인정보 팝업 처리

// 요소 가져오기
const termsOverlay = document.getElementById("terms_overlay");
const termsTitle = document.getElementById("terms_title");

// 이용약관 열기
document.getElementById("open_terms").onclick = () => {
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "이용약관";
};

// 개인정보처리방침 열기
document.getElementById("open_privacy").onclick = () => {
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "개인정보처리방침";
};

// 팝업 닫기 버튼
document.getElementById("terms_close").onclick = () => {
  termsOverlay.style.display = "none";
};
