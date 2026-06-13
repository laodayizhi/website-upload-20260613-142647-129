var hlsModulePromise = null;

function loadHlsModule() {
    if (!hlsModulePromise) {
        hlsModulePromise = import("./video-dru42stk.js").then(function (module) {
            return module.H;
        });
    }
    return hlsModulePromise;
}

async function bindHls(video) {
    if (!video || video.dataset.bound === "true") {
        return;
    }

    var source = video.getAttribute("data-src");
    if (!source) {
        return;
    }

    video.dataset.bound = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
    }

    try {
        var Hls = await loadHlsModule();
        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }
    } catch (error) {
        console.warn("HLS module failed to load, falling back to direct source.", error);
    }

    video.src = source;
}

function startVideo(shell) {
    var video = shell.querySelector(".js-video-player");
    var overlay = shell.querySelector("[data-play-button]");

    bindHls(video).then(function () {
        if (overlay) {
            overlay.classList.add("hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.controls = true;
            });
        }
    });
}

document.querySelectorAll("[data-video-shell]").forEach(function (shell) {
    var button = shell.querySelector("[data-play-button]");
    var video = shell.querySelector(".js-video-player");

    if (button) {
        button.addEventListener("click", function () {
            startVideo(shell);
        });
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.dataset.bound !== "true") {
                startVideo(shell);
            }
        });
    }
});
