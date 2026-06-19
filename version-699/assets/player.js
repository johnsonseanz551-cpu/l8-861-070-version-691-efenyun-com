(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var stream = video ? video.getAttribute("data-stream") : "";
      var started = false;
      var hlsInstance = null;

      if (!video || !stream || !overlay) {
        return;
      }

      function attachStream() {
        if (started) {
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        box.classList.add("is-playing");
        video.play().catch(function () {
          box.classList.remove("is-playing");
          started = false;
        });
      }

      overlay.addEventListener("click", attachStream);

      video.addEventListener("click", function () {
        if (!started) {
          attachStream();
        }
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
