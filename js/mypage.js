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

    // 선호조사 정보 표시
    if (data.favorite) {
      // genre: value(숫자) 배열 → 한글명으로 변환해서 표시
      const genreArr = data.favorite.genre || [];
      document.getElementById("genre_buttons").value = genreArr
        .map((v) => GENRE_LABELS[v] || v)
        .join(", ");
      document.getElementById("fav_actor").value = (data.favorite.actor || [])
        .map((a) => a.name)
        .join(", ");
      document.getElementById("fav_director").value = (
        data.favorite.director || []
      )
        .map((d) => d.name)
        .join(", ");
    } else {
      // 선호조사 정보가 없을 때: 장르 input은 readonly 유지, 저장 버튼 클릭 시 모달 오픈
      document.getElementById("genre_buttons").setAttribute("readonly", true);
      document.querySelector(".btn_prefs_edit").textContent = "선택";
      document.querySelector(".btn_prefs_edit").onclick = async () => {
        document
          .getElementById("genre_preferences_modal")
          .classList.add("open");
        const genreVal = document
          .getElementById("genre_buttons")
          .value.split(",")
          .map((v) => v.trim())
          .filter((v) => v);
        try {
          const method = data.favorite ? "PATCH" : "POST";
          const res = await fetch("/auth/favorite", {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ genre: genreVal }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          window.showCustomAlert("선호 장르가 저장되었습니다.");
          document
            .getElementById("genre_preferences_modal")
            .classList.remove("open");
        } catch (err) {
          window.showCustomAlert("저장 실패: " + err.message);
        }
      };
      // 배우/감독 입력만 활성화
      document.getElementById("fav_actor").removeAttribute("readonly");
      document.getElementById("fav_director").removeAttribute("readonly");
      document
        .querySelectorAll(".btn_add")
        .forEach((btn) => (btn.textContent = "저장"));
      // 배우/감독 저장 버튼
      async function savePeople(inputId, key) {
        const names = document
          .getElementById(inputId)
          .value.split(",")
          .map((v) => v.trim())
          .filter((v) => v);
        const arr = [];
        for (const name of names) {
          try {
            const res = await fetch(
              `/movie/search_person?query=${encodeURIComponent(name)}`
            );
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              data.results.forEach((person) => {
                arr.push({ id: person.id, name: person.name });
              });
            } else {
              arr.push({ id: null, name });
            }
          } catch {
            arr.push({ id: null, name });
          }
        }
        try {
          const method = data.favorite ? "PATCH" : "POST";
          const res = await fetch("/auth/favorite", {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ [key]: arr }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message);
          window.showCustomAlert("저장되었습니다.");
        } catch (err) {
          window.showCustomAlert("저장 실패: " + err.message);
        }
      }
      document.querySelectorAll(".btn_add").forEach((btn, idx) => {
        btn.onclick = () => {
          if (idx === 0) savePeople("fav_actor", "actor");
          else savePeople("fav_director", "director");
        };
      });
    }
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

// 배우/감독 수정 기능
function setupFavoriteEdit(fieldId, btnClass, key) {
  const input = document.getElementById(fieldId);
  const btn = input.nextElementSibling;
  btn.addEventListener("click", async () => {
    if (input.hasAttribute("readonly")) {
      input.removeAttribute("readonly");
      input.focus();
      btn.textContent = "저장";
    } else {
      // 저장
      input.setAttribute("readonly", true);
      btn.textContent = "수정";
      const valueArr = input.value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      // 이름 → TMDB id+name 객체 배열로 변환
      const resultArr = [];
      for (const name of valueArr) {
        try {
          const res = await fetch(
            `/movie/search_person?query=${encodeURIComponent(name)}`
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            // 동명이인 모두 저장
            data.results.forEach((person) => {
              resultArr.push({ id: person.id, name: person.name });
            });
          } else {
            // TMDB에 없으면 입력값(이름)만 저장 (id: null)
            resultArr.push({ id: null, name });
          }
        } catch (err) {
          // 검색 실패 시 입력값(이름)만 저장 (id: null)
          resultArr.push({ id: null, name });
        }
      }
      try {
        const res = await fetch("/auth/favorite", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ [key]: resultArr }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        window.showCustomAlert("수정에 성공했습니다.");
      } catch (err) {
        window.showCustomAlert("수정 실패: " + err.message);
      }
    }
  });
}
setupFavoriteEdit("fav_actor", "btn_add", "actor");
setupFavoriteEdit("fav_director", "btn_add", "director");

// 장르 선택 모달 저장 버튼 클릭
const genreConfirmBtn = document.getElementById("genre_preferences_confirm");
genreConfirmBtn.addEventListener("click", async () => {
  const selectedGenres = Array.from(
    document.querySelectorAll(".genre-toggle.selected")
  ).map((btn) => btn.dataset.genre);

  if (selectedGenres.length === 0) {
    window.showCustomAlert("최소 한 개 이상 선택해주세요.");
    return;
  }

  // POST/PATCH 분기: favorite이 있으면 PATCH, 없으면 POST
  const token = localStorage.getItem("token");
  let hasFavorite = false;
  try {
    // 현재 favorite 존재 여부를 서버에서 다시 확인
    const resMe = await fetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await resMe.json();
    hasFavorite = !!meData.favorite;
  } catch {}

  try {
    const method = hasFavorite ? "PATCH" : "POST";
    const res = await fetch("/auth/favorite", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ genre: selectedGenres }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    window.showCustomAlert("선호 장르가 저장되었습니다.");
    document.getElementById("genre_preferences_modal").classList.remove("open");
    // input에도 한글명으로 반영
    document.getElementById("genre_buttons").value = selectedGenres
      .map((v) => GENRE_LABELS[v] || v)
      .join(", ");
  } catch (err) {
    window.showCustomAlert("저장 실패: " + err.message);
  }
});

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
