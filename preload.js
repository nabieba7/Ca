const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadSongs: () => ipcRenderer.invoke('loadSongs'),
  saveSongs: (songs) => ipcRenderer.invoke('saveSongs', songs),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  getAppPath: () => ipcRenderer.invoke('getAppPath')
})