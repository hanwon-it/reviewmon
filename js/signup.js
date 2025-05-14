// 비밀번호 확인 실시간 체크
const pwInput = document.getElementById("password");
const pwConfirmInput = document.getElementById("password_confirm");
const pwMsg = document.getElementById("pw_check_msg");

function checkPasswordMatch() {
  const pw = pwInput.value;
  const pwConfirm = pwConfirmInput.value;

  if (pw && pwConfirm) {
    if (pw === pwConfirm) {
      pwMsg.textContent = "비밀번호가 일치합니다.";
    } else {
      pwMsg.textContent = "비밀번호가 일치하지 않습니다.";
    }
  } else {
    pwMsg.textContent = "";
  }
}

pwInput.addEventListener("input", checkPasswordMatch);
pwConfirmInput.addEventListener("input", checkPasswordMatch);

// 장르 선택 최대 3개 제한
const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
genreCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const checkedCount = document.querySelectorAll(
      'input[name="genre"]:checked'
    ).length;
    if (checkedCount > 3) {
      checkbox.checked = false;
      alert("장르는 최대 3개까지만 선택할 수 있습니다.");
    }
  });
});

// 약관 모달 열기 / 닫기
const linkTerms = document.querySelector(".link_terms");
const termsOverlay = document.getElementById("terms_overlay");
const closeTerms = document.getElementById("terms_close");

linkTerms.addEventListener("click", (e) => {
  e.preventDefault();
  termsOverlay.style.display = "block";
});

closeTerms.addEventListener("click", () => {
  termsOverlay.style.display = "none";
});

// 아이디 중복 확인
const checkBtn = document.querySelector(".btn_check");
const userIdInput = document.getElementById("user_id");

checkBtn.addEventListener("click", async () => {
  const userId = userIdInput.value.trim();
  if (!userId) {
    alert("아이디를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch(`/api/auth/check-id?user_id=${encodeURIComponent(userId)}`);
    const data = await res.json();

    if (data.exists) {
      alert("이미 사용 중인 아이디입니다.");
    } else {
      alert("사용 가능한 아이디입니다.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류로 확인에 실패했습니다.");
  }
});

// fetch 기반 회원가입
const form = document.querySelector(".signup_form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const requiredFields = [
    "user_id",
    "password",
    "password_confirm",
    "name",
    "phone",
    "nickname",
    "email"
  ];

  for (let fieldId of requiredFields) {
    const input = document.getElementById(fieldId);
    if (!input.value.trim()) {
      alert(`${input.previousElementSibling.textContent}을(를) 입력해주세요.`);
      input.focus();
      return;
    }
  }

  if (!document.getElementById("agree_terms").checked) {
    alert("이용약관에 동의해주세요.");
    return;
  }

  if (pwInput.value !== pwConfirmInput.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const data = {
    user_id: document.getElementById("user_id").value.trim(),
    password: document.getElementById("password").value.trim(),
    name: document.getElementById("name").value.trim(),
    hp: document.getElementById("phone").value.trim(),
    nickname: document.getElementById("nickname").value.trim(),
    email: document.getElementById("email").value.trim(),
    genre: Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(el => el.value),
    actor: document.getElementById("actors").value.trim(),
    director: document.getElementById("directors").value.trim(),
  };

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.status === 201) {
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      location.href = "/login.html";
    } else {
      const result = await res.json();
      alert(result.message || "회원가입 실패");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류로 회원가입에 실패했습니다.");
  }
});
