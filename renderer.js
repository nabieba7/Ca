const selectButton = document.getElementById('select-folder');
const path = require('path'); // Ensure path is imported

// Listen for the last folder info when the app starts
window.electronAPI.on('last-folder', (folderPath) => {
  console.log('Last selected folder:', folderPath);
  const lastFolderElement = document.getElementById('last-folder');
  if (lastFolderElement) {
    lastFolderElement.textContent = `Last folder: ${folderPath}`;
  }
});

selectButton.addEventListener('click', async () => {
  try {
    const result = await window.electronAPI.selectFolder();

    if (!result) {
      console.error('No folder selected');
      return;
    }

    const { folderPath, files } = result;
    console.log('Selected folder:', folderPath);
    console.log('Audio files:', files);

    // Display or load the files into your playlist
    const list = document.getElementById('playlist');
    list.innerHTML = ''; // Clear existing files

    files.filter(file => ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase()))
      .forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        list.appendChild(li);
      });

    // Update UI with the current folder
    const folderElement = document.getElementById('current-folder');
    if (folderElement) {
      folderElement.textContent = `Current folder: ${folderPath}`;
    }

  } catch (error) {
    console.error('Error selecting folder:', error);
  }
});
