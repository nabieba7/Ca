/**
 * @jest-environment jsdom
 */
const { initTheme, toggleTheme } = require('../src/theme');

describe('Theme toggle tests', () => {
    let themeToggle;

    beforeEach(() => {
        // Reset DOM and localStorage
        document.body.innerHTML = '';
        document.body.className = ''; // Remove all classes including 'dark-theme'
        localStorage.clear();
    
        // Simulate theme toggle button
        themeToggle = document.createElement('div');
        themeToggle.id = 'themeToggle';
        document.body.appendChild(themeToggle);
    });

    test('initTheme applies dark mode if saved in localStorage', () => {
        localStorage.setItem('theme', 'dark');
        initTheme(document, window, themeToggle);
        expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('toggleTheme switches from light to dark', () => {
        toggleTheme(document, window, themeToggle);
        expect(document.body.classList.contains('dark-theme')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('toggleTheme switches from dark to light', () => {
        document.body.classList.add('dark-theme');
        toggleTheme(document, window, themeToggle);
        expect(document.body.classList.contains('dark-theme')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });
});
