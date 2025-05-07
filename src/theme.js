function initTheme(document, window, themeToggle) {
    const savedTheme = window.localStorage.getItem('theme') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    updateThemeToggleIcon(document, themeToggle);
}

function toggleTheme(document, window, themeToggle) {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggleIcon(document, themeToggle);
}

function updateThemeToggleIcon(document, themeToggle) {
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark
        ? '<i class="material-icons">brightness_7</i>'
        : '<i class="material-icons">brightness_4</i>';
}

module.exports = { initTheme, toggleTheme, updateThemeToggleIcon };
