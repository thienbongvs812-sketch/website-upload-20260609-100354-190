(function () {
    function attachSource(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== source) {
                video.src = source;
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
        }
    }

    window.initMoviePlayer = function (settings) {
        var video = document.getElementById(settings.videoId);
        var button = document.getElementById(settings.buttonId);
        var source = settings.source;

        if (!video || !button || !source) {
            return;
        }

        function start() {
            attachSource(video, source);
            button.classList.add("is-hidden");
            video.controls = true;
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    video.controls = true;
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
}());
