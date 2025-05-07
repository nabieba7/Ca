/**
 * @jest-environment jsdom
 */
const { togglePlayback } = require('../src/player');

describe('Playback toggle', () => {
  let playButton, audio;

  beforeEach(() => {
    playButton = document.createElement('button');
    audio = {
      play: jest.fn(),
      pause: jest.fn()
    };
  });

  test('plays audio and updates icon when paused', () => {
    const isPlaying = false;
    const newState = togglePlayback(audio, playButton, isPlaying);

    expect(audio.play).toHaveBeenCalled();
    expect(playButton.innerHTML).toContain('pause');
    expect(newState).toBe(true);
  });

  test('pauses audio and updates icon when playing', () => {
    const isPlaying = true;
    const newState = togglePlayback(audio, playButton, isPlaying);

    expect(audio.pause).toHaveBeenCalled();
    expect(playButton.innerHTML).toContain('play_arrow');
    expect(newState).toBe(false);
  });
});
const { getNextTrackIndex } = require('../src/player');

describe('Next song logic', () => {
  test('returns next index in playlist', () => {
    expect(getNextTrackIndex(1, 5)).toBe(2);
  });

  test('wraps around to first track at end of playlist', () => {
    expect(getNextTrackIndex(4, 5)).toBe(0);
  });

  test('wraps correctly with single-song playlist', () => {
    expect(getNextTrackIndex(0, 1)).toBe(0);
  });
});
