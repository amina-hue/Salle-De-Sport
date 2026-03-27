import React from 'react';
import ReactDOM from 'react-dom/client'; // ⚠ attention : /client pour React 18
import "./styles/sidebar.css";
import Planning from './renderer/pages/planning';
import "./index.css";
import Paiement from './renderer/pages/paiment';

function App() {
  return (
    <div className="w-screen h-screen">
     
    
        <Paiement />
      
    </div>
  );
}

// ⚡ Nouvelle API React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);