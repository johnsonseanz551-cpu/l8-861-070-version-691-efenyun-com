import { H as Hls } from "./video-player-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    const players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
        const video = player.querySelector("video");
        const button = player.querySelector("[data-play-button]");
        if (!video || !button) {
            return;
        }
        const streamUrl = video.getAttribute("data-stream-url");
        let loaded = false;
        let hls = null;

        function attachStream() {
            if (loaded || !streamUrl) {
                return;
            }
            loaded = true;
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            attachStream();
            button.classList.add("is-hidden");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", playVideo);
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                return;
            }
            button.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
});
