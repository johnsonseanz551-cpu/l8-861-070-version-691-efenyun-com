function createPlayer(videoId, layerId, source) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hls = null;
    var started = false;

    if (!video || !layer || !source) {
        return;
    }

    function begin() {
        if (!started) {
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        layer.classList.add("is-hidden");
        video.controls = true;

        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                video.controls = true;
            });
        }
    }

    layer.addEventListener("click", begin);

    video.addEventListener("click", function () {
        if (video.paused) {
            begin();
        }
    });

    video.addEventListener("play", function () {
        layer.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
