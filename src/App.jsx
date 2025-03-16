// src/App.jsx
import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardConfig } from "./components/DashboardConfig.jsx";
import DevicesList from "./components/devices";
import Alarmas from "./components/Alarmas";
import VariableTable from "./components/variables";
import MqttProvider from "./components/MqttProvider";
import Reportes from "./components/reportes";
import Subcuenta from "./components/Subcuenta";
import Login1 from "./components/Login1";
import Ia from "./components/Ia";
import Ticket from "./components/Ticket";
import Navbar from "./components/Navbar";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Efecto inicial para cargar el estado
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    
    setIsAuthenticated(!!token);
    if (storedUserId) {
      setUserId(storedUserId);
      console.log("User ID set from localStorage:", storedUserId);
    }
    setIsInitialized(true);
  }, []);

  // Efecto para manejar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue);
      }
      if (e.key === "userId") {
        const newUserId = e.newValue;
        console.log("Storage event - New userId:", newUserId);
        setUserId(newUserId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Efecto para loguear cambios en el estado
  useEffect(() => {
    console.log("Estado actual - userId:", userId);
    console.log("Estado actual - isAuthenticated:", isAuthenticated);
  }, [userId, isAuthenticated]);

  if (!isInitialized) {
    return <div>Cargando...</div>;
  }

  // No renderizar el MqttProvider si no hay userId pero el usuario está autenticado
  if (!userId && isAuthenticated) {
    console.log("Usuario autenticado pero sin userId, esperando...");
    return <div>Cargando información de usuario...</div>;
  }

  return (
    <Provider store={store}>
      <MqttProvider userId={userId}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login setUserId={setUserId} />} />
            <Route path="/login1" element={<Login1 setUserId={setUserId} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboardconfig"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/devices"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DevicesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alarmas"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Alarmas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/variables"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <VariableTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subcuenta"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Subcuenta />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ia"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Ia />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Ticket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard userId={userId} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </MqttProvider>
    </Provider>
  );
}

export default App;
