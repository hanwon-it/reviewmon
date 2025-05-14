// 약관 팝업 오픈/닫기 처리
const termsOverlay = document.getElementById("terms_overlay");
const termsTitle = document.getElementById("terms_title");

document.getElementById("open_terms").onclick = () => {
  termsOverlay.style.display = "block";
  termsTitle.textContent = "이용약관";
};
document.getElementById("open_privacy").onclick = () => {
  termsOverlay.style.display = "block";
  termsTitle.textContent = "개인정보처리방침";
};
document.getElementById("terms_close").onclick = () => {
  termsOverlay.style.display = "none";
};
