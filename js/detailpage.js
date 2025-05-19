//마이페이지 버튼 활성화
const go_mypage = document.querySelector(".btn_mypage");
go_mypage.addEventListener("click", function () {
  window.location.href = "/mypage.html";
});

// 영화 상세 페이지 활성화
document.addEventListener("DOMContentLoaded", async () => {
  const movie_id = get_movie_id_from_url();
  if (!movie_id) {
    alert("잘못된 접근입니다.");
    return;
  }

  // 더보기 버튼 클릭 시 리뷰페이지로 이동
  const moreBtn = document.querySelector(".btn_link");
  if (moreBtn && movie_id) {
    moreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = `/reviewpage.html?movie_id=${movie_id}`;
    });
  }

  // 영화 상세 정보 로드
  await load_movie_details(movie_id);

  // 모달 요소
  const review_modal = document.getElementById("review_modal");
  const open_review_modal = document.getElementById("open_review_modal");
  const close_modal = document.getElementById("close_modal");
  const modal_overlay = document.querySelector(".modal_overlay");
  const review_form = document.getElementById("review_form");

  // 별점 입력 UI (0.5 단위, hover/클릭, 실시간 표시)
  let currentRating = 0;
  let hoverRating = 0;

  function renderStarRating(rating = 0) {
    const starContainer = document.getElementById('star_rating_input');
    if (!starContainer) return;
    // hoverRating이 있으면 hoverRating을 우선 사용
    const displayRating = hoverRating || rating;
    starContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      let starType = 'empty';
      if (displayRating >= i) {
        starType = 'full';
      } else if (displayRating >= i - 0.5) {
        starType = 'half';
      }
      const star = document.createElement('span');
      star.className = 'star';
      star.style.cursor = 'pointer';
      // 0.5점 클릭/hover 지원
      star.onmousemove = (e) => {
        const rect = star.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) {
          star.onmouseenter = () => { updateStarHover(i - 0.5); };
          star.onclick = () => setStarRating(i - 0.5);
          star.title = `${(i - 0.5).toFixed(1)}점`;
        } else {
          star.onmouseenter = () => { updateStarHover(i); };
          star.onclick = () => setStarRating(i);
          star.title = `${i.toFixed(1)}점`;
        }
      };
      star.onmouseleave = () => { updateStarHover(0); };
      // SVG
      if (starType === 'full') {
        star.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
      } else if (starType === 'half') {
        star.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24"><defs><linearGradient id="half"><stop offset="50%" stop-color="#FFD700"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9" fill="url(#half)" stroke="#FFD700" stroke-width="1"/></svg>`;
      } else {
        star.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="1"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
      }
      starContainer.appendChild(star);
    }
    // 점수 표시
    const valueElem = document.getElementById('star_rating_value');
    if (valueElem) valueElem.textContent = displayRating.toFixed(1);
  }
  function updateStarHover(val) {
    hoverRating = val;
    renderStarRating(currentRating);
  }
  function setStarRating(val) {
    currentRating = val;
    renderStarRating(currentRating);
  }
  // 모달 열릴 때 별점 초기화 및 모달 열기
  if (open_review_modal) {
    open_review_modal.addEventListener("click", () => {
      currentRating = 0;
      renderStarRating(0);
      review_modal.classList.add("show");
    });
  }
  // 최초 렌더
  renderStarRating(0);

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
    if (!currentRating || currentRating < 0.5) {
      alert("별점을 0.5점 이상 선택해주세요.");
      return;
    }
    try {
      const res = await fetch(`/reviews/movie/${movie_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: comment,
          rating: currentRating,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        alert("리뷰가 등록되었습니다.");
        review_form.reset();
        review_modal.classList.remove("show");
        await load_movie_details(movie_id);
      } else {
        alert(data.message || "리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류로 리뷰 등록에 실패했습니다.");
    }
  });

  // 모달 닫기 버튼 및 오버레이 클릭 시 닫기
  if (close_modal) {
    close_modal.addEventListener("click", () => {
      review_modal.classList.remove("show");
    });
  }
  if (modal_overlay) {
    modal_overlay.addEventListener("click", () => {
      review_modal.classList.remove("show");
    });
  }
});

// 좋아요한 리뷰 id 리스트를 저장할 변수
let likedReviewIds = [];

// 좋아요한 리뷰 id 리스트 받아오기
async function fetchLikedReviewIds() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  try {
    const res = await fetch('/reviews/user/me/review-likes', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return [];
}

// 영화 상세 정보 로딩
async function load_movie_details(movie_id) {
  try {
    const res = await fetch(`/movie/${movie_id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.querySelector(".info h1").textContent = data.title;
    // overview에서 마침표 하나(.) 뒤에만 줄 바꿈을 넣고, .. ... 등은 무시
    const overviewText = (data.overview || '').replace(/(?<!\.)\.(?!\.) /g, '.<br>');
    document.querySelector('.overview').innerHTML = overviewText;
    document.querySelector(".poster img").src = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "./img/default_poster.jpg";
    // 별점 SVG 생성 함수
    function getStarSVG(rating) {
      let stars = "";
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          // 꽉 찬 별
          stars += `<svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
        } else if (rating >= i - 0.5) {
          // 반 별 (비채워진 부분을 투명하게)
          stars += `<svg width="24" height="24" viewBox="0 0 24 24" style="vertical-align:middle;"><defs><linearGradient id="half"><stop offset="50%" stop-color="#FFD700"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9" fill="url(#half)" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        } else {
          // 빈 별 (투명)
          stars += `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="12,2 15,9 22,9.3 17,14.1 18.5,21 12,17.5 5.5,21 7,14.1 2,9.3 9,9"/></svg>`;
        }
      }
      return stars;
    }
    // 별점 SVG와 평점 숫자 표시 (수평 정렬)
    const ratingElem = document.querySelector(".rating");
    ratingElem.style.display = "flex";
    ratingElem.style.alignItems = "center";
    ratingElem.style.justifyContent = "center";
    let ratingText =
      typeof data.rating === "number" && !isNaN(data.rating)
        ? data.rating.toFixed(1)
        : "-";
    let starsSVG =
      typeof data.rating === "number" && !isNaN(data.rating)
        ? getStarSVG(data.rating)
        : "-";
    ratingElem.innerHTML = `리뷰몬 평점 : <span style='display:flex;align-items:center;gap:2px;'>${starsSVG}</span> ( ${ratingText} / 5.0 )`;

    // 출연진/감독 렌더링 (영문 이름만)
    const getProfileUrl = (profile_path) => {
      if (!profile_path) return null;
      return `https://image.tmdb.org/t/p/w500${profile_path.startsWith('/') ? profile_path : '/' + profile_path}`;
    };
    const cast_grid = document.querySelector(".cast_grid");
    cast_grid.innerHTML = "";
    const people = [...(data.director || []), ...(data.cast || [])];
    people.forEach((person) => {
      const div = document.createElement("div");
      div.className = "cast_item";
      div.innerHTML = `
        <div class="cast_photo" style="background-image:url('${
          person.profile_path
            ? getProfileUrl(person.profile_path)
            : 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Finstagram%2Ftrumanblack%2Fprofile_pic.jpg&type=a340'
        }')"></div>
        <div class="cast_info">${person.name}<br />${
        person.character || "감독"
      }</div>
      `;
      cast_grid.appendChild(div);
    });

    // 리뷰 렌더링
    const review_cards = document.querySelector(".review_cards");
    review_cards.innerHTML = "";
    // 추천 수 내림차순 정렬 후 상위 3개만
    const topReviews = (data.reviews || [])
      .sort((a, b) => (b.like_cnt || 0) - (a.like_cnt || 0))
      .slice(0, 3);

    // (추가) 좋아요한 리뷰 id 리스트 받아오기
    likedReviewIds = await fetchLikedReviewIds();

    topReviews.forEach((review) => {
      const card = document.createElement("div");
      card.className = "review_card";
      // 날짜 포맷팅
      let dateStr = '';
      if (review.createdAt) {
        const d = new Date(review.createdAt);
        dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
      }
      // 별점 SVG 및 평점 숫자
      const ratingNum = typeof review.rating === "number" && !isNaN(review.rating) ? review.rating.toFixed(1) : "-";
      const starsSVG = typeof review.rating === "number" && !isNaN(review.rating) ? getStarSVG(review.rating) : "-";
      // 좋아요(하트) 상태: likedReviewIds에 포함되어 있으면 빨간색
      const isLiked = likedReviewIds.includes(String(review._id));
      card.innerHTML = `
        <p class="review_author">
          <a href="/reviewpage.html?nickname=${encodeURIComponent(
            review.nickname
          )}" class="review_nickname_link">${review.nickname}</a>
        </p>
        <div class="review_rating_row" style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
          <span class="review_stars">${starsSVG}</span>
          <span class="review_rating_num">(${ratingNum} / 5.0)</span>
        </div>
        <p class="review_content">${review.content}</p>
        <div class="review_bottom_row">
          <span class="like_count" data-review-id="${review._id}"><span class="heart_icon" style="cursor:pointer;font-size:1.1em;color:${isLiked ? 'red' : '#888'};">❤</span> <span class="like_num">${review.like_cnt || 0}</span></span>
          <span class="review_date">${dateStr ? `${dateStr}` : ''}</span>
        </div>
      `;
      review_cards.appendChild(card);
    });

    // 하트(좋아요) 클릭 이벤트 바인딩
    document.querySelectorAll('.like_count .heart_icon').forEach(icon => {
      icon.addEventListener('click', async function() {
        const parent = this.closest('.like_count');
        const reviewId = parent.getAttribute('data-review-id');
        const token = localStorage.getItem("token");
        if (!token) {
          alert('로그인 후 이용해 주세요.');
          window.location.href = '/login.html';
          return;
        }
        const isLiked = this.style.color === 'red';
        try {
          let res;
          if (!isLiked) {
            // 좋아요 추가
            res = await fetch(`/reviews/${reviewId}/like`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            // 좋아요 취소
            res = await fetch(`/reviews/${reviewId}/like`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          const data = await res.json();
          if (res.ok) {
            // UI 갱신
            this.style.color = !isLiked ? 'red' : '#888';
            parent.querySelector('.like_num').textContent = data.like_cnt;
            // likedReviewIds 동기화
            if (!isLiked) {
              likedReviewIds.push(String(reviewId));
            } else {
              likedReviewIds = likedReviewIds.filter(id => id !== String(reviewId));
            }
          } else {
            alert(data.message || '처리 실패');
          }
        } catch (err) {
          alert('서버 오류');
        }
      });
    });
  } catch (err) {
    console.error(err);
    alert("영화 정보를 불러오지 못했습니다.");
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
