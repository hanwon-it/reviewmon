// 샘플 리뷰 데이터
const reviews = [
  {
    author: "도비123",
    rating: 4,
    content: "연기도 좋고, 스토리도 감동적이었어요!",
    likes: 12,
  },
  {
    author: "movieFan77",
    rating: 3,
    content: "생각보다 평범했지만 음악은 좋았음",
    likes: 5,
  },
];

const container = document.getElementById("review_cards");
container.innerHTML = "";

// 카드 출력
reviews.forEach((review) => {
  const card = document.createElement("div");
  card.className = "review_item";
  card.innerHTML = `
    <p class="review_author">${review.author}</p>
    <p class="review_rating">${"⭐".repeat(review.rating)}</p>
    <p class="review_content">${review.content}</p>
    <p class="like_count">❤️ ${review.likes}</p>
  `;
  container.appendChild(card);
});

// 약관 팝업
const termsOverlay = document.getElementById("terms_overlay");
const termsTitle = document.getElementById("terms_title");

document.getElementById("open_terms").onclick = () => {
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "이용약관";
};
document.getElementById("open_privacy").onclick = () => {
  termsOverlay.style.display = "flex";
  termsTitle.textContent = "개인정보처리방침";
};
document.getElementById("terms_close").onclick = () => {
  termsOverlay.style.display = "none";
};
