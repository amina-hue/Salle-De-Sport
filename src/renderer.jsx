import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './renderer/components/Sidebar';
import "./styles/sidebar.css";
function App() {
  return (
    <div>
      <NavBar />
      <div style={{ padding: '20px' }}>
        <h1>Bienvenue à la Salle de Sport !</h1>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));