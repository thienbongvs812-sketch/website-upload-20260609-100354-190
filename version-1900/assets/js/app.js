(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-page-search]'));
  var filterPanel = document.querySelector('[data-filter-panel]');
  var emptyState = document.querySelector('[data-empty-state]');
  var filters = {};
  var query = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardMatches(card) {
    var text = normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-tags')
    ].join(' '));

    if (query && text.indexOf(query) === -1) {
      return false;
    }

    return Object.keys(filters).every(function (key) {
      var value = filters[key];
      if (!value || value === 'all') {
        return true;
      }
      return normalize(card.getAttribute('data-' + key)) === normalize(value);
    });
  }

  function updateCards() {
    if (!cards.length) {
      return;
    }

    var visibleCount = 0;
    cards.forEach(function (card) {
      var matched = cardMatches(card);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      query = normalize(input.value);
      searchInputs.forEach(function (otherInput) {
        if (otherInput !== input) {
          otherInput.value = input.value;
        }
      });
      updateCards();
    });
  });

  if (filterPanel) {
    filterPanel.addEventListener('click', function (event) {
      var button = event.target.closest('[data-filter-key]');
      if (!button) {
        return;
      }

      var key = button.getAttribute('data-filter-key');
      var value = button.getAttribute('data-filter-value');
      filters[key] = value;

      Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-key="' + key + '"]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      updateCards();
    });
  }
})();
