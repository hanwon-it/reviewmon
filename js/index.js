// 모달 열기
const openModalBtn = document.getElementById("open_find_modal");
const closeModalBtn = document.getElementById("close_modal");
const overlay = document.getElementById("overlay");

openModalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  overlay.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  overlay.style.display = "none";
});

// 아이디 찾기 (가짜 fetch 예시)
document.getElementById("btn_find_id").addEventListener("click", async () => {
  const name = document.getElementById("find_id_name").value.trim();
  const email = document.getElementById("find_id_email").value.trim();

  if (!name || !email) {
    alert("이름과 이메일을 모두 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(`/api/find-id?name=${name}&email=${email}`);
    const data = await res.json();

    if (data.user_id) {
      alert(`회원님의 아이디는 "${data.user_id}" 입니다.`);
    } else {
      alert("일치하는 회원 정보가 없습니다.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류로 아이디 찾기에 실패했습니다.");
  }
});

// 임시 비밀번호 전송
document
  .getElementById("btn_send_temp_pw")
  .addEventListener("click", async () => {
    const userId = document.getElementById("find_pw_id").value.trim();
    const email = document.getElementById("find_pw_email").value.trim();

    if (!userId || !email) {
      alert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/send-temp-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, email }),
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
