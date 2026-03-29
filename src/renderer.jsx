import React from 'react';
import ReactDOM from 'react-dom/client'; // ⚠ attention : /client pour React 18
import "./styles/sidebar.css";
import Paiement from './renderer/pages/paiment';
import Planning from './renderer/pages/planning';
import AbonnementsPage from './renderer/pages/abonnement';
import "./index.css";
import Login from './renderer/pages/connexion';
import AdherentsPage from './renderer/pages/Adherent';
import StatistiquesAbonnement from "./renderer/pages/StatistiquesAbonnement";
import StatistiquesAdherent from "./renderer/pages/StatistiquesAdherent";
import StatistiquesRevenue from "./renderer/pages/StatistiquesRevenue";
import Parametres from "./renderer/pages/Parametres";
import Magasin from './renderer/pages/Magasin';
import Utilisateur from './renderer/pages/Utilisateurs';
import Recette from './renderer/pages/Recette';

function App() {
  return (
    <div className="w-screen h-screen">
     
    
      {/* <StatistiquesAbonnement /> */}
      {/* <StatistiquesAdherent /> */}
      {/* <StatistiquesRevenue />   */}
     {/*} <Parametres />*/}
    {/* <Magasin/> */}
         <AdherentsPage/> 
        {/* <Utilisateur/> */}
        {/* <Recette/> */}

      
    </div>
  );
}

// ⚡ Nouvelle API React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);