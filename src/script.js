const selectFolderBtn = document.getElementById('select-folder');
const playlist = document.getElementById('playlist');

selectFolderBtn.addEventListener('click', async () => {
    const songs = await window.electronAPI.selectFolder();
    playlist.innerHTML = '';

    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = song.name;
        li.addEventListener('click', () => {
            song.src = song.path;
            loadDynamicSong(song);
            playMusic();
        });
        playlist.appendChild(li);
    });

    // Optional: set first song and autoplay
    if (songs.length > 0) {
        songs[0].src = songs[0].path;
        loadDynamicSong(songs[0]);
        playMusic();
    }
});

function loadDynamicSong(songObj) {
    artistName.innerText = "Unknown";
    musicName.innerText = songObj.name;
    song.src = songObj.path;
    cover.style.backgroundImage = `loadDynamicSon`; // Default or fallback cover
}

const songsList = [
    {
        name: "Jazz In Paris",
        artist: "Media Right Productions",
        src: "/assets/music/fake-mustache-199248.mp3",
        cover: "/assets/images/israel-palacio-Y20JJ_ddy9M-unsplash.jpg"
    },
    {
        name: "Blue Skies",
        artist: "Silent Partner",
        src: "assets/2.mp3",
        cover: "assets/2.jpg"
    },
    {
        name: "Crimson Fly",
        artist: "Huma-Huma",
        src: "assets/3.mp3",
        cover: "assets/3.jpg"
    }
];

const artistName = document.querySelector('.artist-name');
const musicName = document.querySelector('.song-name');
const fillBar = document.querySelector('.fill-bar');
const time = document.querySelector('.time');
const cover = document.getElementById('cover');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const prog = document.querySelector('.progress-bar');

let song = new Audio();
let currentSong = 0;
let playing = false;

document.addEventListener('DOMContentLoaded', () => {
    loadSong(currentSong);
    song.addEventListener('timeupdate', updateProgress);
    song.addEventListener('ended', nextSong);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    playBtn.addEventListener('click', togglePlayPause);
    prog.addEventListener('click', seek);
});

function loadSong(index) {
    const { name, artist, src, cover: thumb } = songsList[index];
    artistName.innerText = artist;
    musicName.innerText = name;
    song.src = src;
    cover.style.backgroundImage = `url(${thumb})`;
}

function updateProgress() {
    if (song.duration) {
        const pos = (song.currentTime / song.duration) * 100;
        fillBar.style.width = `${pos}%`;

        const duration = formatTime(song.duration);
        const currentTime = formatTime(song.currentTime);
        time.innerText = `${currentTime} - ${duration}`;

    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function togglePlayPause() {
    if (playing) {
        song.pause();
    } else {
        song.play();
    }
    playing = !playing;
    playBtn.classList.toggle('fa-pause', playing);
    playBtn.classList.toggle('fa-play', !playing);
    cover.classList.toggle('active', playing);
}

function nextSong() {
    currentSong = (currentSong + 1) % songsList.length;
    playMusic();
}

function prevSong() {
    currentSong = (currentSong - 1 + songsList.length) % songsList.length;
    playMusic();
}

function playMusic() {
    loadSong(currentSong);
    song.play();
    playing = true;
    playBtn.classList.add('fa-pause');
    playBtn.classList.remove('fa-play');
    cover.classList.add('active');
}

function seek(e) {
    const pos = (e.offsetX / prog.clientWidth) * song.duration;
    song.currentTime = pos;
}