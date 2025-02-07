import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import {
    GridView,
    Assessment,
    Notifications,
    Settings,
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="sidebar-mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <ChevronLeft className="toggle-icon" />
        </div>

        <div className="sidebar-logo">
          <h1 className="logo-text">SAIT</h1>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard1">
              <GridView />
              <span>Panel Principal</span>
            </Link>
          </li>
          <li>
            <Link to="/reportes">
              <Assessment />
              <span>Informes</span>
            </Link>
          </li>
          <li>
            <Link to="/Alarmas">
              <Notifications />
              <span>Alarmas</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboardconfig">
              <DashboardCustomize />
              <span>Configurar Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/devices">
              <Devices />
              <span>Dispositivos</span>
            </Link>
          </li>
          <li>
            <Link to="/variables">
              <TableChart />
              <span>Tabla de Variables</span>
            </Link>
          </li>
          <li>
            <Link to="/ai">
              <Psychology />
              <span>IA</span>
            </Link>
          </li>
          <li>
            <Link to="/accounts">
              <AccountCircle />
              <span>Cuentas</span>
            </Link>
          </li>
          <li>
            <Link to="/subcuenta">
              <AccountCircle />
              <span>Subcuentas</span>
            </Link>
          </li>
          <li
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            <ExitToApp />
            <span>Cerrar Sesión</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
