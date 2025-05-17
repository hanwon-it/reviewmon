//마이페이지 버튼 활성화
const go_mypage = document.querySelector(".btn_mypage");
go_mypage.addEventListener("click", function () {
  window.location.href = "/mypage.html";
});

// 프로필에 기본 본인 정보 띄워주기
document.addEventListener("DOMContentLoaded", async () => {
  // DOM 요소 선택
  const view_id = document.getElementById("user_id");
  const view_join_date = document.getElementById("join_date");
  const view_nickname = document.getElementById("nickname");
  const view_password = document.getElementById("password");
  const view_phone = document.getElementById("phone");
  const view_email = document.getElementById("email");

  const token = localStorage.getItem("token"); // 저장된 JWT 토큰 가져오기

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login.html"; // 필요시 로그인 페이지로 이동
    return;
  }

  try {
    const res = await fetch("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    console.log("받은 유저 데이터:", data); // 디버깅용

    // DOM에 사용자 정보 출력
    view_id.value = data.userid;
    view_join_date.value = new Date(data.createdAt).toLocaleDateString();
    view_nickname.value = data.nickname;
    view_password.value = data.password;
    view_phone.value = data.hp;
    view_email.value = data.email;
  } catch (err) {
    console.error("유저 정보 가져오기 실패:", err);
    alert("유저 정보를 가져오지 못했습니다.");
  }
});

// 프로필 수정 기능 활성화
document.addEventListener("DOMContentLoaded", () => {
  const edit_buttons = document.querySelectorAll(".btn_edit");

  edit_buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.previousElementSibling;

      // ✅ 이전 값 백업
      const original_value = field.value;

      if (field.hasAttribute("readonly")) {
        // 수정 모드 진입
        field.removeAttribute("readonly");
        field.focus();
        btn.textContent = "저장";
      } else {
        // 저장 요청
        field.setAttribute("readonly", true);
        btn.textContent = "수정";

        const field_id = field.id;
        const updated_value = field.value;

        fetch("/auth/update", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ [field_id]: updated_value }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) throw new Error(data.message);
            console.log("업데이트 성공:", data);

            // ✅ 성공 알림
            alert("수정에 성공했습니다.");
          })
          .catch((err) => {
            // 실패 시 이전 값 복구
            field.value = original_value;
            alert("수정 실패: " + err.message);
          });
      }
    });
  });
});

// 선호장르 수정 팝업 열기 버튼 연결
document.querySelector(".btn_prefs_edit").addEventListener("click", () => {
  document.getElementById("genre_preferences_modal").classList.add("open");
});

// 닫기 버튼 연결
document
  .getElementById("genre_preferences_cancel")
  .addEventListener("click", () => {
    document.getElementById("genre_preferences_modal").classList.remove("open");
  });

// 토글 버튼 처리
document.querySelectorAll(".genre-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = document.querySelectorAll(".genre-toggle.selected");
    if (!button.classList.contains("selected") && selected.length >= 3) {
      alert("최대 3개까지 선택할 수 있습니다.");
      return;
    }
    button.classList.toggle("selected");
  });
});

// 저장 버튼 클릭
document
  .getElementById("genre_preferences_confirm")
  .addEventListener("click", async () => {
    const selectedGenres = Array.from(
      document.querySelectorAll(".genre-toggle.selected")
    ).map((btn) => btn.dataset.genre);

    if (selectedGenres.length === 0) {
      alert("최소 한 개 이상 선택해주세요.");
      return;
    }

    // API 연동 부분 (예시)
    try {
      const res = await fetch("/api/favorite/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("선호 장르가 저장되었습니다.");
        document
          .getElementById("genre_preferences_modal")
          .classList.remove("open");
      } else {
        alert("저장 실패: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  });

// 약관 팝업 오픈/닫기 처리
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

document.addEventListener("DOMContentLoaded", () => {
  const btnWithdrawal = document.getElementById("btn_withdrawal");
  const modal = document.getElementById("withdrawalModal");
  const btnConfirm = document.getElementById("confirmWithdrawalBtn");
  const btnCancel = document.getElementById("cancelWithdrawalBtn");

  // 1) 모달 열기
  btnWithdrawal.addEventListener("click", () => {
    modal.classList.add("open");
  });

  // 2) 모달 닫기 (아니요)
  btnCancel.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  // 3) 모달 바깥 클릭해도 닫히도록 (선택)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  // 4) “예” 클릭 → 탈퇴 API 호출 → 인덱스로 리다이렉트
  btnConfirm.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      if (res.ok) {
        alert("회원탈퇴가 완료되었습니다.");
        window.location.href = "/"; // index 페이지로 이동
      } else {
        throw new Error(res.status);
      }
    } catch (err) {
      console.error("탈퇴 오류:", err);
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  });
});
