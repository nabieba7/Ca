const {
    isSupportedAudioFile,
    isSupportedImageFile
  } = require('../src/utils');
  
  describe('Audio File Validation', () => {
    test('should detect supported audio files', () => {
      expect(isSupportedAudioFile('track.mp3')).toBe(true);
      expect(isSupportedAudioFile('track.wav')).toBe(true);
      expect(isSupportedAudioFile('cover.png')).toBe(false);
    });
  });
  
  describe('Image File Validation', () => {
    test('should detect supported image files', () => {
      expect(isSupportedImageFile('cover.jpg')).toBe(true);
      expect(isSupportedImageFile('album.jpeg')).toBe(true);
      expect(isSupportedImageFile('image.png')).toBe(true);
      expect(isSupportedImageFile('track.mp3')).toBe(false);
    });
  });
  
  