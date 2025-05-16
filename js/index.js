// 로그인 처리
document.querySelector(".login_form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userid = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!userid || !password) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userid, password }),
    });

    const data = await res.json();

    if (res.status === 200 && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userid", userid);
      alert("로그인 성공!");
      window.location.href = "/search.html";
    } else {
      alert(data.message || "로그인 실패: 아이디 또는 비밀번호를 확인해주세요.");
    }
  } catch (err) {
    console.error("로그인 오류:", err);
    alert("서버 오류로 로그인에 실패했습니다.");
  }
});

// 모달 열기 / 닫기
const open_find_modal = document.getElementById("open_find_modal");
const close_modal = document.getElementById("close_modal");
const overlay = document.getElementById("overlay");

open_find_modal.addEventListener("click", (e) => {
  e.preventDefault();
  overlay.style.display = "flex";
});

close_modal.addEventListener("click", () => {
  overlay.style.display = "none";
});

// 아이디 찾기
document.getElementById("btn_find_id").addEventListener("click", async () => {
  const name = document.getElementById("find_id_name").value.trim();
  const email = document.getElementById("find_id_email").value.trim();

  if (!name || !email) {
    alert("이름과 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(`/api/auth/find-id?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.userid) {
      alert(`회원님의 아이디는 "${data.userid}" 입니다.`);
    } else {
      alert("일치하는 회원 정보가 없습니다.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류로 아이디 찾기에 실패했습니다.");
  }
});

// 임시 비밀번호 전송
document.getElementById("btn_send_temp_pw").addEventListener("click", async () => {
  const userid = document.getElementById("find_pw_id").value.trim();
  const email = document.getElementById("find_pw_email").value.trim();

  if (!userid || !email) {
    alert("아이디와 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("/api/auth/find-pw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, email }),
    });

    const result = await res.json();

    if (result.success) {
      alert("임시 비밀번호가 이메일로 전송되었습니다.");
    } else {
      alert(result.message || "일치하는 회원 정보가 없습니다.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류로 임시 비밀번호 전송에 실패했습니다.");
  }
});
