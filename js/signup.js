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
      pw_msg.style.color = "green";
    } else {
      pw_msg.textContent = "비밀번호가 일치하지 않습니다.";
      pw_msg.style.color = "red";
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
    const checked_count = document.querySelectorAll(
      'input[name="genre"]:checked'
    ).length;
    if (checked_count > 3) {
      checkbox.checked = false;
      // 커스텀 알림 모달로 대체
      window.showCustomAlert("장르는 최대 3개까지만 선택할 수 있습니다.");
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
    window.showCustomAlert("아이디를 입력해주세요.");
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
      window.showCustomAlert("이미 사용 중인 아이디입니다.");
    } else {
      window.showCustomAlert("사용 가능한 아이디입니다.");
    }
  } catch (err) {
    console.error(err);
    window.showCustomAlert("서버 오류로 확인에 실패했습니다.");
  }
});

// fetch 기반 회원가입
const signup_form = document.querySelector(".signup_form");

// 배우 입력란 추가
const addActorBtn = document.getElementById("add_actor_btn");
if (addActorBtn) {
  addActorBtn.addEventListener("click", function() {
    const wrapper = document.createElement("div");
    wrapper.className = "input_with_remove";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "actor_input";
    input.placeholder = "배우 이름 입력";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove_input_btn";
    removeBtn.textContent = "✕";
    removeBtn.onclick = function() {
      wrapper.remove();
    };
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    document.getElementById("actor_fields").appendChild(wrapper);
  });
}
// 감독 입력란 추가
const addDirectorBtn = document.getElementById("add_director_btn");
if (addDirectorBtn) {
  addDirectorBtn.addEventListener("click", function() {
    const wrapper = document.createElement("div");
    wrapper.className = "input_with_remove";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "director_input";
    input.placeholder = "감독 이름 입력";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove_input_btn";
    removeBtn.textContent = "✕";
    removeBtn.onclick = function() {
      wrapper.remove();
    };
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    document.getElementById("director_fields").appendChild(wrapper);
  });
}

// 페이지 로드 시 첫 번째 인풋도 삭제 버튼이 붙도록 보정
window.addEventListener("DOMContentLoaded", function() {
  // 배우
  const actorFields = document.getElementById("actor_fields");
  if (actorFields && actorFields.children.length === 1 && actorFields.firstElementChild.classList.contains("actor_input")) {
    const input = actorFields.firstElementChild;
    const wrapper = document.createElement("div");
    wrapper.className = "input_with_remove";
    input.parentNode.replaceChild(wrapper, input);
    wrapper.appendChild(input);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove_input_btn";
    removeBtn.textContent = "✕";
    removeBtn.onclick = function() {
      wrapper.remove();
    };
    wrapper.appendChild(removeBtn);
  }
  // 감독
  const directorFields = document.getElementById("director_fields");
  if (directorFields && directorFields.children.length === 1 && directorFields.firstElementChild.classList.contains("director_input")) {
    const input = directorFields.firstElementChild;
    const wrapper = document.createElement("div");
    wrapper.className = "input_with_remove";
    input.parentNode.replaceChild(wrapper, input);
    wrapper.appendChild(input);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove_input_btn";
    removeBtn.textContent = "✕";
    removeBtn.onclick = function() {
      wrapper.remove();
    };
    wrapper.appendChild(removeBtn);
  }
});

