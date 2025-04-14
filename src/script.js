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
    const themeToggle = document.querySelector('.theme-toggle'); // Theme toggle button

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
    } : { // Mock 'path' for browser environment
        basename: (p) => p.split('/').pop(),
        parse: (p) => {
            const ext = p.lastIndexOf('.') > 0 ? p.slice(p.lastIndexOf('.')) : '';
            return { name: p.slice(0, p.lastIndexOf('.') > 0 ? p.lastIndexOf('.') : undefined), ext };
        },
        join: (...args) => args.join('/')
    };

    // Initialize player
    async function initPlayer() {
        try {
            songs = window.electronAPI ? await window.electronAPI.loadSongs() : loadSongsFromStorage();
            if (songs.length > 0 && !audioPlayer.src) { // Ensure a song is loaded on init if available
                loadSong(currentSongIndex);
            }
            renderPlaylist();
            initTheme(); // Initialize theme
        } catch (err) {
            console.error('Failed to initialize player:', err);
        }
    }

    // Local Storage for Browser
    function loadSongsFromStorage() {
        try {
            const storedSongs = localStorage.getItem('songs');
            return storedSongs ? JSON.parse(storedSongs) : [];
        } catch (error) {
            console.error('Error loading songs from local storage:', error);
            return [];
        }
    }

    function saveSongsToStorage() {
        try {
            localStorage.setItem('songs', JSON.stringify(songs));
        } catch (error) {
            console.error('Error saving songs to local storage:', error);
        }
    }

    // Theme functions
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (savedTheme === 'dark') document.body.classList.add('dark-theme');
        updateThemeToggleIcon();
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeToggleIcon();
    }

    function updateThemeToggleIcon() {
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerHTML = isDark ? '<i class="material-icons">brightness_7</i>' : '<i class="material-icons">brightness_4</i>';
    }

    // Load song
    function loadSong(index) {
        if (songs.length === 0 || index < 0 || index >= songs.length) {
            resetPlayer(); // Reset player if index is invalid
            return;
        }

        currentSongIndex = index;
        const song = songs[index];

        audioPlayer.src = song.audioUrl;
        songTitle.textContent = song.title || path.basename(path.parse(song.audioUrl).name);
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
                resetPlayer();
                renderPlaylist();
            }
        };
    }

    function resetPlayer() {
        audioPlayer.src = '';
        songTitle.textContent = 'No song selected';
        songArtist.textContent = 'Select a song';
        albumArt.src = defaultImageUrl;
        isPlaying = false;
        playBtn.textContent = 'play_arrow';
        albumArt.classList.remove('rotate');
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
    }

    // Save songs to storage
    async function saveSongs() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveSongs(songs);
            } else {
                saveSongsToStorage();
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
                    properties: ['openFile', 'multiSelections'],
                    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }]
                })
                : await new Promise(resolve => {
                    audioUpload.click();
                    audioUpload.onchange = (event) => {
                        resolve({ filePaths: Array.from(event.target.files).map(file => file.path || URL.createObjectURL(file)) });
                    };
                });

            if (!audioResult.filePaths || audioResult.filePaths.length === 0) return;

            for (const audioPath of audioResult.filePaths) {
                const audioFilename = path.basename(audioPath);
                const audioUrl = window.electronAPI ? `file://${audioPath}` : audioPath;
                let imageUrl = defaultImageUrl;

                if (!window.electronAPI) {
                    // For browser, we don't prompt for image immediately in this simplified version
                    // You might want to add a separate way to set album art in the browser
                } else {
                    // 2. Prompt for image file (Electron specific)
                    const imageResult = await window.electronAPI.showOpenDialog({
                        properties: ['openFile'],
                        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
                        title: 'Select Album Art for ' + path.parse(audioFilename).name
                    });

                    if (imageResult.filePaths && imageResult.filePaths.length > 0) {
                        imageUrl = `file://${imageResult.filePaths[0]}`;
                    }
                }

                // 3. Add new song
                songs.push({
                    title: path.parse(audioFilename).name,
                    artist: 'Unknown Artist',
                    audioUrl: audioUrl,
                    imageUrl: imageUrl
                });
            }

            await saveSongs();

            if (songs.length > 0 && !audioPlayer.src) {
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
        if (songs.length === 0 || !audioPlayer.src) return; // Ensure a song is loaded
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
        playSong(); // Autoplay after loading previous
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
        playSong(); // Autoplay after loading next
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
        if (!volumeBar) return; // Prevent errors if volumeBar is not found
        const volume = Math.min(1, Math.max(0, e.offsetX / volumeBar.clientWidth));
        audioPlayer.volume = volume;
        if (volumeProgress) {
            volumeProgress.style.width = `${volume * 100}%`;
        }
        updateVolumeIcon(volume);
        if (audioPlayer.muted) audioPlayer.muted = false;
    }

    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        updateVolumeIcon(audioPlayer.muted ? 0 : audioPlayer.volume);
    }

    function updateVolumeIcon(volume) {
        if (muteBtn) {
            muteBtn.textContent = volume === 0 || audioPlayer.muted ? 'volume_off'
                : volume < 0.5 ? 'volume_down' : 'volume_up';
            muteBtn.style.color = volume === 0 || audioPlayer.muted ? '#ff0000' : '';
        }
    }

    // Helper functions
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }

    function renderPlaylist() {
        if (!playlistItems) return; // Prevent errors if playlistItems is not found
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
    showListBtn.addEventListener('click', () => playlist && playlist.classList.add('show'));
    closeBtn.addEventListener('click', () => playlist && playlist.classList.remove('show'));
    uploadBtn.addEventListener('click', handleFileUpload);
    muteBtn.addEventListener('click', toggleMute);
    volumeBar && volumeBar.addEventListener('click', setVolume);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => isRepeat ? (audioPlayer.currentTime = 0, playSong()) : nextSong());
    document.querySelector('.progress-area') && document.querySelector('.progress-area').addEventListener('click', setProgress);

    // Theme toggle event listener
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Initialize
    audioPlayer.volume = 0.7;
    if (volumeProgress) {
        volumeProgress.style.width = '70%';
    }
    updateVolumeIcon(0.7);
    initPlayer();
});