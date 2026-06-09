(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
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

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
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
        });

        document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var clearButton = panel.querySelector("[data-search-clear]");
            var scope = panel.closest("section") || document;
            var list = scope.querySelector("[data-card-list]") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
            if (!input || !cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
            }

            function filterCards() {
                var value = (input.value || "").trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-hidden-by-search", value && text.indexOf(value) === -1);
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }
            if (clearButton && input) {
                clearButton.addEventListener("click", function () {
                    input.value = "";
                    filterCards();
                    input.focus();
                });
            }
        });
    });
}());