signup_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 필수 입력값 순서대로 하나씩 체크 (아이디 → 비밀번호 → 비밀번호 확인 → 이름 → 휴대폰 → 닉네임 → 이메일)
  const userid = document.getElementById("userid");
  if (!userid.value.trim()) {
    window.showCustomAlert("아이디를 입력해주세요.");
    userid.focus();
    return;
  }
  const password = document.getElementById("password");
  if (!password.value.trim()) {
    window.showCustomAlert("비밀번호를 입력해주세요.");
    password.focus();
    return;
  }
  const password_confirm = document.getElementById("password_confirm");
  if (!password_confirm.value.trim()) {
    window.showCustomAlert("비밀번호 확인을 입력해주세요.");
    password_confirm.focus();
    return;
  }
  const name = document.getElementById("name");
  if (!name.value.trim()) {
    window.showCustomAlert("이름을 입력해주세요.");
    name.focus();
    return;
  }
  const hp = document.getElementById("hp");
  if (!hp.value.trim()) {
    window.showCustomAlert("휴대폰 번호를 입력해주세요.");
    hp.focus();
    return;
  }
  const nickname = document.getElementById("nickname");
  if (!nickname.value.trim()) {
    window.showCustomAlert("닉네임을 입력해주세요.");
    nickname.focus();
    return;
  }
  const email = document.getElementById("email");
  if (!email.value.trim()) {
    window.showCustomAlert("이메일을 입력해주세요.");
    email.focus();
    return;
  }

  // 선호조사(장르, 배우, 감독) 순서대로 체크
  if (document.querySelectorAll("input[name='genre']:checked").length === 0) {
    window.showCustomAlert("선호 장르를 선택해주세요.");
    return;
  }

  // 배우/감독 입력값 배열로 수집
  const actorInputs = Array.from(document.querySelectorAll(".actor_input"));
  const directorInputs = Array.from(document.querySelectorAll(".director_input"));
  // 값이 있는 입력란만 추출 (빈칸 무시)
  const actorNames = actorInputs.map(input => input.value.trim()).filter(Boolean);
  const directorNames = directorInputs.map(input => input.value.trim()).filter(Boolean);

  if (actorNames.length === 0) {
    window.showCustomAlert("선호 배우를 입력해주세요.");
    return;
  }
  if (directorNames.length === 0) {
    window.showCustomAlert("선호 감독을 입력해주세요.");
    return;
  }

  if (!document.getElementById("agree_terms").checked) {
    window.showCustomAlert("이용약관에 동의해주세요.");
    return;
  }

  if (pw_input.value !== pw_confirm_input.value) {
    window.showCustomAlert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // getPeopleArr 함수 수정
  async function getPeopleArr(names) {
    const arr = [];
    for (const name of names) {
      try {
        const res = await fetch(`/movie/search_person?query=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          data.results.forEach(person => {
            arr.push({ id: person.id, name: person.name });
          });
        } else {
          console.log(`[TMDB] id를 찾지 못한 인물:`, name);
          arr.push({ id: '', name });
        }
      } catch {
        console.log(`[TMDB] API 호출 실패:`, name);
        arr.push({ id: '', name });
      }
    }
    return arr;
  }

  // 배우/감독 동기적으로 TMDB id+name 변환
  const actorArr = await getPeopleArr(actorNames);
  const directorArr = await getPeopleArr(directorNames);

  const data = {
    userid: document.getElementById("userid").value.trim(),
    password: document.getElementById("password").value.trim(),
    name: document.getElementById("name").value.trim(),
    hp: document.getElementById("hp").value.trim(),
    nickname: document.getElementById("nickname").value.trim(),
    email: document.getElementById("email").value.trim(),
    genre: Array.from(
      document.querySelectorAll('input[name="genre"]:checked')
    ).map((el) => el.value),
    actor: actorArr,
    director: directorArr,
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
      window.showCustomAlert("회원가입이 완료되었습니다. 로그인해주세요.", function() {
        location.href = "/index.html";
      });
    } else {
      window.showCustomAlert(result.message || "회원가입 실패");
    }
  } catch (err) {
    console.error("서버 응답 오류 (HTML일 수 있음):", resultText);
    alert("서버 오류로 회원가입에 실패했습니다.");
  }
  if (res.status === 409) {
    const result = await res.json();
    window.showCustomAlert(result.message || "중복된 정보가 존재합니다.");
    return;
  }
});
