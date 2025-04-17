const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadSongs: () => ipcRenderer.invoke('loadSongs'),
  saveSongs: (songs) => ipcRenderer.invoke('saveSongs', songs),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  getAppPath: () => ipcRenderer.invoke('getAppPath'),
  sendNotification: (title, body) => ipcRenderer.invoke('send-notification', { title, body }),
  setProgressBar: (progress) => ipcRenderer.invoke('set-progress-bar', progress),
  updateTrayMenu: (data) => ipcRenderer.invoke('update-tray-menu', data),
  onMediaCommand: (callback) => ipcRenderer.on('media-command', callback),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body })
})