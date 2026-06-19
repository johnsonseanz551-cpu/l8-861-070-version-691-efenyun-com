import { H as Hls } from "./hls-vendor.js";

document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var status = player.querySelector(".player-status");
    var hls = null;
    var prepared = false;

    function setStatus(text) {
        if (status) {
            status.textContent = text || "";
        }
    }

    function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                setStatus("点击视频继续播放");
            });
        }
    }

    function prepare() {
        if (!video || prepared) {
            playVideo();
            return;
        }

        var url = video.getAttribute("data-m3u8");
        if (!url) {
            setStatus("播放暂时不可用");
            return;
        }

        prepared = true;
        video.setAttribute("controls", "controls");
        setStatus("正在连接播放");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.addEventListener("canplay", playVideo, { once: true });
            return;
        }

        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
    }

    function start() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        prepare();
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                start();
            }
        });
        video.addEventListener("playing", function () {
            setStatus("");
        });
        video.addEventListener("error", function () {
            setStatus("播放暂时不可用，请稍后重试");
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
});
