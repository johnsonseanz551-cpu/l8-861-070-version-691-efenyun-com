import { H as Hls } from "./hls-vendor.js";

const video = document.getElementById("movie-player");
const startButton = document.getElementById("video-start");
const configNode = document.getElementById("stream-config");
let hlsInstance = null;
let isReady = false;

function readStreamUrl() {
  if (!configNode) {
    return "";
  }

  try {
    const config = JSON.parse(configNode.textContent || "{}");
    return String(config.url || "");
  } catch (error) {
    return "";
  }
}

function playVideo() {
  const promise = video.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      if (startButton) {
        startButton.classList.remove("is-hidden");
      }
    });
  }
}

function attachStream() {
  if (!video || isReady) {
    return;
  }

  const streamUrl = readStreamUrl();
  if (!streamUrl) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    isReady = true;
    playVideo();
    return;
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      lowLatencyMode: true,
      backBufferLength: 60
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      isReady = true;
      playVideo();
    });
    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data && data.fatal) {
        hlsInstance.destroy();
        hlsInstance = null;
        video.src = streamUrl;
        isReady = true;
        playVideo();
      }
    });
    return;
  }

  video.src = streamUrl;
  isReady = true;
  playVideo();
}

function startPlayback() {
  if (!video) {
    return;
  }

  if (startButton) {
    startButton.classList.add("is-hidden");
  }

  if (isReady) {
    playVideo();
  } else {
    attachStream();
  }
}

if (startButton) {
  startButton.addEventListener("click", startPlayback);
}

if (video) {
  video.addEventListener("click", () => {
    if (video.paused) {
      startPlayback();
    }
  });
}
