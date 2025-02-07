// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Cargar datos desde localStorage al inicio
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      setUser({ token, userId });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (userData) => {
    // Guardar los datos de usuario en el estado y en localStorage
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userId", userData.userId);
  };

  const logout = () => {
    // Limpiar el estado y el localStorage
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear(); // Limpia todo el almacenamiento local
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
