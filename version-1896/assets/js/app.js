(function () {
  var rootPrefix = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].getAttribute('src') || '';
      var marker = 'assets/js/app.js';
      var index = src.indexOf(marker);
      if (index >= 0) {
        return src.slice(0, index);
      }
    }
    return '';
  })();

  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardMatches(card, state) {
    var haystack = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' '));
    if (state.keyword && haystack.indexOf(state.keyword) === -1) {
      return false;
    }
    if (state.region && card.getAttribute('data-region') !== state.region) {
      return false;
    }
    if (state.type && card.getAttribute('data-type') !== state.type) {
      return false;
    }
    if (state.year && card.getAttribute('data-year') !== state.year) {
      return false;
    }
    return true;
  }

  function initHeader() {
    var searchToggle = qs('[data-search-toggle]');
    var searchPanel = qs('[data-header-search]');
    var menuToggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        searchPanel.classList.toggle('is-open');
        var input = qs('input', searchPanel);
        if (searchPanel.classList.contains('is-open') && input) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var thumbs = qsa('[data-hero-thumb]', slider);
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = parseInt(thumb.getAttribute('data-hero-thumb'), 10);
        show(index || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var list = qs('[data-filter-list]', scope);
      if (!list) {
        return;
      }

      var keyword = qs('[data-filter-keyword]', panel);
      var region = qs('[data-filter-region]', panel);
      var type = qs('[data-filter-type]', panel);
      var year = qs('[data-filter-year]', panel);
      var sort = qs('[data-filter-sort]', panel);
      var originalCards = qsa('[data-card]', list);

      function apply() {
        var state = {
          keyword: normalize(keyword && keyword.value),
          region: region && region.value,
          type: type && type.value,
          year: year && year.value
        };
        var cards = originalCards.slice();
        var mode = sort && sort.value;

        if (mode === 'views') {
          cards.sort(function (a, b) {
            return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
          });
        }

        if (mode === 'rating') {
          cards.sort(function (a, b) {
            return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
          });
        }

        if (mode === 'year') {
          cards.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
        }

        cards.forEach(function (card) {
          list.appendChild(card);
          card.classList.toggle('is-hidden', !cardMatches(card, state));
        });
      }

      [keyword, region, type, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + rootPrefix + escapeAttr(movie.url) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + rootPrefix + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
      '      <div class="poster-shade"></div>',
      '      <span class="card-badge">' + escapeHtml(movie.region) + '</span>',
      '      <span class="card-score">' + escapeHtml(movie.rating) + '</span>',
      '      <span class="card-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '      <div class="movie-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '        <span>' + escapeHtml(movie.duration) + '</span>',
      '      </div>',
      '      <div class="tag-line">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function initSearchPage() {
    var form = qs('[data-search-page-form]');
    var input = qs('[data-search-page-input]');
    var results = qs('[data-search-results]');
    if (!form || !input || !results || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var q = normalize(query);
      var list = window.MOVIE_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.regionRaw,
          movie.type,
          movie.typeRaw,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !q || text.indexOf(q) >= 0;
      }).slice(0, 120);

      if (!list.length) {
        results.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
        return;
      }

      results.innerHTML = list.map(movieCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initial);
  }

  function setupVideo(shell) {
    var video = qs('video', shell);
    var button = qs('[data-player-start]', shell);
    var url = shell.getAttribute('data-video-url');
    var loaded = false;

    function load() {
      if (!video || !url || loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      shell.classList.add('is-playing');
      var promise = video && video.play ? video.play() : null;
      if (promise && promise.catch) {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    }
  }

  function initPlayers() {
    qsa('[data-player]').forEach(setupVideo);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
