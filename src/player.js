function togglePlayback(audioElement, playButton, isPlaying) {
    if (isPlaying) {
      audioElement.pause();
      playButton.innerHTML = '<i class="material-icons">play_arrow</i>';
    } else {
      audioElement.play();
      playButton.innerHTML = '<i class="material-icons">pause</i>';
    }
    return !isPlaying;
  }
  
  function getNextTrackIndex(currentIndex, playlistLength) {
    return (currentIndex + 1) % playlistLength;
  }
  
  // 👇 This must be present!
  module.exports = {
    togglePlayback,
    getNextTrackIndex
  };
   