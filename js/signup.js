// 비밀번호 확인 실시간 체크
const pw_input = document.getElementById("password");
const pw_confirm_input = document.getElementById("password_confirm");
const pw_msg = document.getElementById("pw_check_msg");

function check_password_match() {
  const pw = pw_input.value;
  const pw_confirm = pw_confirm_input.value;

  if (pw && pw_confirm) {
    if (pw === pw_confirm) {
      pw_msg.textContent = "비밀번호가 일치합니다.";
    } else {
      pw_msg.textContent = "비밀번호가 일치하지 않습니다.";
    }
  } else {
    pw_msg.textContent = "";
  }
}

pw_input.addEventListener("input", check_password_match);
pw_confirm_input.addEventListener("input", check_password_match);

// 장르 선택 최대 3개 제한
const genre_checkboxes = document.querySelectorAll('input[name="genre"]');
genre_checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const checked_count = document.querySelectorAll('input[name="genre"]:checked').length;
    if (checked_count > 3) {
      checkbox.checked = false;
      alert("장르는 최대 3개까지만 선택할 수 있습니다.");
    }
  });
});

// 약관 모달 열기 / 닫기
const link_terms = document.querySelector(".link_terms");
const terms_overlay = document.getElementById("terms_overlay");
const terms_close = document.getElementById("terms_close");

link_terms.addEventListener("click", (e) => {
  e.preventDefault();
  terms_overlay.style.display = "flex";
});

terms_close.addEventListener("click", () => {
  terms_overlay.style.display = "none";
});

// 아이디 중복 확인 (POST 방식)
const check_btn = document.querySelector(".btn_check");
const user_id_input = document.getElementById("userid");

check_btn.addEventListener("click", async () => {
  const userid = user_id_input.value.trim();
  if (!userid) {
    alert("아이디를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("/auth/check-userid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid }),
    });

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
const signup_form = document.querySelector(".signup_form");

signup_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const required_fields = [
    "userid",
    "password",
    "password_confirm",
    "name",
    "phone",
    "nickname",
    "email"
  ];

  for (let field_id of required_fields) {
    const input = document.getElementById(field_id);
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

  if (pw_input.value !== pw_confirm_input.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const data = {
    userid: document.getElementById("userid").value.trim(),
    password: document.getElementById("password").value.trim(),
    name: document.getElementById("name").value.trim(),
    hp: document.getElementById("phone").value.trim(),
    nickname: document.getElementById("nickname").value.trim(),
    email: document.getElementById("email").value.trim(),
    genre: Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(el => el.value),
    actor: document.getElementById("actors").value.trim(),
    director: document.getElementById("directors").value.trim(),
  };
const res = await fetch("/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

let resultText = "";
try {
  // 먼저 응답 본문을 텍스트로 받음 (한 번만)
  resultText = await res.text();

  // JSON 파싱 시도
  const result = JSON.parse(resultText);

  if (res.status === 201) {
    alert("회원가입이 완료되었습니다. 로그인해주세요.");
    location.href = "/index.html";
  } else {
    alert(result.message || "회원가입 실패");
  }
} catch (err) {
  console.error("서버 응답 오류 (HTML일 수 있음):", resultText);
  alert("서버 오류로 회원가입에 실패했습니다.");
}if (res.status === 409) {
  const result = await res.json();
  alert(result.message || "중복된 정보가 존재합니다.");
  return;
}
}

);


