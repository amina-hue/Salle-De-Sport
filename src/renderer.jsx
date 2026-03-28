import React from 'react';
import ReactDOM from 'react-dom/client'; // ⚠ attention : /client pour React 18
import "./styles/sidebar.css";
import Paiement from './renderer/pages/paiment';
import "./index.css";
import Login from './renderer/pages/connexion';
import AdherentsPage from './renderer/pages/Adherent';
import Magasin from './renderer/pages/Magasin';
import Utilisateur from './renderer/pages/Utilisateurs';

function App() {
  return (
    <div className="w-screen h-screen">
     
    {/* <Magasin/> */}
        {/* <AdherentsPage/> */}
        <Utilisateur/>

      
    </div>
  );
}

// ⚡ Nouvelle API React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);