(function () {
  function attachPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".player-overlay");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-src");
    var attached = false;
    var hls = null;

    function setup() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      setup();
      box.classList.add("playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          box.classList.remove("playing");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      box.classList.add("playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        box.classList.remove("playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(attachPlayer);
})();
