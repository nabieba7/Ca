const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Load your HTML file
  win.loadFile('src/index.html')
}

app.whenReady().then(createWindow)