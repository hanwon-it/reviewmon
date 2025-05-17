// 돋보기 버튼 활성화 js
document.addEventListener("DOMContentLoaded", () => {
  const search_button = document.getElementById("search_btn");
  const keyword_input = document.getElementById("search_input");
  const category_select = document.getElementById("search_category");

  if (!search_button || !keyword_input || !category_select) {
    // 이 페이지에 검색 바가 없는 경우
    return;
  }

  search_button.addEventListener("click", () => {
    const keyword = keyword_input.value.trim();
    const category = category_select.value;

    if (!keyword) {
      alert("검색어를 입력하세요.");
      return;
    }

    window.location.href = `/search.html?category=${category}&keyword=${encodeURIComponent(
      keyword
    )}`;
  });
});
