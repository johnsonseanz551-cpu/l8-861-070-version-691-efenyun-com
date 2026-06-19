import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var started = false;
    var hls = null;

    if (!video || !cover || !source) {
        return;
    }

    function reveal() {
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
    }

    function begin() {
        if (started) {
            reveal();
            video.play().catch(function () {});
            return;
        }

        started = true;
        reveal();

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            video.play().catch(function () {});
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    cover.addEventListener("click", begin);
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            begin();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
