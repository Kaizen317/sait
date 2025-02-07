// src/App.jsx
import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardConfig from "./components/DashboardConfig";
import DevicesList from "./components/devices";
import Alarmas from "./components/Alarmas";
import VariableTable from "./components/variables";
import MqttProvider from "./components/MqttProvider";
import Reportes from "./components/reportes";
import Subcuenta from "./components/Subcuenta";
import Login1 from "./components/Login1";
import Ia from "./components/Ia";

function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al montar, leer userId de localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      console.log("User ID from localStorage:", storedUserId);
    }
  }, []);

  // Manejo de token para isAuthenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);

      // Opcionalmente, si cambió userId en otra pestaña, puedes también hacer:
      const newUserId = localStorage.getItem("userId");
      setUserId(newUserId);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Provider store={store}>
      {/* Pasamos userId como prop al MqttProvider */}
      <MqttProvider userId={userId}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login setUserId={setUserId} />} />
            <Route path="/login1" element={<Login1 setUserId={setUserId} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboardconfig" element={<DashboardConfig />} />
            <Route path="/devices" element={<DevicesList />} />
            <Route path="/alarmas" element={<Alarmas />} />
            <Route path="/variables" element={<VariableTable />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/subcuenta" element={<Subcuenta />} />
            <Route path="/ia" element={<Ia />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard userId={userId} />
                </ProtectedRoute>
              }
            />

            {/* Redirigir rutas no definidas al login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </MqttProvider>
    </Provider>
  );
}

export default App;
