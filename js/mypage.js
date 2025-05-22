// 장르 value(숫자) → 한글명 매핑
const GENRE_LABELS = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  10749: "로맨스",
  // 필요시 추가
};

// 프로필에 기본 본인 정보 띄워주기
document.addEventListener("DOMContentLoaded", async () => {
  // DOM 요소 선택
  const view_id = document.getElementById("user_id");
  const view_join_date = document.getElementById("join_date");
  const view_nickname = document.getElementById("nickname");
  const view_password = document.getElementById("password");
  const view_hp = document.getElementById("hp");
  const view_email = document.getElementById("email");

  const token = localStorage.getItem("token"); // 저장된 JWT 토큰 가져오기
  const token_exp = localStorage.getItem("token_exp"); // 저장된 EXP 토큰 가져오기

  console.log(`토큰: ${token}`);
  console.log(`임시 토큰: ${token_exp}`);

  // 예: mypage에서 검색창이나 버튼을 disable
  if (token_exp !== null && token === null) {
    console.warn("임시 비번 상태에서는 마이페이지 일부 기능 제한");

    // 검색창 비활성화
    document.querySelector("#search_input").disabled = true;
    document.querySelector("#search_btn").disabled = true;
    document.querySelector("#search_category").disabled = true;

    // 필요시 스타일 회색으로
    document.querySelector(".search_box").style.opacity = 0.5;

    // 또는 안내 문구 출력
    const warning = document.createElement("div");
    warning.textContent =
      "⚠️ 임시 비밀번호 상태에서는 검색을 사용할 수 없습니다.";
    warning.style.color = "orange";
    warning.style.fontSize = "0.9rem";
    warning.style.marginTop = "0.5rem";
    document.querySelector(".search_box").appendChild(warning);
  }

  if (!token) {
    if (!token_exp) {
      window.showCustomAlert("로그인이 필요합니다.");
      window.location.href = "/login.html"; // 필요시 로그인 페이지로 이동
      return;
    }
  }

  try {
    let res = null;
    if (token_exp !== null) {
      console.log("👉 임시 토큰으로 요청 중...");
      res = await fetch("/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token_exp}`,
          "Content-Type": "application/json",
        },
      });
    } else if (token !== null) {
      console.log("👉 일반 토큰으로 요청 중...");
      res = await fetch("/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!res) throw new Error("fetch 요청이 실행되지 않았습니다.");

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    console.log("받은 유저 데이터:", data); // 디버깅용

    // DOM에 사용자 정보 출력
    view_id.value = data.userid;
    view_join_date.value = new Date(data.createdAt).toLocaleDateString();
    view_nickname.value = data.nickname;
    view_password.value = data.password;
    view_hp.value = data.hp;
    view_email.value = data.email;

    // 선호조사 정보 표시 (display 영역)
    if (data.favorite) {
      updateFavoriteDisplay(data.favorite);
    }
    // 장르 수정 버튼
    document.getElementById("genre_edit_btn").onclick = function() {
      document.getElementById("genre_display").style.display = "none";
      document.getElementById("genre_edit_btn").style.display = "none";
      document.getElementById("genre_edit_area").style.display = "flex";
      // 현재 선택된 장르로 토글 초기화
      const currentGenres = (data.favorite && data.favorite.genre) ? data.favorite.genre : [];
      setGenreEditToggles(currentGenres);
    };
    document.getElementById("genre_cancel_btn").onclick = function() {
      document.getElementById("genre_edit_area").style.display = "none";
      document.getElementById("genre_display").style.display = "inline";
      document.getElementById("genre_edit_btn").style.display = "inline-block";
    };
    document.getElementById("genre_save_btn").onclick = async function() {
      const selectedGenres = Array.from(document.querySelectorAll("#genre_edit_toggle_wrap .genre-toggle.selected")).map(btn => btn.dataset.genre);
      if (selectedGenres.length === 0) {
        window.showCustomAlert("최소 한 개 이상 선택해주세요.");
        return;
      }
      try {
        const res = await fetch("/auth/favorite", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ genre: selectedGenres }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        // 성공 시 display 갱신
        updateFavoriteDisplay({
          genre: selectedGenres,
          actor: data.favorite ? data.favorite.actor : [],
          director: data.favorite ? data.favorite.director : []
        });
        document.getElementById("genre_edit_area").style.display = "none";
        document.getElementById("genre_display").style.display = "inline";
        document.getElementById("genre_edit_btn").style.display = "inline-block";
        window.showCustomAlert("저장되었습니다.");
        // data.favorite 갱신
        if (data.favorite) data.favorite.genre = selectedGenres;
      } catch (err) {
        window.showCustomAlert("저장 실패: " + err.message);
      }
    };
    // 배우/감독 display 영역 초기화
    if (data.favorite) {
      updateFavoriteDisplay(data.favorite);
    }
    // 배우 수정 버튼
    document.getElementById("actor_edit_btn").onclick = function() {
      document.getElementById("actor_display").style.display = "none";
      document.getElementById("actor_edit_btn").style.display = "none";
      document.getElementById("actor_edit_area").style.display = "flex";
      setInitialFavoriteInputs(data.favorite ? data.favorite.actor : [], "mypage_actor_fields", "mypage_actor_input", "배우 이름 입력");
      // ★ 추가: 이벤트 바인딩을 여기서 다시 해줌
      document.getElementById("mypage_add_actor_btn").onclick = function() {
        document.getElementById("mypage_actor_fields").appendChild(
          createInputWithRemove("mypage_actor_input", "배우 이름 입력")
        );
      };
    };
    document.getElementById("mypage_cancel_actor_btn").onclick = function() {
      document.getElementById("actor_edit_area").style.display = "none";
      document.getElementById("actor_display").style.display = "inline";
      document.getElementById("actor_edit_btn").style.display = "inline-block";
    };
    document.getElementById("mypage_save_actor_btn").onclick = async function() {
      const names = getFavoriteNames("mypage_actor_input");
      if (names.length === 0) {
        window.showCustomAlert("선호 배우를 입력해주세요.");
        return;
      }
      const arr = await getPeopleArrMypage(names);
      try {
        const res = await fetch("/auth/favorite", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ actor: arr }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        // 성공 시 display 갱신
        updateFavoriteDisplay({
          genre: data.favorite ? data.favorite.genre : [],
          actor: arr,
          director: data.favorite ? data.favorite.director : []
        });
        document.getElementById("actor_edit_area").style.display = "none";
        document.getElementById("actor_display").style.display = "inline";
        document.getElementById("actor_edit_btn").style.display = "inline-block";
        window.showCustomAlert("저장되었습니다.");
        // data.favorite 갱신
        if (data.favorite) data.favorite.actor = arr;
      } catch (err) {
        window.showCustomAlert("저장 실패: " + err.message);
      }
    };
    // 감독 수정 버튼
    document.getElementById("director_edit_btn").onclick = function() {
      document.getElementById("director_display").style.display = "none";
      document.getElementById("director_edit_btn").style.display = "none";
      document.getElementById("director_edit_area").style.display = "flex";
      setInitialFavoriteInputs(data.favorite ? data.favorite.director : [], "mypage_director_fields", "mypage_director_input", "감독 이름 입력");
      // ★ 추가: 이벤트 바인딩을 여기서 다시 해줌
      document.getElementById("mypage_add_director_btn").onclick = function() {
        document.getElementById("mypage_director_fields").appendChild(
          createInputWithRemove("mypage_director_input", "감독 이름 입력")
        );
      };
    };
    document.getElementById("mypage_cancel_director_btn").onclick = function() {
      document.getElementById("director_edit_area").style.display = "none";
      document.getElementById("director_display").style.display = "inline";
      document.getElementById("director_edit_btn").style.display = "inline-block";
    };
    document.getElementById("mypage_save_director_btn").onclick = async function() {
      const names = getFavoriteNames("mypage_director_input");
      if (names.length === 0) {
        window.showCustomAlert("선호 감독을 입력해주세요.");
        return;
      }
      const arr = await getPeopleArrMypage(names);
      try {
        const res = await fetch("/auth/favorite", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ director: arr }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        // 성공 시 display 갱신
        updateFavoriteDisplay({
          genre: data.favorite ? data.favorite.genre : [],
          actor: data.favorite ? data.favorite.actor : [],
          director: arr
        });
        document.getElementById("director_edit_area").style.display = "none";
        document.getElementById("director_display").style.display = "inline";
        document.getElementById("director_edit_btn").style.display = "inline-block";
        window.showCustomAlert("저장되었습니다.");
        // data.favorite 갱신
        if (data.favorite) data.favorite.director = arr;
      } catch (err) {
        window.showCustomAlert("저장 실패: " + err.message);
      }
    };
  } catch (err) {
    console.error("유저 정보 가져오기 실패:", err);
    window.showCustomAlert("유저 정보를 가져오지 못했습니다.");
  }
});

