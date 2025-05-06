// src/utils.js

function isSupportedAudioFile(filename) {
    return /\.(mp3|wav|ogg)$/i.test(filename);
  }
  
  function isSupportedImageFile(filename) {
    return /\.(jpg|jpeg|png|gif)$/i.test(filename);
  }
  
  module.exports = {
    isSupportedAudioFile,
    isSupportedImageFile
  };
  