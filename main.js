const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron')
const path = require('path')
const fs = require('fs')

// Get application paths
const userDataPath = app.getPath('userData')
const musicFolder = path.join(userDataPath, 'music')
const imagesFolder = path.join(userDataPath, 'images')

// Create directories if they don't exist
function createAppDirectories() {
  if (!fs.existsSync(musicFolder)) fs.mkdirSync(musicFolder, { recursive: true })
  if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  win.loadFile('src/index.html')
  return win
}

// Register file protocol
function registerFileProtocol() {
  protocol.registerFileProtocol('file', (request, callback) => {
    try {
      const filePath = path.normalize(request.url.replace('file:///', ''))
      callback(filePath)
    } catch (error) {
      console.error('Error serving file:', error)
      callback({ error: 'Failed to load file' })
    }
  })
}

// IPC Handlers
function setupIPC() {
  ipcMain.handle('dialog:openFile', async (_, options) => {
    const result = await dialog.showOpenDialog(options)
    return result
  })

  ipcMain.handle('loadSongs', async () => {
    try {
      const savePath = path.join(userDataPath, 'songs.json')
      if (fs.existsSync(savePath)) {
        const data = await fs.promises.readFile(savePath, 'utf-8')
        const songs = JSON.parse(data)
        
        return songs.map(song => ({
          ...song,
          audioUrl: `file://${path.join(musicFolder, song.audioUrl.replace('MUSIC_DIR/', ''))}`,
          imageUrl: song.imageUrl?.startsWith('IMAGES_DIR') 
            ? `file://${path.join(imagesFolder, song.imageUrl.replace('IMAGES_DIR/', ''))}`
            : song.imageUrl
        }))
      }
      return []
    } catch (err) {
      console.error('Error loading songs:', err)
      return []
    }
  })

  ipcMain.handle('saveSongs', async (_, songs) => {
    try {
      const savePath = path.join(userDataPath, 'songs.json')
      const songsToSave = songs.map(song => ({
        ...song,
        audioUrl: song.audioUrl.replace(`file://${musicFolder}`, 'MUSIC_DIR'),
        imageUrl: song.imageUrl?.startsWith('file://') 
          ? song.imageUrl.replace(`file://${imagesFolder}`, 'IMAGES_DIR')
          : song.imageUrl
      }))
      await fs.promises.writeFile(savePath, JSON.stringify(songsToSave))
      return true
    } catch (err) {
      console.error('Error saving songs:', err)
      return false
    }
  })

  ipcMain.handle('getAppPath', () => {
    return {
      userData: userDataPath,
      music: musicFolder,
      images: imagesFolder
    }
  })
}

// App lifecycle
app.whenReady().then(() => {
  createAppDirectories()
  registerFileProtocol()
  setupIPC()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})