// 프로필 수정 기능 활성화
document.addEventListener("DOMContentLoaded", () => {
  const edit_buttons = document.querySelectorAll(".btn_edit");

  edit_buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.previousElementSibling;
      const token = localStorage.getItem("token");
      if (field.hasAttribute("readonly")) {
        field.dataset.original = field.value; // 진입 시점의 값을 data-original에 저장
        field.removeAttribute("readonly");
        field.focus();
        btn.textContent = "저장";
      } else {
        // 저장 요청
        // 닉네임 필드일 때 빈값 방지
        if (field.id === "nickname" && (!field.value || !field.value.trim())) {
          window.showCustomAlert("닉네임은 필수 입력 사항입니다.");
          field.value = field.dataset.original || "";
          field.focus();
          return;
        }
        field.setAttribute("readonly", true);
        btn.textContent = "수정";

        const field_id = field.id;
        const updated_value = field.value;
        let patchBody = { [field_id]: updated_value };
        if (field_id === "hp") {
          patchBody = { hp: updated_value };
        }

        fetch("/auth/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patchBody),
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) throw new Error(data.message);
            console.log("업데이트 성공:", data);

            // ✅ 성공 알림
            window.showCustomAlert("수정에 성공했습니다.");
          })
          .catch((err) => {
            // 실패 시 이전 값 복구 (data-original에서)
            field.value = field.dataset.original || "";
            window.showCustomAlert("수정 실패: " + err.message);
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
      // 커스텀 알림 모달로 대체
      window.showCustomAlert("최대 3개까지 선택할 수 있습니다.");
      return;
    }
    button.classList.toggle("selected");
  });
});

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

  // 4) "예" 클릭 → 탈퇴 API 호출 → 인덱스로 리다이렉트
  btnConfirm.addEventListener("click", async () => {
    try {
      const res = await fetch("/auth/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        window.showCustomAlert("회원탈퇴가 완료되었습니다.");
        window.location.href = "/"; // index 페이지로 이동
      } else {
        throw new Error(res.status);
      }
    } catch (err) {
      console.error("탈퇴 오류:", err);
      window.showCustomAlert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  });
});

