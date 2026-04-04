(function () {
  var searchInput = document.getElementById('custom-search-input');
  var searchResults = document.getElementById('custom-search-results');
  var posts = [];

  if (!searchInput) return;

  // 加载搜索索引
  fetch('/search.json')
    .then(function (res) { return res.json(); })
    .then(function (data) { posts = data; })
    .catch(function (err) { console.error('搜索索引加载失败', err); });

  // 实时搜索
  searchInput.addEventListener('input', function () {
    var query = this.value.trim().toLowerCase();
    searchResults.innerHTML = '';

    if (query.length < 1) {
      searchResults.style.display = 'none';
      return;
    }

    var matched = posts.filter(function (post) {
      return post.title.toLowerCase().indexOf(query) !== -1;
    });

    if (matched.length === 0) {
      searchResults.innerHTML = '<div class="no-results">没有找到相关文章 😕</div>';
    } else {
      matched.slice(0, 8).forEach(function (post) {
        var a = document.createElement('a');
        a.href = post.url;

        // 高亮关键词
        var title = post.title;
        var reg = new RegExp('(' + escapeRegex(query) + ')', 'gi');
        a.innerHTML = title.replace(reg, '<mark>$1</mark>');

        searchResults.appendChild(a);
      });
    }

    searchResults.style.display = 'block';
  });

  // 转义正则特殊字符
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 按 ESC 关闭
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchResults.style.display = 'none';
      searchInput.value = '';
    }
  });

  // 点击外部关闭
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-search-wrapper')) {
      searchResults.style.display = 'none';
    }
  });
})();

