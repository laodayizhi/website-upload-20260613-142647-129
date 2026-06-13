(function () {
  function initMoviePlayer() {
    var video = document.querySelector('[data-movie-player]');
    var button = document.querySelector('[data-player-button]');
    var cover = document.querySelector('[data-player-cover]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var playerReady = false;
    var hlsInstance = null;
    function bindSource() {
      if (playerReady || !source) {
        return;
      }
      playerReady = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }
    function playMovie() {
      bindSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', playMovie);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('loadedmetadata', function () {
      video.controls = true;
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initMoviePlayer);
})();
