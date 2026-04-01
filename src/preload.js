// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    getAbonnements:     () => ipcRenderer.invoke('getAbonnements'),
  addAbonnement:      (data) => ipcRenderer.invoke('addAbonnement', data),
getTypeAbonnements: () => ipcRenderer.invoke('getTypeAbonnements'),
});