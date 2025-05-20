// 모든 페이지에서 로그아웃 버튼(.btn_logout) 클릭 시 로그아웃 처리

document.addEventListener("DOMContentLoaded", () => {
  // const logoutBtn = document.querySelector(".btn_logout");
  // if (logoutBtn) {
  //   logoutBtn.addEventListener("click", () => {
  //     localStorage.removeItem("token");
  //     localStorage.removeItem("userid");
  //     window.location.href = "/index.html";
  //   });
  // }

  // 로고 클릭 시 home.html로 이동 (공통)
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      
      window.location.href = '/home.html';
    });
  }

  // searchInput 관련 코드가 있다면 아래와 같이 수정
  if (typeof searchInput !== 'undefined' && searchInput) {
    // searchInput 관련 코드 실행
  }
}); 

