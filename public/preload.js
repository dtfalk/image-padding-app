const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose a limited set of APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openMultiFileDialog: () => ipcRenderer.invoke('open-multi-file-dialog'),
  getImages: (folderPath) => ipcRenderer.invoke('get-images', folderPath),
  readDirectory: (folderPath) => ipcRenderer.invoke('read-directory', folderPath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  selectFolder: () => ipcRenderer.invoke('open-folder-dialog'),
  readImage: (filePath) => ipcRenderer.invoke('read-image', filePath),
  getImageSize: (filePath) => ipcRenderer.invoke('get-image-size', filePath),
  processImages: (images, saveLocation) => ipcRenderer.invoke('process-images', images, saveLocation),
  exitApp: () => ipcRenderer.invoke('exit-app'),
});
