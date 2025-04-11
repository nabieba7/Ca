document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const wrapper = document.querySelector('.wrapper');
    const musicImg = document.querySelector('.img-area img');
    const musicName = document.querySelector('.song-details .name');
    const musicArtist = document.querySelector('.song-details .artist');
    const mainAudio = document.querySelector('#main-audio');
    const playBtn = document.querySelector('#play');
    const prevBtn = document.querySelector('#prev');
    const nextBtn = document.querySelector('#next');
    const progressBar = document.querySelector('.progress-bar span');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.max-duration');
    const musicList = document.querySelector('.music-list');
    const playlist = document.querySelector('.music-list ul');
    const closeBtn = document.querySelector('#close');
    const moreBtn = document.querySelector('.top-bar .material-icons:last-child');
    const repeatBtn = document.querySelector('#repeat-plist');
    const shuffleBtn = document.querySelector('#shuffle');
  
    // Music data
    const allMusic = [
      {
        name: "Fake Mustache",
        artist: "Harley Bird",
        img: "/israel-palacio-Y20JJ_ddy9M-unsplash.jpg",
        src: "/fake-mustache-199248.mp3"
      },
      {
        name: "Mot",
        artist: "August",
        img: "/img-1.jpg",
        src: "/mot_-_avgust-eto-ty.mp3"
      },
      {
        name: "Tri dnya lyubvi",
        artist: "Zivert",
        img: "/img-2.jpeg",
        src: "/zivert_-_tri-dnya-lyubvi.mp3"
      },
      {
        name: "Eto lyubov",
        artist: "Amirchik",
        img: "/images.jpeg",
        src: "/amirchik_-_eta-lyubov.mp3"
      }
    ];
  
    let musicIndex = 0;
    let isPlaying = false;
    let isRepeat = false;
    let isShuffle = false;
  
    // Initialize player
    function init() {
      loadMusic(musicIndex);
      createPlaylist();
      updatePlaylistUI();
    }
  
    // Load music function
    function loadMusic(index) {
      // Ensure index is within bounds
      musicIndex = (index + allMusic.length) % allMusic.length;
      
      const song = allMusic[musicIndex];
      
      musicName.textContent = song.name;
      musicArtist.textContent = song.artist;
      musicImg.src = `./assets/images/${song.img}`;
      musicImg.alt = `${song.name} album cover`;
      mainAudio.src = `./assets/music/${song.src}`;
      
      // Update the highlighted song in the playlist
      updatePlaylistUI();
      
      // If player was playing, continue playing the new song
      if (isPlaying) {
        playMusic().catch(e => console.error("Playback error:", e));
      }
    }
  
    // Play music function
    function playMusic() {
        wrapper.classList.add('paused');
        mainAudio.play();
        isPlaying = true; // Make sure the state is updated
        updatePlayPauseIcon(); // Update the button icon
      }
      
  
    // Pause music function
    function pauseMusic() {
      mainAudio.pause();
      isPlaying = false;
      playBtn.textContent = 'play_arrow';
      playBtn.classList.remove('playing');
      updatePlayPauseIcon();
    }
  
    // Toggle play/pause
    function togglePlayPause() {
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    }
  
    // Play next song
    function nextSong() {
      if (isShuffle) {
        const nextIndex = Math.floor(Math.random() * allMusic.length);
        loadMusic(nextIndex);
      } else {
        loadMusic(musicIndex + 1);
      }
      if (isPlaying) playMusic();
    }
  
    // Play previous song
    function prevSong() {
      if (mainAudio.currentTime > 3) {
        // If song is more than 3 seconds in, restart it
        mainAudio.currentTime = 0;
      } else {
        // Otherwise go to previous song
        loadMusic(musicIndex - 1);
        if (isPlaying) playMusic();
      }
    }
  
    // Update play/pause button icon
    function updatePlayPauseIcon() {
      if (isPlaying) {
        playBtn.textContent = 'pause';
        playBtn.classList.add('playing');
      } else {
        playBtn.textContent = 'play_arrow';
        playBtn.classList.remove('playing');
      }
    }
  
    // Create playlist items
    function createPlaylist() {
        playlist.innerHTML = '';
        allMusic.forEach((song, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-index', index);
            li.innerHTML = `
              <div class="row">
                <span>${song.name}</span>
                <p>${song.artist}</p>
              </div>
              <span class="audio-duration">Loading...</span>
            `;
            playlist.appendChild(li);
    
            // Event listener to load the song duration
            const audio = new Audio(`assets/music/${song.src}`);
            audio.addEventListener('loadedmetadata', function() {
              const duration = formatTime(audio.duration);
              li.querySelector('.audio-duration').textContent = duration;
            });
            
    
            // Add click event to playlist items
            li.addEventListener('click', () => {
                loadMusic(index);
                playMusic();
            });
        });
    }
    
  
    // Update playlist UI with current playing song
    function updatePlaylistUI() {
      const playlistItems = document.querySelectorAll('.music-list ul li');
      playlistItems.forEach((item, index) => {
        item.classList.toggle('playing', index === musicIndex);
      });
    }
  
    // Update progress bar
    function updateProgress() {
      const { currentTime, duration } = mainAudio;
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      
      // Update time display
      currentTimeEl.textContent = formatTime(currentTime);
      if (duration) {
        durationEl.textContent = formatTime(duration);
      }
    }
  
    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
  
    // Set progress when clicked on progress bar
    function setProgress(e) {
      const width = this.clientWidth;
      const clickX = e.offsetX;
      const duration = mainAudio.duration;
      mainAudio.currentTime = (clickX / width) * duration;
    }
  
    // Toggle repeat
    function toggleRepeat() {
      isRepeat = !isRepeat;
      repeatBtn.style.color = isRepeat ? 'var(--pink)' : 'var(--lightblack)';
      mainAudio.loop = isRepeat;
    }
  
    // Toggle shuffle
    function toggleShuffle() {
      isShuffle = !isShuffle;
      shuffleBtn.style.color = isShuffle ? 'var(--pink)' : 'var(--lightblack)';
    }
  
    // Event listeners
    playBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    repeatBtn.addEventListener('click', toggleRepeat);
    shuffleBtn.addEventListener('click', toggleShuffle);
  
    // Progress bar events
    mainAudio.addEventListener('timeupdate', updateProgress);
    document.querySelector('.progress-area').addEventListener('click', setProgress);
  
    // When song ends
    mainAudio.addEventListener('ended', () => {
      if (isRepeat) {
        mainAudio.currentTime = 0;
        playMusic();
      } else {
        nextSong();
      }
    });
  
    // Show/hide playlist
    moreBtn.addEventListener('click', () => {
      musicList.classList.add('show');
    });
  
    closeBtn.addEventListener('click', () => {
      musicList.classList.remove('show');
    });
  
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          nextSong();
          break;
        case 'ArrowLeft':
          prevSong();
          break;
      }
    });
  
    // Initialize the player
    init();
  });

  document.addEventListener('DOMContentLoaded', function() {
    // ... all your existing code ...
  
    // Place this inside DOMContentLoaded, after mainAudio is defined
    mainAudio.addEventListener('canplaythrough', () => {
      console.log("Audio is ready to play!");
      playMusic();
    });
  
    // Initialize the player
    init();
  });
  