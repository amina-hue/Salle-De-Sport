const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, data) => ipcRenderer.invoke(channel, data);

// ── window.electron (usage général) ──
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

// ── window.api (utilisé dans les pages React) ──
contextBridge.exposeInMainWorld('api', {

  // ── Adhérents ──
  ajouterPaiement: (data) => ipcRenderer.invoke('ajouterPaiement', data),
  getAdherents:               ()     => invoke('getAdherents'),
  getAdherentsAvecAbonnement: ()     => invoke('getAdherentsAvecAbonnement'),
  getAdherentsWithAbonnement: () => invoke('getAdherentsAvecAbonnement'),
  getAdherentDetail:          (id)   => invoke('getAdherentDetail', id),
  addAdherent:                (data) => invoke('addAdherent', data),
  updateAdherent:             (data) => invoke('updateAdherent', data),
  updateAdherentPhoto:        (data) => invoke('updateAdherentPhoto', data),
  deleteAdherent:             (id)   => invoke('deleteAdherent', id),
  deleteAdherentComplet:      (id)   => invoke('deleteAdherentComplet', id),
  searchAdherents:            (q)    => invoke('searchAdherents', q),
  getStatsAdherents:          ()     => invoke('getStatsAdherents'),
  getAdherentsParMois:        ()     => invoke('getAdherentsParMois'),
  getStatsPageAdherent:       ()     => invoke('getStatsPageAdherent'), 
  addRole:                    (data) => invoke('addRole', data),   // ← AJOUTER
deleteRole:                 (id)   => invoke('deleteRole', id),  // ← AJOUTER
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
  getAbonnementsNonPaies: () => invoke('getAbonnementsNonPaies'),
  getPaiementsEtAttentes: () => invoke('getPaiementsEtAttentes'),
  // ── Produits ──
  getProduits:                ()     => invoke('getProduits'),
  addProduit:                 (data) => invoke('addProduit', data),
  updateProduit:              (data) => invoke('updateProduit', data),
  deleteProduit:              (id)   => invoke('deleteProduit', id),
  addTransaction:             (data) => invoke('addTransaction', data),       // ← AJOUTER
  getHistoriqueVentes:        ()     => invoke('getHistoriqueVentes'),         // ← AJOUTER
  getHistoriqueAchats:        ()     => invoke('getHistoriqueAchats'),         // ← AJOUTER
  // Les nouvelles fonctions pour les stats et les ventes
  getStatsMagasin: () => ipcRenderer.invoke('getStatsMagasin'),
  vendreProduit: (data) => ipcRenderer.invoke('vendreProduit', data),


  // ── Séances ──
  getSeances:                 ()     => invoke('getSeances'),
  getSeancesPlanning:         ()     => invoke('getSeancesPlanning'),
  addSeance:                  (data) => invoke('addSeance', data),
  deleteSeance:               (id)   => invoke('deleteSeance', id),
  
   incrementPresents:          (id)     => ipcRenderer.invoke('incrementPresents', id),
  getSeancesSemaine: (params) => ipcRenderer.invoke('getSeancesSemaine', params),
  getPresencesSeance: (seance_id) => ipcRenderer.invoke('getPresencesSeance', seance_id),
addPresence:       (data)   => ipcRenderer.invoke('addPresence', data),


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
  // ── Stats Abonnements ──
  getStatsAbonnements:           ()  => invoke('getStatsAbonnements'),
  getAbonnementsParType:         ()  => invoke('getAbonnementsParType'),
  getAbonnementsExpirantBientot: ()  => invoke('getAbonnementsExpirantBientot'),
  getFrequentationHebdo:         ()  => invoke('getFrequentationHebdo'),
  getHistoriqueAbonnements: (id) => ipcRenderer.invoke('getHistoriqueAbonnements', id),
  // ── Permissions ──
  getPermissions:                (role_id)          => invoke('getPermissions', role_id),
  savePermissions:               (data)             => invoke('savePermissions', data),
  

  sendEmail:                (data) => ipcRenderer.invoke('sendEmail', data),
  getEmailsAdherentsActifs: ()     => ipcRenderer.invoke('getEmailsAdherentsActifs'),
// Fréquentation par jour de la semaine
  getFrequentationSemaine: () => invoke('getFrequentationSemaine'),
  createAdherentComplet:  (data) => ipcRenderer.invoke('createAdherentComplet', data),
  //renewAbonnement: (data) => ipcRenderer.invoke('renew-abonnement', data),
  //ajouterPaiement:        (data) => ipcRenderer.invoke('ajouterPaiement', data),
  //getAbonnementsNonPaies: ()     => ipcRenderer.invoke('getAbonnementsNonPaies'),
  exportPlanningPDF: (data) => ipcRenderer.invoke('exportPlanningPDF', data),
  sendSpecialMessage: (data) => ipcRenderer.invoke('sendSpecialMessage', data),
  exportEtEnvoyerPlanningPDF: (data) => ipcRenderer.invoke('exportEtEnvoyerPlanningPDF', data),
  getHistoriqueAchatsAdherent: (adherentId) => ipcRenderer.invoke('get-historique-adherent', adherentId),
getPointsFidelite: () => ipcRenderer.invoke('getPointsFidelite'),
getAdherentNiveau: (id) => ipcRenderer.invoke('getAdherentNiveau', id),
  
  getSeancesParJour: () => invoke('getSeancesParJour'),
  createAdherentComplet:  (data) => ipcRenderer.invoke('createAdherentComplet', data),





  
});

  // Dans ton preload.js ou main process
ipcMain.handle('update-paiement-status', async (event, { id, statut }) => {
  try {
    const result = await db.query(
      'UPDATE paiements SET statut = ?, date_modification = NOW() WHERE id = ?',
      [statut, id]
    );
    
    return { success: result.affectedRows > 0 };
  } catch (error) {
    console.error('Erreur update paiement:', error);
    return { success: false, error: error.message };
  }
});