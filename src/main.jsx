import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './tailwind.css';
import App from './App.jsx';

// FIX: Redirect plain /admin to hashed /#/admin to support direct links
if (window.location.pathname.endsWith('/admin') && !window.location.hash) {
  const newPath = window.location.pathname.replace(/\/admin$/, '');
  const target = `${window.location.origin}${newPath}/#/admin`;
  window.location.replace(target);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
