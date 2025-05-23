// ===================== 로그인 처리 =====================
// 로그인 폼 제출 시 서버에 로그인 요청을 보내고, 성공 시 토큰 저장 및 홈으로 이동

document.querySelector(".login_form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userid = document.getElementById("userid").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!userid || !password) {
    // 커스텀 알림 모달로 대체
    window.showCustomAlert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, password }),
    });

    const data = await res.json();

    if (res.status === 200 && data.token_exp) {
      // 토큰 지우기
      localStorage.removeItem("token");
      // 임시 토큰 발급
      localStorage.setItem("token_exp", data.token_exp);
      localStorage.setItem("userid", userid);
      
      // 커스텀 알림 모달로 대체
      window.showCustomAlert("임시 로그인 성공!", function() {
        window.location.href = "/mypage.html";
      });
    } else if (res.status === 200 && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userid", userid);
      // 커스텀 알림 모달로 대체
      window.showCustomAlert("로그인 성공!", function () {
        window.location.href = "/home.html";
      });
    }else {
      // 로그인 실패: 에러 메시지 표시
      window.showCustomAlert(
        data.message || "로그인 실패: 아이디 또는 비밀번호를 확인해주세요."
      );
    }
  } catch (err) {
    console.error("로그인 오류:", err);
    window.showCustomAlert("서버 오류로 로그인에 실패했습니다.");
  }
});

// ===================== 아이디 찾기 =====================
// 이름과 이메일을 입력받아 서버에 아이디 찾기 요청

document.getElementById("btn_find_id").addEventListener("click", async () => {
  const name = document.getElementById("find_id_name").value.trim();
  const email = document.getElementById("find_id_email").value.trim();

  if (!name || !email) {
    window.showCustomAlert("이름과 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("/auth/find-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();

    if (data.userid) {
      // 아이디 찾기 성공
      window.showCustomAlert(`회원님의 아이디는 "${data.userid}" 입니다.`);
    } else {
      // 일치하는 회원 정보 없음
      window.showCustomAlert("일치하는 회원 정보가 없습니다.");
    }
  } catch (err) {
    console.error(err);
    window.showCustomAlert("서버 오류로 아이디 찾기에 실패했습니다.");
  }
});

// ===================== 임시 비밀번호 전송 =====================
// 아이디와 이메일을 입력받아 서버에 임시 비밀번호 발급 요청

document
  .getElementById("btn_send_temp_pw")
  .addEventListener("click", async () => {
    const userid = document.getElementById("find_pw_id").value.trim();
    const email = document.getElementById("find_pw_email").value.trim();

    if (!userid || !email) {
      window.showCustomAlert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/auth/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid, email }),
      });

      const result = await res.json();

      if (result.success) {
        // 임시 비밀번호 발급 성공
        window.showCustomAlert(result.message);
      } else {
        // 실패 시 메시지 표시
        window.showCustomAlert(result.message || "일치하는 회원 정보가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      window.showCustomAlert("서버 오류로 임시 비밀번호 전송에 실패했습니다.");
    }
  });

// ===================== 아이디/비밀번호 찾기 모달 열기/닫기 =====================
// '아이디/비밀번호 찾기' 버튼 클릭 시 모달 오픈, 닫기 버튼 또는 오버레이 클릭 시 모달 닫기
document.addEventListener("DOMContentLoaded", () => {
  const open_find_modal = document.getElementById("open_find_modal");
  const close_modal = document.getElementById("close_modal");
  const overlay = document.getElementById("overlay");

  if (open_find_modal && close_modal && overlay) {
    open_find_modal.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.style.display = "flex";
    });

    close_modal.addEventListener("click", () => {
      overlay.style.display = "none";
    });
  }
});
// ===================== 모달 열기/닫기 끝 =====================
