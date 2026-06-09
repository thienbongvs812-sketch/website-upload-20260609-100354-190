(function () {
    function initMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        if (!video || !overlay || !options.source) {
            return;
        }
        var hlsInstance = null;
        var started = false;
        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }
        function start() {
            overlay.classList.add('is-hidden');
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = options.source;
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(options.source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }
            video.src = options.source;
            video.load();
            playVideo();
        }
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
    window.initMoviePlayer = initMoviePlayer;
})();
