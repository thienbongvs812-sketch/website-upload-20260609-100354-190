(function () {
  var started = false;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    var button = qs("[data-mobile-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa("[data-hero-slide]", slider);
    var dots = qsa("[data-hero-dot]", slider);
    var prev = qs("[data-hero-prev]", slider);
    var next = qs("[data-hero-next]", slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initGlobalSearch() {
    var form = qs("[data-global-search-form]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = qs("input", form);
      var value = input ? input.value.trim() : "";
      var target = "search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  }

  function initFilters() {
    var input = qs("[data-filter-input]");
    var region = qs("[data-filter-region]");
    var type = qs("[data-filter-type]");
    var category = qs("[data-filter-category]");
    var cards = qsa(".movie-card, .rank-item");
    var empty = qs("[data-empty-state]");
    if (!input && !region && !type && !category) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function matches(card) {
      var search = normalize(input ? input.value : "");
      var byRegion = normalize(region ? region.value : "");
      var byType = normalize(type ? type.value : "");
      var byCategory = normalize(category ? category.value : "");
      var title = normalize(card.getAttribute("data-title"));
      var cRegion = normalize(card.getAttribute("data-region"));
      var cType = normalize(card.getAttribute("data-type"));
      var cGenre = normalize(card.getAttribute("data-genre"));
      var cYear = normalize(card.getAttribute("data-year"));
      var cCategory = normalize(card.getAttribute("data-category"));
      var haystack = [title, cRegion, cType, cGenre, cYear, cCategory].join(" ");
      return (!search || haystack.indexOf(search) !== -1)
        && (!byRegion || cRegion.indexOf(byRegion) !== -1)
        && (!byType || cType.indexOf(byType) !== -1)
        && (!byCategory || cCategory.indexOf(byCategory) !== -1);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, region, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayer(options) {
    var video = qs("#movieVideo");
    var overlay = qs("#playOverlay");
    if (!video || !overlay || !options || !options.source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = options.source;
      }
    }

    function play() {
      overlay.classList.add("is-hidden");
      load();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          var retry = function () {
            video.play().catch(function () {
              overlay.classList.remove("is-hidden");
            });
          };
          video.addEventListener("canplay", retry, { once: true });
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
  }

  function init() {
    if (started) {
      return;
    }
    started = true;
    initMobileNav();
    initHero();
    initGlobalSearch();
    initFilters();
  }

  window.SiteApp = {
    init: init,
    setupPlayer: setupPlayer
  };
})();
