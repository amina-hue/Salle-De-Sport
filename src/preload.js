const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, data) => ipcRenderer.invoke(channel, data);

// ── window.electron (usage général) ──
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

// ── window.api (utilisé dans les pages React) ──
contextBridge.exposeInMainWorld('api', {

  // ── Adhérents ──
  getAdherents:               ()     => invoke('getAdherents'),
  getAdherentsAvecAbonnement: ()     => invoke('getAdherentsAvecAbonnement'),
  getAdherentDetail:          (id)   => invoke('getAdherentDetail', id),
  addAdherent:                (data) => invoke('addAdherent', data),
  updateAdherent:             (data) => invoke('updateAdherent', data),
  updateAdherentPhoto:        (data) => invoke('updateAdherentPhoto', data),
  deleteAdherent:             (id)   => invoke('deleteAdherent', id),
  deleteAdherentComplet:      (id)   => invoke('deleteAdherentComplet', id),
  searchAdherents:            (q)    => invoke('searchAdherents', q),
  getStatsAdherents:          ()     => invoke('getStatsAdherents'),
  getAdherentsParMois:        ()     => invoke('getAdherentsParMois'),

  // ── Abonnements ──
  
  getAbonnements:             ()     => invoke('getAbonnements'),
  getTypesAbonnement:         ()     => invoke('getTypesAbonnement'),
  getTypeAbonnements:         ()     => invoke('getTypeAbonnements'),
  addAbonnement:              (data) => invoke('addAbonnement', data),
  updateAbonnement:           (data) => invoke('updateAbonnement', data),
  addTypeAbonnement:          (data) => invoke('addTypeAbonnement', data),
  getAbonnementsExpirant:     ()     => invoke('getAbonnementsExpirant'), 
  updateTypeAbonnement:       (data) => invoke('updateTypeAbonnement', data),
  deleteTypeAbonnement:       (id)   => invoke('deleteTypeAbonnement', id),

  // ── Paiements ──
  getPaiements:               ()     => invoke('getPaiements'),
  addPaiement:                (data) => invoke('addPaiement', data),

  // ── Produits ──
  getProduits:                ()     => invoke('getProduits'),
  addProduit:                 (data) => invoke('addProduit', data),
  updateProduit:              (data) => invoke('updateProduit', data),
  deleteProduit:              (id)   => invoke('deleteProduit', id),

  // ── Séances ──
  getSeances:                 ()     => invoke('getSeances'),
  getSeancesPlanning:         ()     => invoke('getSeancesPlanning'),
  addSeance:                  (data) => invoke('addSeance', data),
  deleteSeance:               (id)   => invoke('deleteSeance', id),

  // ── Activités ──
  getActivites:               ()     => invoke('getActivites'),
  addActivite:                (data) => invoke('addActivite', data),
  deleteActivite:             (id)   => invoke('deleteActivite', id),

  // ── Recette ──
  getRecette:                 ()     => invoke('getRecette'),
  getRecetteParMois:          ()     => invoke('getRecetteParMois'),

  // ── Utilisateurs ──
  getUtilisateurs:            ()     => invoke('getUtilisateurs'),
  addUtilisateur:             (data) => invoke('addUtilisateur', data),
  updateUtilisateur:          (data) => invoke('updateUtilisateur', data),
  deleteUtilisateur:          (id)   => invoke('deleteUtilisateur', id),
  getRoles:                   ()     => invoke('getRoles'),
  getCoachs:                  ()     => invoke('getCoachs'),

  // ── Auth ──
  login:                      (data) => invoke('login', data),
  getRolesAvecCount:          ()     => invoke('getRolesAvecCount'),
});