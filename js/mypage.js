//마이페이지 버튼 활성화
const go_mypage = document.querySelector(".btn_mypage");
go_mypage.addEventListener("click", function () {
  window.location.href = "/mypage.html";
});

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
    view_hp.value = data.hp;
    view_email.value = data.email;

    // 선호조사 정보 표시
    if (data.favorite) {
      // genre: value(숫자) 배열 → 한글명으로 변환해서 표시
      const genreArr = (data.favorite.gerne || []);
      document.getElementById("genre_buttons").value = genreArr.map(v => GENRE_LABELS[v] || v).join(", ");
      document.getElementById("fav_actor").value = (data.favorite.actor || []).map(a => a.name).join(", ");
      document.getElementById("fav_director").value = (data.favorite.director || []).map(d => d.name).join(", ");
    } else {
      // 선호조사 정보가 없을 때: 장르 input은 readonly 유지, 저장 버튼 클릭 시 모달 오픈
      document.getElementById("genre_buttons").setAttribute("readonly", true);
      document.querySelector(".btn_prefs_edit").textContent = "선택";
      document.querySelector(".btn_prefs_edit").onclick = async () => {
        document.getElementById("genre_preferences_modal").classList.add("open");
        const genreVal = document.getElementById("genre_buttons").value.split(",").map(v => v.trim()).filter(v => v);
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
          alert("선호 장르가 저장되었습니다.");
          document.getElementById("genre_preferences_modal").classList.remove("open");
        } catch (err) {
          alert("저장 실패: " + err.message);
        }
      };
      // 배우/감독 입력만 활성화
      document.getElementById("fav_actor").removeAttribute("readonly");
      document.getElementById("fav_director").removeAttribute("readonly");
      document.querySelectorAll(".btn_add").forEach(btn => btn.textContent = "저장");
      // 배우/감독 저장 버튼
      async function savePeople(inputId, key) {
        const names = document.getElementById(inputId).value.split(",").map(v => v.trim()).filter(v => v);
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
          alert("저장되었습니다.");
        } catch (err) {
          alert("저장 실패: " + err.message);
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
        let patchBody = { [field_id]: updated_value };
        if (field_id === "hp") {
          patchBody = { hp: updated_value };
        }
        fetch("/auth/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(patchBody),
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

  // 4) "예" 클릭 → 탈퇴 API 호출 → 인덱스로 리다이렉트
  btnConfirm.addEventListener("click", async () => {
    try {
      const res = await fetch("/auth/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
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
          const res = await fetch(`/movie/search_person?query=${encodeURIComponent(name)}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            // 동명이인 모두 저장
            data.results.forEach(person => {
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
        alert("수정에 성공했습니다.");
      } catch (err) {
        alert("수정 실패: " + err.message);
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
    alert("최소 한 개 이상 선택해주세요.");
    return;
  }

  // POST/PATCH 분기: favorite이 있으면 PATCH, 없으면 POST
  const token = localStorage.getItem("token");
  let hasFavorite = false;
  try {
    // 현재 favorite 존재 여부를 서버에서 다시 확인
    const resMe = await fetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await resMe.json();
    hasFavorite = !!(meData.favorite);
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
    alert("선호 장르가 저장되었습니다.");
    document.getElementById("genre_preferences_modal").classList.remove("open");
    // input에도 한글명으로 반영
    document.getElementById("genre_buttons").value = selectedGenres.map(v => GENRE_LABELS[v] || v).join(", ");
  } catch (err) {
    alert("저장 실패: " + err.message);
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
    alert("비밀번호를 모두 입력해주세요.");
    return;
  }
  if (pwField.value !== pwConfirmField.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }
  // PATCH 요청
  try {
    const res = await fetch("/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ password: pwField.value }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    alert("비밀번호가 성공적으로 변경되었습니다.");
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
  } catch (err) {
    alert("비밀번호 변경 실패: " + err.message);
  }
});
