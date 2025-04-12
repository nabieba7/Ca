document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const wrapper = document.querySelector('.wrapper');
    const audioPlayer = document.getElementById('audio-player') || new Audio();
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
    const muteBtn = document.getElementById('mute-btn');
    const volumeProgress = document.getElementById('volume-progress');
    const volumeBar = document.querySelector('.volume-bar');
  
    // Player state
    let currentSongIndex = 0;
    let isPlaying = false;
    let isRepeat = false;
    let isShuffle = false;
    let songs = [];
    const defaultImageUrl = 'https://source.unsplash.com/random/300x300/?music,album';
    const path = window.electronAPI ? {
        basename: (p) => p.split(/[\\/]/).pop(),
        parse: (p) => {
            const ext = p.lastIndexOf('.') > 0 ? p.slice(p.lastIndexOf('.')) : '';
            return {
                name: p.slice(0, p.lastIndexOf('.') > 0 ? p.lastIndexOf('.') : undefined),
                ext: ext
            };
        },
        join: (...args) => args.join('/')
    } : require('path');

    // Initialize player
    async function initPlayer() {
        try {
            songs = window.electronAPI ? await window.electronAPI.loadSongs() : JSON.parse(localStorage.getItem('songs')) || [];
            
            if (songs.length > 0) {
                loadSong(currentSongIndex);
            }
            renderPlaylist();
        } catch (err) {
            console.error('Failed to initialize player:', err);
        }
    }

    // Load song
    function loadSong(index) {
        if (songs.length === 0 || index < 0 || index >= songs.length) return;
        
        currentSongIndex = index;
        const song = songs[index];
        
        audioPlayer.src = song.audioUrl;
        songTitle.textContent = song.title || 'Unknown Song';
        songArtist.textContent = song.artist || 'Unknown Artist';
        albumArt.src = song.imageUrl || defaultImageUrl;
        albumArt.onerror = () => albumArt.src = defaultImageUrl;
        
        // Update active song in playlist
        const items = document.querySelectorAll('#playlist-items li:not(.add-song)');
        items.forEach(item => item.classList.remove('playing'));
        if (items[index]) items[index].classList.add('playing');
        
        audioPlayer.onloadedmetadata = () => {
            durationEl.textContent = formatTime(audioPlayer.duration);
            if (isPlaying) audioPlayer.play().catch(e => console.error('Playback failed:', e));
        };
        
        audioPlayer.onerror = () => {
            console.error('Error loading audio file');
            songs.splice(index, 1);
            saveSongs();
            if (songs.length > 0) {
                loadSong(Math.min(index, songs.length - 1));
            } else {
                renderPlaylist();
            }
        };
    }

    // Save songs to storage
    async function saveSongs() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveSongs(songs);
            } else {
                localStorage.setItem('songs', JSON.stringify(songs));
            }
        } catch (err) {
            console.error('Failed to save songs:', err);
        }
    }

    // Handle file upload with image prompt
    async function handleFileUpload() {
        try {
            // 1. Select audio file
            const audioResult = window.electronAPI 
                ? await window.electronAPI.showOpenDialog({
                    properties: ['openFile'],
                    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }]
                })
                : await new Promise(resolve => {
                    audioUpload.click();
                    audioUpload.onchange = () => resolve({ filePaths: audioUpload.files.length ? [audioUpload.files[0].path || URL.createObjectURL(audioUpload.files[0])] : [] });
                });
            
            if (!audioResult.filePaths || audioResult.filePaths.length === 0) return;
            
            const audioPath = audioResult.filePaths[0];
            const audioFilename = path.basename(audioPath);
            const audioUrl = window.electronAPI ? `file://${audioPath}` : audioPath;
            
            // 2. Prompt for image file
            let imageUrl = defaultImageUrl;
            const imageResult = window.electronAPI 
                ? await window.electronAPI.showOpenDialog({
                    properties: ['openFile'],
                    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
                    title: 'Select Album Art for ' + path.parse(audioFilename).name
                })
                : await new Promise(resolve => {
                    imageUpload.click();
                    imageUpload.onchange = () => resolve({ filePaths: imageUpload.files.length ? [URL.createObjectURL(imageUpload.files[0])] : [] });
                });
            
            if (imageResult.filePaths && imageResult.filePaths.length > 0) {
                imageUrl = window.electronAPI ? `file://${imageResult.filePaths[0]}` : imageResult.filePaths[0];
            }
            
            // 3. Add new song
            songs.push({
                title: path.parse(audioFilename).name,
                artist: 'Unknown Artist',
                audioUrl: audioUrl,
                imageUrl: imageUrl
            });
            
            await saveSongs();
            
            if (songs.length === 1) {
                currentSongIndex = 0;
                loadSong(currentSongIndex);
            }
            
            renderPlaylist();
            
            // Reset inputs
            audioUpload.value = '';
            imageUpload.value = '';
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }

    // Player controls
    function playSong() {
        if (songs.length === 0) return;
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playBtn.textContent = 'pause';
                albumArt.classList.add('rotate');
            })
            .catch(e => console.error('Playback failed:', e));
    }

    function pauseSong() {
        isPlaying = false;
        playBtn.textContent = 'play_arrow';
        albumArt.classList.remove('rotate');
        audioPlayer.pause();
    }

    function prevSong() {
        if (songs.length === 0) return;
        currentSongIndex = currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }

    function nextSong() {
        if (songs.length === 0) return;
        currentSongIndex = isShuffle 
            ? (() => {
                let newIndex;
                do { newIndex = Math.floor(Math.random() * songs.length); } 
                while (songs.length > 1 && newIndex === currentSongIndex);
                return newIndex;
            })()
            : (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
    }

    // Progress and volume
    function updateProgress() {
        if (!isNaN(audioPlayer.duration)) {
            progressBar.style.width = `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`;
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        }
    }

    function setProgress(e) {
        if (!isNaN(audioPlayer.duration)) {
            audioPlayer.currentTime = (e.offsetX / this.clientWidth) * audioPlayer.duration;
        }
    }

    function setVolume(e) {
        const volume = Math.min(1, Math.max(0, e.offsetX / volumeBar.clientWidth));
        audioPlayer.volume = volume;
        volumeProgress.style.width = `${volume * 100}%`;
        updateVolumeIcon(volume);
        if (audioPlayer.muted) audioPlayer.muted = false;
    }

    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        updateVolumeIcon(audioPlayer.muted ? 0 : audioPlayer.volume);
    }

    function updateVolumeIcon(volume) {
        muteBtn.textContent = volume === 0 || audioPlayer.muted ? 'volume_off' 
            : volume < 0.5 ? 'volume_down' : 'volume_up';
        muteBtn.style.color = volume === 0 || audioPlayer.muted ? '#ff0000' : '';
    }

    // Helper functions
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }

  // Update the renderPlaylist function to this:
