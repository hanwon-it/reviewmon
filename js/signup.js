// 비밀번호 일치 확인
const pw = document.getElementById('password');
const pwConfirm = document.getElementById('password_confirm');
const pwMsg = document.getElementById('pw_check_msg');

if (pw && pwConfirm && pwMsg) {
  function checkPwMatch() {
    if (!pw.value || !pwConfirm.value) {
      pwMsg.textContent = '';
      return;
    }
    if (pw.value === pwConfirm.value) {
      pwMsg.textContent = '비밀번호가 일치합니다.';
      pwMsg.style.color = '#00b894';
    } else {
      pwMsg.textContent = '비밀번호가 일치하지 않습니다.';
      pwMsg.style.color = '#ff7675';
    }
  }
  pw.addEventListener('input', checkPwMatch);
  pwConfirm.addEventListener('input', checkPwMatch);
}

// 약관 오버레이 열기/닫기
const termsOverlay = document.getElementById('terms_overlay');
const termsClose = document.getElementById('terms_close');
const linkTerms = document.querySelector('.link_terms');

if (linkTerms && termsOverlay) {
  linkTerms.onclick = (e) => {
    e.preventDefault();
    termsOverlay.style.display = 'flex';
  };
}
if (termsClose && termsOverlay) {
  termsClose.onclick = () => {
    termsOverlay.style.display = 'none';
  };
} 