import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid session in localStorage
    const session = localStorage.getItem('kalimat_admin_session');
    if (session === 'authenticated') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (pin) => {
    const startPin = String(pin).trim();
    const correctPin = String(import.meta.env.VITE_ADMIN_PIN).trim();

    if (startPin === correctPin) {
      localStorage.setItem('kalimat_admin_session', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('kalimat_admin_session');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