function renderPlaylist() {
    playlistItems.innerHTML = '';
    
    if (songs.length === 0) {
        playlistItems.innerHTML = '<li style="justify-content: center; color: var(--text); opacity: 0.7;">No songs in playlist</li>';
    } else {
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img class="playlist-img" src="${song.imageUrl || defaultImageUrl}" alt="${song.title}" onerror="this.src='${defaultImageUrl}'">
                <div class="playlist-info">
                    <strong>${song.title || 'Unknown Song'}</strong>
                    <p>${song.artist || 'Unknown Artist'}</p>
                </div>
            `;
            
            // Highlight currently playing song
            if (index === currentSongIndex) {
                li.classList.add('playing');
            }
            
            // Click to play song
            li.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
            });
            
            playlistItems.appendChild(li);
        });
    }
    
    // Add "Add Song" button at the bottom
    const addSongBtn = document.createElement('li');
    addSongBtn.className = 'add-song';
    addSongBtn.innerHTML = '<i class="material-icons">add</i> Add Songs';
    addSongBtn.addEventListener('click', handleFileUpload);
    playlistItems.appendChild(addSongBtn);
}

    // Event listeners
    playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
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
    showListBtn.addEventListener('click', () => playlist.classList.add('show'));
    closeBtn.addEventListener('click', () => playlist.classList.remove('show'));
    uploadBtn.addEventListener('click', handleFileUpload);
    muteBtn.addEventListener('click', toggleMute);
    volumeBar.addEventListener('click', setVolume);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => isRepeat ? (audioPlayer.currentTime = 0, playSong()) : nextSong());
    document.querySelector('.progress-area').addEventListener('click', setProgress);

    // Initialize
    audioPlayer.volume = 0.7;
    volumeProgress.style.width = '70%';
    updateVolumeIcon(0.7);
    initPlayer();
});