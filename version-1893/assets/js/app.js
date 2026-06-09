(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var navToggle = document.getElementById("navToggle");
        if (navToggle) {
            navToggle.addEventListener("click", function () {
                document.body.classList.toggle("nav-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var heroIndex = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            heroIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === heroIndex);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === heroIndex);
            });
        }

        if (slides.length > 1) {
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(heroIndex - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(heroIndex + 1);
                });
            }
            window.setInterval(function () {
                showSlide(heroIndex + 1);
            }, 5200);
        }

        var searchInput = document.getElementById("siteSearch");
        var typeFilter = document.getElementById("typeFilter");
        var yearFilter = document.getElementById("yearFilter");
        var resetButton = document.getElementById("resetFilters");
        var emptyState = document.getElementById("filterEmpty");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        function filterCards() {
            if (!cards.length) {
                return;
            }
            var query = normalize(searchInput ? searchInput.value : "");
            var type = normalize(typeFilter ? typeFilter.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");
            var visibleCount = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchesQuery = !query || searchText.indexOf(query) !== -1;
                var matchesType = !type || cardType === type;
                var matchesYear = !year || cardYear === year;
                var visible = matchesQuery && matchesType && matchesYear;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterCards);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", filterCards);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", filterCards);
        }
        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (typeFilter) {
                    typeFilter.value = "";
                }
                if (yearFilter) {
                    yearFilter.value = "";
                }
                filterCards();
            });
        }
    });
})();