// ====== 배우/감독 입력란 동적 추가/삭제/저장 ======
function createInputWithRemove(className, placeholder) {
  const wrapper = document.createElement("div");
  wrapper.className = "input_with_remove";
  const input = document.createElement("input");
  input.type = "text";
  input.className = className;
  input.placeholder = placeholder;
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove_input_btn";
  removeBtn.textContent = "✕";
  removeBtn.onclick = function() {
    wrapper.remove();
  };
  wrapper.appendChild(input);
  wrapper.appendChild(removeBtn);
  return wrapper;
}

function setInitialFavoriteInputs(arr, fieldsId, className, placeholder) {
  const fields = document.getElementById(fieldsId);
  fields.innerHTML = '';
  if (arr && arr.length > 0) {
    arr.forEach(item => {
      const wrapper = createInputWithRemove(className, placeholder);
      wrapper.querySelector('input').value = item.name;
      fields.appendChild(wrapper);
    });
  } else {
    fields.appendChild(createInputWithRemove(className, placeholder));
  }
}

function getFavoriteNames(className) {
  return Array.from(document.querySelectorAll('.' + className))
    .map(input => input.value.trim())
    .filter(Boolean);
}

async function getPeopleArrMypage(names) {
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

// ====== 선호조사 display/edit 영역 전환 및 저장/취소 ======
function updateFavoriteDisplay(favorite) {
  // 장르
  const genreArr = favorite.genre || [];
  document.getElementById("genre_display").textContent = genreArr.map(v => GENRE_LABELS[v] || v).join(", ");
  // 배우
  const actorArr = favorite.actor || [];
  document.getElementById("actor_display").textContent = actorArr.map(a => a.name).join(", ");
  // 감독
  const directorArr = favorite.director || [];
  document.getElementById("director_display").textContent = directorArr.map(d => d.name).join(", ");
}

function setGenreEditToggles(selectedGenres) {
  const genres = [
    { id: "28", name: "액션" }, { id: "12", name: "모험" }, { id: "16", name: "애니메이션" },
    { id: "35", name: "코미디" }, { id: "80", name: "범죄" }, { id: "99", name: "다큐멘터리" },
    { id: "18", name: "드라마" }, { id: "10751", name: "가족" }, { id: "14", name: "판타지" }, { id: "10749", name: "로맨스" }
  ];
  const wrap = document.getElementById("genre_edit_toggle_wrap");
  wrap.innerHTML = '';
  genres.forEach(g => {
    const btn = document.createElement("button");
    btn.className = "genre-toggle";
    btn.dataset.genre = g.id;
    btn.textContent = g.name;
    if (selectedGenres.includes(g.id)) btn.classList.add("selected");
    btn.onclick = function() {
      if (!btn.classList.contains("selected") && wrap.querySelectorAll(".selected").length >= 3) {
        window.showCustomAlert("최대 3개까지 선택할 수 있습니다.");
        return;
      }
      btn.classList.toggle("selected");
    };
    wrap.appendChild(btn);
  });
}

// 비밀번호 변경 UI 동작
const pwEditBtn = document.getElementById("btn_pw_edit");
const pwSaveBtn = document.getElementById("btn_pw_save");
const pwCancelBtn = document.getElementById("btn_pw_cancel");
const pwField = document.getElementById("password");
const pwConfirmField = document.getElementById("password_confirm");
const pw_msg = document.getElementById("pw_check_msg");

pwEditBtn.addEventListener("click", () => {
  pwField.style.display = "inline-block";
  pwConfirmField.style.display = "inline-block";
  pw_msg.style.display = "block";
  pwSaveBtn.style.display = "inline-block";
  pwCancelBtn.style.display = "inline-block";
  pwEditBtn.style.display = "none";
  pwField.removeAttribute("readonly");
  pwConfirmField.removeAttribute("readonly");
  pwField.value = "";
  pwConfirmField.value = "";
  pw_msg.textContent = "";
});

pwCancelBtn.addEventListener("click", () => {
  pwField.style.display = "none";
  pwConfirmField.style.display = "none";
  pw_msg.style.display = "none";
  pwSaveBtn.style.display = "none";
  pwCancelBtn.style.display = "none";
  pwEditBtn.style.display = "inline-block";
  pwField.value = "";
  pwConfirmField.value = "";
  pwField.setAttribute("readonly", true);
  pwConfirmField.setAttribute("readonly", true);
  pw_msg.textContent = "";
});

const token = localStorage.getItem("token"); // 저장된 JWT 토큰 가져오기
const token_exp = localStorage.getItem("token_exp"); // 저장된 EXP 토큰 가져오기

function check_password_match() {
  const pw = pwField.value;
  const pw_confirm = pwConfirmField.value;
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

pwField.addEventListener("input", check_password_match);
pwConfirmField.addEventListener("input", check_password_match);

pwSaveBtn.addEventListener("click", async () => {
  if (!pwField.value || !pwConfirmField.value) {
    window.showCustomAlert("비밀번호를 모두 입력해주세요.");
    return;
  }
  if (pwField.value !== pwConfirmField.value) {
    window.showCustomAlert("비밀번호가 일치하지 않습니다.");
    return;
  }
  // PATCH 요청
  try {
    let res = null;
    if (token_exp !== null) {
      console.log("임시 비번 변경 시도");
      res = await fetch("/auth/change-pw", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token_exp}`,
        },
        body: JSON.stringify({ password: pwField.value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (!data.token) throw new Error("토큰이 반환되지 않았습니다.");
      localStorage.setItem("token", data.token);
      localStorage.removeItem("token_exp");
      window.showCustomAlert("비밀번호가 성공적으로 변경되었습니다.");
      console.log(token);
      window.location.href = "/home.html";
    } else if (token !== null) {
      res = await fetch("/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: pwField.value }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      window.showCustomAlert("비밀번호가 성공적으로 변경되었습니다.");
      // UI 원상복구
      pwField.style.display = "none";
      pwConfirmField.style.display = "none";
      pw_msg.style.display = "none";
      pwSaveBtn.style.display = "none";
      pwCancelBtn.style.display = "none";
      pwEditBtn.style.display = "inline-block";
      pwField.value = "";
      pwConfirmField.value = "";
      pwField.setAttribute("readonly", true);
      pwConfirmField.setAttribute("readonly", true);
      pw_msg.textContent = "";
    }
  } catch (err) {
    window.showCustomAlert("비밀번호 변경 실패: " + err.message);
  }
});
