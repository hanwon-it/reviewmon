document.addEventListener("DOMContentLoaded", async () => {
  const movie_id = get_movie_id_from_url();
  if (!movie_id) {
    alert("잘못된 접근입니다.");
    return;
  }

  // 영화 상세 정보 로드
  await load_movie_details(movie_id);
  await load_reviews(movie_id);

  // 모달 요소
  const review_modal = document.getElementById("review_modal");
  const open_review_modal = document.getElementById("open_review_modal");
  const close_modal = document.getElementById("close_modal");
  const modal_overlay = document.querySelector(".modal_overlay");
  const review_form = document.getElementById("review_form");

  // 모달 열기/닫기
  open_review_modal.addEventListener("click", () => review_modal.classList.add("show"));
  [close_modal, modal_overlay].forEach((el) =>
    el.addEventListener("click", () => review_modal.classList.remove("show"))
  );

  // 리뷰 등록
  review_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const comment = review_form.querySelector("textarea").value.trim();
    const token = localStorage.getItem("token");

    if (!comment) {
      alert("코멘트를 입력해주세요.");
      return;
    }

    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/movies/${movie_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: comment,
          rating: 4.5, // TODO: 별점 입력 받도록 구현
        }),
      });

      const data = await res.json();
      if (res.status === 201) {
        alert("리뷰가 등록되었습니다.");
        review_form.reset();
        review_modal.classList.remove("show");
        await load_reviews(movie_id);
      } else {
        alert(data.message || "리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류로 리뷰 등록에 실패했습니다.");
    }
  });
});


// 영화 상세 정보 로딩
async function load_movie_details(movie_id) {
  try {
    const res = await fetch(`/api/movies/${movie_id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.querySelector(".info h1").textContent = data.title;
    document.querySelector(".overview").textContent = data.overview;
    document.querySelector(".poster img").src = data.poster_path;
    document.querySelector(".rating").textContent = `리뷰몬 평점: ⭐⭐⭐⭐✮ ${data.rating}/5.0`;

    const cast_grid = document.querySelector(".cast_grid");
    cast_grid.innerHTML = "";

    [...data.director, ...data.cast].forEach((person) => {
      const div = document.createElement("div");
      div.className = "cast_item";
      div.innerHTML = `
        <div class="cast_photo" style="background-image:url(${person.profile_path || "./img/default.png"})"></div>
        <div class="cast_info">${person.name}<br />${person.character || "감독"}</div>
      `;
      cast_grid.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    alert("영화 정보를 불러오지 못했습니다.");
  }
}

// 리뷰 리스트 로딩
async function load_reviews(movie_id) {
  try {
    const res = await fetch(`/api/reviews/movies/${movie_id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const review_cards = document.querySelector(".review_cards");
    review_cards.innerHTML = "";

    data.forEach((review) => {
      const card = document.createElement("div");
      card.className = "review_card";
      card.innerHTML = `
        <p class="review_author">${review.nickname}</p>
        <p class="review_rating">⭐ ${review.rating.toFixed(1)}</p>
        <p class="review_content">${review.content}</p>
        <p class="like_count">❤ ${review.like_cnt || 0}</p>
      `;
      review_cards.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("리뷰를 불러오는 데 실패했습니다.");
  }
}

// URL에서 movie_id 추출
function get_movie_id_from_url() {
  const params = new URLSearchParams(window.location.search);
  return params.get("movie_id");
}

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
  document.getElementById("terms_overlay").style.display = "none";
};
