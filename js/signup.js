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
      pwMsg.style.color = "green";
    } else {
      pwMsg.textContent = "비밀번호가 일치하지 않습니다.";
      pwMsg.style.color = "red";
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

// ✅ 실제 API 사용: 아이디 중복 확인
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

// 폼 제출 시 필수값 체크
const form = document.querySelector(".signup_form");

form.addEventListener("submit", (e) => {
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
      e.preventDefault();
      alert(`${input.previousElementSibling.textContent}을(를) 입력해주세요.`);
      input.focus();
      return;
    }
  }

  if (!document.getElementById("agree_terms").checked) {
    e.preventDefault();
    alert("이용약관에 동의해주세요.");
  }

  // 👉 form의 action은 반드시 /api/auth/signup 으로 설정되어 있어야 합니다.
});
