const mobileButton = document.querySelector('[data-mobile-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (mobileButton && mobileMenu) {
  mobileButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5600);
  }
}

const searchInput = document.querySelector('[data-search-input]');
const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

if (searchInput && cards.length) {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get('q');

  if (preset) {
    searchInput.value = preset;
  }

  const applySearch = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = card.dataset.search || card.textContent.toLowerCase();
      card.classList.toggle('is-hidden', Boolean(keyword) && !haystack.includes(keyword));
    });
  };

  searchInput.addEventListener('input', applySearch);
  applySearch();
}

const homeSearch = document.querySelector('[data-home-search]');

if (homeSearch) {
  homeSearch.addEventListener('submit', (event) => {
    const input = homeSearch.querySelector('input[name="q"]');
    if (!input || !input.value.trim()) {
      event.preventDefault();
      window.location.href = homeSearch.getAttribute('action') || 'movies.html';
    }
  });
}

const setupPlayer = async () => {
  const video = document.querySelector('#movie-player');

  if (!video) {
    return;
  }

  const source = video.querySelector('source');
  const url = source ? source.src : '';

  if (!url) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    const Hls = window.Hls;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  const button = document.querySelector('[data-play-button]');

  if (button) {
    button.addEventListener('click', async () => {
      button.classList.add('is-hidden');
      try {
        await video.play();
      } catch (error) {
        button.classList.remove('is-hidden');
      }
    });

    video.addEventListener('play', () => {
      button.classList.add('is-hidden');
    });

    video.addEventListener('ended', () => {
      button.classList.remove('is-hidden');
    });
  }
};

setupPlayer();
