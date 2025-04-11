document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const wrapper = document.querySelector('.wrapper');
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const repeatBtn = document.getElementById('repeat');
    const shuffleBtn = document.getElementById('shuffle');
    const showListBtn = document.getElementById('show-list');
    const uploadBtn = document.getElementById('upload-btn');
    const closeBtn = document.getElementById('close');
    const playlist = document.getElementById('playlist');
    const playlistItems = document.getElementById('playlist-items');
    const progressBar = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const albumArt = document.getElementById('album-art');
    const audioUpload = document.getElementById('audio-upload');
    const imageUpload = document.getElementById('image-upload');
  
    // Player state
    let currentSongIndex = 0;
    let isPlaying = false;
    let isRepeat = false;
    let isShuffle = false;
    let songs = JSON.parse(localStorage.getItem('songs')) || [];
  
    // Initialize player
    function initPlayer() {
      if (songs.length > 0) {
        loadSong(currentSongIndex);
        renderPlaylist();
      }
    }
  
    // Load song
    function loadSong(index) {
      if (songs.length === 0) return;
      
      const song = songs[index];
      audioPlayer.src = song.audioUrl;
      songTitle.textContent = song.title || 'Unknown Song';
      songArtist.textContent = song.artist || 'Unknown Artist';
      albumArt.src = song.imageUrl || 'https://source.unsplash.com/random/300x300/?music,album';
      
      // Update active song in playlist
      const playlistItems = document.querySelectorAll('#playlist-items li');
      playlistItems.forEach(item => item.classList.remove('playing'));
      if (playlistItems[index]) {
        playlistItems[index].classList.add('playing');
      }
      
      // Load metadata
      audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
      });
    }
  
    // Play song
    function playSong() {
      isPlaying = true;
      playBtn.textContent = 'pause';
      albumArt.classList.add('rotate');
      audioPlayer.play();
    }
  
    // Pause song
    function pauseSong() {
      isPlaying = false;
      playBtn.textContent = 'play_arrow';
      albumArt.classList.remove('rotate');
      audioPlayer.pause();
    }
  
    // Previous song
    function prevSong() {
      currentSongIndex--;
      if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
      }
      loadSong(currentSongIndex);
      if (isPlaying) playSong();
    }
  
    // Next song
    function nextSong() {
      if (isShuffle) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
      } else {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
          currentSongIndex = 0;
        }
      }
      loadSong(currentSongIndex);
      if (isPlaying) playSong();
    }
  
    // Update progress bar
    function updateProgress() {
      const { duration, currentTime } = audioPlayer;
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }
  
    // Set progress
    function setProgress(e) {
      const width = this.clientWidth;
      const clickX = e.offsetX;
      const duration = audioPlayer.duration;
      audioPlayer.currentTime = (clickX / width) * duration;
    }
  
    // Format time
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }
  
    // Render playlist
    function renderPlaylist() {
      playlistItems.innerHTML = '';
      
      if (songs.length === 0) {
        playlistItems.innerHTML = '<li style="justify-content: center; color: var(--text); opacity: 0.7;">No songs in playlist</li>';
        return;
      }
      
      songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <img class="playlist-img" src="${song.imageUrl || 'https://source.unsplash.com/random/50x50/?music,album'}" alt="${song.title}">
          <div class="playlist-info">
            <strong>${song.title || 'Unknown Song'}</strong>
            <p>${song.artist || 'Unknown Artist'}</p>
          </div>
        `;
        li.addEventListener('click', () => {
          currentSongIndex = index;
          loadSong(currentSongIndex);
          playSong();
        });
        playlistItems.appendChild(li);
      });
      
      // Add "Add Song" button at the bottom
      const addSongBtn = document.createElement('li');
      addSongBtn.className = 'add-song';
      addSongBtn.innerHTML = '<i class="material-icons">add</i> Add Songs';
      addSongBtn.addEventListener('click', () => {
        audioUpload.click();
      });
      playlistItems.appendChild(addSongBtn);
    }
  
    // Handle file upload
    function handleFileUpload(e) {
      const audioFile = e.target.files[0];
      if (!audioFile) return;
      
      // Ask for image
      imageUpload.click();
      
      imageUpload.onchange = (e) => {
        const imageFile = e.target.files[0];
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
        
        const newSong = {
          title: audioFile.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          artist: 'Unknown Artist',
          audioUrl: URL.createObjectURL(audioFile),
          imageUrl: imageUrl
        };
        
        songs.push(newSong);
        localStorage.setItem('songs', JSON.stringify(songs));
        
        if (songs.length === 1) {
          currentSongIndex = 0;
          loadSong(currentSongIndex);
        }
        
        renderPlaylist();
        
        // Reset file inputs
        audioUpload.value = '';
        imageUpload.value = '';
      };
    }
  
    // Event listeners
    playBtn.addEventListener('click', () => {
      if (songs.length === 0) return;
      isPlaying ? pauseSong() : playSong();
    });
  
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
  
    repeatBtn.addEventListener('click', () => {
      isRepeat = !isRepeat;
      repeatBtn.style.color = isRepeat ? 'var(--primary)' : 'var(--text)';
      audioPlayer.loop = isRepeat;
    });
  
    shuffleBtn.addEventListener('click', () => {
      isShuffle = !isShuffle;
      shuffleBtn.style.color = isShuffle ? 'var(--primary)' : 'var(--text)';
    });
  
    showListBtn.addEventListener('click', () => {
      playlist.classList.add('show');
    });
  
    closeBtn.addEventListener('click', () => {
      playlist.classList.remove('show');
    });
  
    uploadBtn.addEventListener('click', () => {
      audioUpload.click();
    });
  
    audioUpload.addEventListener('change', handleFileUpload);
  
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => {
      if (isRepeat) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
      } else {
        nextSong();
      }
    });
  
    document.querySelector('.progress-area').addEventListener('click', setProgress);
  
    // Initialize player
    initPlayer();
  });