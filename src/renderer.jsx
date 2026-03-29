import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout                  from './renderer/components/Layout';
import Login               from './renderer/pages/connexion';
import Adherent                from './renderer/pages/Adherent';
import Home                    from './renderer/pages/Home';
import Abonnement              from './renderer/pages/abonnement';
import Paiement                from './renderer/pages/paiment';
import Planning                from './renderer/pages/planning';
import Recette                 from './renderer/pages/Recette';
import Magasin                 from './renderer/pages/Magasin';
import Utilisateurs            from './renderer/pages/Utilisateurs';
import Parametres              from './renderer/pages/Parametres';
import StatistiquesAdherent    from './renderer/pages/StatistiquesAdherent';
import StatistiquesAbonnement  from './renderer/pages/StatistiquesAbonnement';
import StatistiquesRevenue     from './renderer/pages/StatistiquesRevenue';

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* ── Redirection racine → connexion ── */}
        <Route path="/" element={<Navigate to="/connexion" replace />} />

        {/* ── Page connexion — sans sidebar ── */}
        <Route path="/connexion" element={<Login />} />

        {/* ── Pages protégées — avec sidebar via Layout ── */}
        <Route element={<Layout />}>
          <Route path="/home"                     element={<Home />} />
          <Route path="/adherents"                element={<Adherent />} />
          <Route path="/abonnements"              element={<Abonnement />} />
          <Route path="/paiements"                element={<Paiement />} />
          <Route path="/planning"                 element={<Planning />} />
          <Route path="/recette"                  element={<Recette />} />
          <Route path="/magasin"                  element={<Magasin />} />
          <Route path="/utilisateurs"             element={<Utilisateurs />} />
          <Route path="/parametres"               element={<Parametres />} />
          <Route path="/statistiques/adherents"   element={<StatistiquesAdherent />} />
          <Route path="/statistiques/abonnements" element={<StatistiquesAbonnement />} />
          <Route path="/statistiques/revenue"     element={<StatistiquesRevenue />} />
        </Route>

      </Routes>
    </HashRouter>
  );
}

// ── Montage React ──
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error('❌ Aucun élément #root trouvé dans index.html');
}