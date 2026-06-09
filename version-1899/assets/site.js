(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyCardFilter(scope) {
    var queryInput = scope.querySelector(".page-search-input");
    var query = normalize(queryInput ? queryInput.value : "");
    var activeChip = scope.querySelector(".filter-chip.is-active");
    var activeValue = activeChip ? activeChip.getAttribute("data-filter-value") : "all";
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var searchable = normalize(card.getAttribute("data-search"));
      var type = card.getAttribute("data-type") || "";
      var matchQuery = !query || searchable.indexOf(query) !== -1;
      var matchType = activeValue === "all" || type === activeValue;
      var show = matchQuery && matchType;
      card.style.display = show ? "" : "none";
      if (show) {
        visibleCount += 1;
      }
    });

    var empty = scope.querySelector(".empty-state");
    if (empty) {
      empty.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  function initFilters() {
    document.querySelectorAll(".search-scope").forEach(function (scope) {
      var input = scope.querySelector(".page-search-input");
      if (input) {
        input.addEventListener("input", function () {
          applyCardFilter(scope);
        });
      }

      scope.querySelectorAll(".filter-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          scope.querySelectorAll(".filter-chip").forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyCardFilter(scope);
        });
      });

      applyCardFilter(scope);
    });
  }

  function initQueryInput() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (!q) {
      return;
    }
    document.querySelectorAll(".auto-query").forEach(function (input) {
      input.value = q;
      var scope = input.closest(".search-scope");
      if (scope) {
        applyCardFilter(scope);
      }
    });
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".site-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
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

    restart();
  }

  window.setupMoviePlayer = function (url, videoId, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !button || !url) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initQueryInput();
  });
}());
