import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700;800&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e) {} };
  }, []);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#0e0f11', color: '#f0f0f0',
      fontFamily: "'Barlow', sans-serif",
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflowY: 'auto',   // ← était 'hidden', maintenant scroll activé
        height: '100vh',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </main>
    </div>
  );
}