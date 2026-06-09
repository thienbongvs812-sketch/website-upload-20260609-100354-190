(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var toggle = $('[data-mobile-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slider = $('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = $all('[data-hero-slide]', slider);
        var dots = $all('[data-hero-dot]', slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        $all('[data-movie-filter]').forEach(function (form) {
            var scope = form.getAttribute('data-scope');
            var grid = scope ? document.getElementById(scope) : $('[data-movie-grid]');
            if (!grid) {
                return;
            }
            var cards = $all('[data-movie-card]', grid);
            var query = $('[data-filter-query]', form);
            var region = $('[data-filter-region]', form);
            var type = $('[data-filter-type]', form);
            var channel = $('[data-filter-channel]', form);
            var sort = $('[data-filter-sort]', form);
            function apply() {
                var q = normalizeText(query && query.value);
                var rv = region ? region.value : 'all';
                var tv = type ? type.value : 'all';
                var cv = channel ? channel.value : 'all';
                cards.forEach(function (card) {
                    var text = normalizeText(card.textContent + ' ' + card.getAttribute('data-title'));
                    var okQuery = !q || text.indexOf(q) !== -1;
                    var okRegion = rv === 'all' || card.getAttribute('data-region') === rv;
                    var okType = tv === 'all' || card.getAttribute('data-type') === tv;
                    var okChannel = cv === 'all' || card.getAttribute('data-channel') === cv;
                    card.classList.toggle('hidden-by-filter', !(okQuery && okRegion && okType && okChannel));
                });
                if (sort) {
                    var mode = sort.value;
                    var sorted = cards.slice().sort(function (a, b) {
                        if (mode === 'rating') {
                            return parseFloat(b.getAttribute('data-rating') || 0) - parseFloat(a.getAttribute('data-rating') || 0);
                        }
                        if (mode === 'year') {
                            return parseInt(b.getAttribute('data-year') || 0, 10) - parseInt(a.getAttribute('data-year') || 0, 10);
                        }
                        if (mode === 'title') {
                            return normalizeText(a.getAttribute('data-title')).localeCompare(normalizeText(b.getAttribute('data-title')), 'zh-CN');
                        }
                        return 0;
                    });
                    sorted.forEach(function (card) {
                        grid.appendChild(card);
                    });
                    cards = sorted;
                }
            }
            ['input', 'change'].forEach(function (eventName) {
                form.addEventListener(eventName, apply);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initFilters();
    });
})();
