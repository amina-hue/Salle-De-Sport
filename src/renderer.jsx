import React from 'react';
import ReactDOM from 'react-dom/client'; // ⚠ attention : /client pour React 18
import "./styles/sidebar.css";
import Paiement from './renderer/pages/paiment';
import Planning from './renderer/pages/planning';
import AbonnementsPage from './renderer/pages/abonnement';
import "./index.css";
import Login from './renderer/pages/connexion';
import AdherentsPage from './renderer/pages/Adherent';

function App() {
  return (
    <div className="w-screen h-screen">
     
    
        <AdherentsPage/>
      
    </div>
  );
}

// ⚡ Nouvelle API React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);