(function () {
    function bindMoviePlayer(source) {
        var video = document.querySelector('[data-player-video]');
        var layer = document.querySelector('[data-player-layer]');
        var started = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function hideLayer() {
            if (layer) {
                layer.classList.add('hidden');
            }
        }

        function start() {
            hideLayer();
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        function load() {
            if (started) {
                start();
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', start, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, start);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
                return;
            }

            video.src = source;
            video.addEventListener('loadedmetadata', start, { once: true });
            video.load();
        }

        if (layer) {
            layer.addEventListener('click', load);
        }

        video.addEventListener('click', function () {
            if (!started) {
                load();
            }
        });

        video.addEventListener('play', hideLayer);
    }

    window.bindMoviePlayer = bindMoviePlayer;
})();
