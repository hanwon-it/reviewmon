// ===================== 공통 마이페이지 이동 =====================
document.addEventListener("DOMContentLoaded", () => {
  const go_mypage = document.querySelector(".btn_mypage");
  if (go_mypage) {
    go_mypage.addEventListener("click", function () {
      window.location.href = "/mypage.html";
    });
  }
});

// ===================== 공통 검색창 활성화 및 실행 =====================
document.addEventListener("DOMContentLoaded", () => {
  const search_button = document.getElementById("search_btn");
  const keyword_input = document.getElementById("search_input");
  const category_select = document.getElementById("search_category");

  function doSearch() {
    const keyword = keyword_input.value.trim();
    let category = category_select.value;
    if (!keyword) {
      alert("검색어를 입력하세요.");
      return;
    }
    if (keyword.length < 2) {
      window.showCustomAlert("검색어는 최소 2글자 이상 입력해야 합니다.");
      keyword_input.focus();
      return;
    }
    if (!["movie", "person", "user"].includes(category)) {
      category = "movie";
    }
    window.location.href = `/search.html?category=${category}&keyword=${encodeURIComponent(keyword)}`;
  }

  if (search_button && keyword_input && category_select) {
    search_button.addEventListener("click", doSearch);
    keyword_input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doSearch();
      }
    });
  }
});

// ===================== 공통 약관/개인정보 팝업 오픈/닫기 =====================
document.addEventListener("DOMContentLoaded", () => {
  const termsOverlay = document.getElementById("terms_overlay");
  const termsTitle = document.getElementById("terms_title");
  const openTerms = document.getElementById("open_terms");
  const openPrivacy = document.getElementById("open_privacy");
  const termsClose = document.getElementById("terms_close");
  if (termsOverlay && termsTitle && openTerms && openPrivacy && termsClose) {
    openTerms.onclick = (e) => {
      e.preventDefault();
      termsOverlay.style.display = "flex";
      termsTitle.textContent = "이용약관";
    };
    openPrivacy.onclick = (e) => {
      e.preventDefault();
      termsOverlay.style.display = "flex";
      termsTitle.textContent = "개인정보처리방침";
    };
    termsClose.onclick = () => {
      termsOverlay.style.display = "none";
    };
  }
});

// ===================== (필요시 추가) 공통 로그아웃 처리 =====================
window.activateLogout = function() {
  const logoutBtn = document.querySelector(".btn_logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // 커스텀 알림 모달로 대체, 확인 버튼 누를 때만 로그아웃 처리
      window.showCustomAlert("로그아웃 되었습니다.", function() {
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        window.location.href = "/index.html";
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", window.activateLogout);

// ===================== 공통 카드 클릭 시 상세페이지 이동 =====================
window.activateCardToDetail = function(selector, idAttr = "data-movie-id") {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener("click", function() {
      const movieId = card.getAttribute(idAttr);
      if (movieId) {
        window.location.href = `/detailpage.html?movie_id=${movieId}`;
      }
    });
  });
};
// 사용 예: window.activateCardToDetail('.search_card[data-movie-id]');

// ===================== 커스텀 알림 모달 =====================
// showCustomAlert(message, onClose): onClose 콜백 지원하도록 확장
window.showCustomAlert = function(message, onClose) {
  // 이미 알림창이 떠 있으면 새로 띄우지 않음
  if (document.getElementById('custom_alert_modal')) return;
  const modal = document.createElement('div');
  modal.id = 'custom_alert_modal';
  modal.innerHTML = `
    <div class="custom_alert_overlay"></div>
    <div class="custom_alert_box">
      <div class="custom_alert_message">${message}</div>
      <button class="custom_alert_btn">확인</button>
    </div>
  `;
  document.body.appendChild(modal);
  let closed = false;
  function closeModal() {
    if (closed) return;
    closed = true;
    modal.classList.add('hide');
    setTimeout(() => { 
      modal.remove(); 
      document.removeEventListener('keydown', handleEnterKey); // 엔터키 이벤트 해제
      if (onClose) onClose(); 
    }, 200);
  }
  modal.querySelector('.custom_alert_btn').onclick = closeModal;
  // 엔터키로도 닫히게 (즉시 등록 시 엔터로 바로 닫히는 현상 방지)
  function handleEnterKey(e) {
    if (e.key === 'Enter') {
      closeModal();
    }
  }
  // 엔터키 리스너를 약간 늦게 등록 (이벤트 버블링 방지)
  setTimeout(() => {
    document.addEventListener('keydown', handleEnterKey);
  }, 50);
};

// ===================== 모든 페이지에서 로그아웃 버튼(.btn_logout) 클릭 시 로그아웃 처리 =====================
document.addEventListener("DOMContentLoaded", () => {
  

  // 로고 클릭 시 home.html로 이동 (공통)
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      
      window.location.href = '/home.html';
    });
  }

  // searchInput 관련 코드가 있다면 아래와 같이 수정
  if (typeof searchInput !== 'undefined' && searchInput) {
    // searchInput 관련 코드 실행
  }
}); 
