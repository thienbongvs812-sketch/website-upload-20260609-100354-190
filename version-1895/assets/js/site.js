(function () {
  var hlsPromise = null;

  function all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function openSearchPage(value) {
    var query = String(value || '').trim();
    if (query) {
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    } else {
      window.location.href = './search.html';
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initSearchForms() {
    all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        openSearchPage(input ? input.value : '');
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  function initGridFilters() {
    all('[data-card-grid]').forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var input = section.querySelector('[data-grid-search]');
      var chips = all('[data-filter-chip]', section);
      var empty = section.querySelector('[data-grid-empty]');
      var activeFilter = '全部';
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        all('[data-search-card]', grid).forEach(function (card) {
          var text = (card.getAttribute('data-search-text') || '').toLowerCase();
          var okQuery = !query || text.indexOf(query) !== -1;
          var okFilter = activeFilter === '全部' || text.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = okQuery && okFilter;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeFilter = chip.getAttribute('data-filter-chip') || '全部';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  window.initMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var ready = false;
    var hls = null;

    function bindSource() {
      if (ready) {
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          ready = true;
        } else {
          video.src = source;
          ready = true;
        }
      });
    }

    function start() {
      button.classList.add('is-hidden');
      bindSource().then(function () {
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }).catch(function () {
        video.src = source;
        ready = true;
        var fallback = video.play();
        if (fallback && fallback.catch) {
          fallback.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="card-cover" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
      '<span class="card-play">▶</span></a>' +
      '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initGlobalSearch() {
    var input = document.getElementById('global-search-input');
    var button = document.getElementById('global-search-button');
    var results = document.getElementById('search-results');
    var empty = document.getElementById('search-empty');
    if (!input || !button || !results || !empty || !window.SEARCH_INDEX) {
      return;
    }
    function render() {
      var query = input.value.trim().toLowerCase();
      var list = window.SEARCH_INDEX;
      if (query) {
        list = list.filter(function (item) {
          return item.text.indexOf(query) !== -1;
        });
      }
      list = list.slice(0, 80);
      results.innerHTML = list.map(cardHtml).join('');
      empty.classList.toggle('is-visible', list.length === 0);
      if (list.length > 0) {
        empty.classList.remove('is-visible');
      }
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    button.addEventListener('click', render);
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        render();
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSearchForms();
    initHero();
    initGridFilters();
    initGlobalSearch();
  });
})();
