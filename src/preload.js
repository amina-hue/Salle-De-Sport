// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
   invoke: (channel, data) => ipcRenderer.invoke(channel, data),
   getTypeAbonnements:   ()     => ipcRenderer.invoke('getTypeAbonnements'),
   addTypeAbonnement:    (data) => ipcRenderer.invoke('addTypeAbonnement', data),
   updateTypeAbonnement: (data) => ipcRenderer.invoke('updateTypeAbonnement', data),
   deleteTypeAbonnement: (id)   => ipcRenderer.invoke('deleteTypeAbonnement', id),
// paiements
  getPaiements: () => ipcRenderer.invoke('getPaiements'),
  addPaiement: (data) => ipcRenderer.invoke('addPaiement', data),
  // produits
   getProduits:  () => ipcRenderer.invoke('getProduits'),
   addProduit:   (data) => ipcRenderer.invoke('addProduit', data),
  updateProduit: (data) => ipcRenderer.invoke('updateProduit', data),
  deleteProduit: (id) => ipcRenderer.invoke('deleteProduit', id),
});