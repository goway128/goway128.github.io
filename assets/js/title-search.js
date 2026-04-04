(function () {
  "use strict";

  let searchData = null;
  const input = document.getElementById("nav-search-input");
  const resultsContainer = document.getElementById("nav-search-results");
  const searchBtn = document.getElementById("nav-search-btn");

  if (!input || !resultsContainer) return;

  // 加载搜索索引
  function loadSearchData() {
    if (searchData) return Promise.resolve(searchData);
    return fetch("/search.json")
      .then((res) => res.json())
      .then((data) => {
        searchData = data;
        return data;
      })
      .catch((err) => {
        console.error("搜索索引加载失败:", err);
        return [];
      });
  }

  // 高亮匹配文字
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(
      "(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
      "gi"
    );
    return text.replace(regex, "<mark>$1</mark>");
  }

  // 执行搜索
  function doSearch(query) {
    query = query.trim().toLowerCase();

    if (query.length === 0) {
      resultsContainer.classList.remove("active");
      resultsContainer.innerHTML = "";
      return;
    }

    loadSearchData().then((data) => {
      // 按标题匹配
      const results = data.filter((item) =>
        item.title.toLowerCase().includes(query)
      );

      if (results.length === 0) {
        resultsContainer.innerHTML =
          '<div class="search-no-result">没有找到匹配的文章 😕</div>';
      } else {
        resultsContainer.innerHTML = results
          .slice(0, 10) // 最多显示10条
          .map(
            (item) => `
            <a href="${item.url}" class="search-result-item">
              <div class="result-title">${highlightMatch(item.title, query)}</div>
              <div class="result-date">${item.date || ""}</div>
            </a>
          `
          )
          .join("");
      }

      resultsContainer.classList.add("active");
    });
  }

  // 防抖
  let debounceTimer;
  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doSearch(this.value);
    }, 250);
  });

  // 回车搜索
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(debounceTimer);
      doSearch(this.value);
    }
  });

  // 搜索按钮点击
  if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doSearch(input.value);
    });
  }

  // 点击外部关闭搜索结果
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-search-wrapper")) {
      resultsContainer.classList.remove("active");
    }
  });

  // ESC 关闭
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      resultsContainer.classList.remove("active");
      input.blur();
    }
  });
})();
