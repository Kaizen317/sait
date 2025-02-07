import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import {
  GridView,
  Assessment,
  Notifications,
  Devices,
  TableChart,
  Psychology,
  AccountCircle,
  ExitToApp,
  ChevronLeft,
  DashboardCustomize,
} from "@mui/icons-material";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [userType, setUserType] = useState("normal");
  const location = useLocation(); // Para obtener la ruta actual y resaltar el ítem activo

  useEffect(() => {
    const storedAccess = localStorage.getItem("navbarAccess");
    const storedUserType = localStorage.getItem("userType") || "normal";

    setAllowedRoutes(storedAccess ? JSON.parse(storedAccess) : []);
    setUserType(storedUserType);
  }, []);

  const allRoutes = [
    { path: "/dashboard", icon: <GridView />, text: "Panel Principal" },
    { path: "/reportes", icon: <Assessment />, text: "Informes" },
    { path: "/alarmas", icon: <Notifications />, text: "Alarmas" },
    { path: "/dashboardconfig", icon: <DashboardCustomize />, text: "Configurar Dashboard" },
    { path: "/devices", icon: <Devices />, text: "Dispositivos" },
    { path: "/variables", icon: <TableChart />, text: "Tabla de Variables" },
    {
      path: "/ia",
      icon: <Psychology />,
      text: "IA",
      // Puedes querer un estilo especial:
      extraClass: "ia-item",
    },
    { path: "/subcuenta", icon: <AccountCircle />, text: "Cuentas" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Botón para pantallas pequeñas (móviles) */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
          <ChevronLeft className="toggle-icon" />
        </div>

        <div className="sidebar-logo">
          <h1 className="logo-text">SAIT</h1>
        </div>

        <ul className="sidebar-menu">
          {allRoutes.map((route) => {
            // Verificar si el usuario root o si la ruta está permitida
            const canAccess = userType === "root" || allowedRoutes.includes(route.path);

            // Marcar como activo si coincide con la ruta actual
            const isActive = location.pathname === route.path;

            // Añadir clase extra si es "/ia" (para el estilo especial) o si está activo
            const liClass = [
              route.extraClass || "", // ejemplo: "ia-item"
              isActive ? "active" : "",
            ]
              .join(" ")
              .trim();

            return (
              canAccess && (
                <li key={route.path} className={liClass} title={route.text}>
                  <Link to={route.path}>
                    {route.icon}
                    <span>{route.text}</span>
                  </Link>
                </li>
              )
            );
          })}
          <li onClick={handleLogout}>
            <ExitToApp />
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
