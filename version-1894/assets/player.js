function initMoviePlayer(videoId, maskId, streamUrl) {
  var video = document.getElementById(videoId);
  var mask = document.getElementById(maskId);
  var hlsInstance = null;
  var ready = false;

  function bindStream() {
    if (ready || !video || !streamUrl) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    bindStream();

    if (mask) {
      mask.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (!video) {
    return;
  }

  if (mask) {
    mask.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (mask) {
      mask.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (mask) {
      mask.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
