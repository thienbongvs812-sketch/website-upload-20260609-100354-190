(function () {
  function playVideo(video, overlay) {
    overlay.classList.add('is-hidden');
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  function attachStream(video, stream, overlay) {
    if (video.getAttribute('data-ready') === 'yes') {
      playVideo(video, overlay);
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.load();
      video.setAttribute('data-ready', 'yes');
      playVideo(video, overlay);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(stream);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video, overlay);
      });
      video.setAttribute('data-ready', 'yes');
      playVideo(video, overlay);
      return;
    }

    video.src = stream;
    video.load();
    video.setAttribute('data-ready', 'yes');
    playVideo(video, overlay);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var wrappers = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    wrappers.forEach(function (wrapper) {
      var video = wrapper.querySelector('video');
      var overlay = wrapper.querySelector('.play-overlay');
      if (!video || !overlay) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      var start = function () {
        if (stream) {
          attachStream(video, stream, overlay);
        }
      };

      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!video.getAttribute('data-ready')) {
          start();
        }
      });
    });
  });
})();
