import React from 'react';
import ReactDOM from 'react-dom/client'; // ⚠ attention : /client pour React 18
import "./styles/sidebar.css";
import Paiement from './renderer/pages/paiment';
import Planning from './renderer/pages/planning';
import AbonnementsPage from './renderer/pages/abonnement';
import "./index.css";

function App() {
  return (
    <div className="w-screen h-screen">
     
    
        <AbonnementsPage/>
      
    </div>
  );
}

// ⚡ Nouvelle API React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);