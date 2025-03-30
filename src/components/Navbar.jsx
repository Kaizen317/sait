import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  styled,
  Fade,
} from "@mui/material";
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
  ChevronRight,
  DashboardCustomize,
  ConfirmationNumber,
  Menu as MenuIcon,
  Settings,
} from "@mui/icons-material";

// Tema personalizado con el color de referencia #006875
const theme = createTheme({
  palette: {
    primary: {
      main: "#006875", // Color principal
      light: "#338c98", // Tono más claro
      dark: "#004b55", // Tono más oscuro
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

// Estilo para los ítems del menú
const StyledListItem = styled(ListItem)(({ theme, isactive }) => ({
  borderRadius: "8px",
  margin: "6px 10px",
  padding: "12px 16px",
  transition: "all 0.3s ease",
  backgroundColor: isactive === "true" ? theme.palette.primary.light : "transparent",
  "&:hover": {
    backgroundColor: isactive === "true" ? theme.palette.primary.light : "rgba(0, 104, 117, 0.1)",
    transform: "translateX(4px)",
  },
  "& .MuiListItemIcon-root": {
    color: isactive === "true" ? "white" : "rgba(255, 255, 255, 0.8)",
    minWidth: "40px",
  },
  "& .MuiListItemText-primary": {
    color: isactive === "true" ? "white" : "rgba(255, 255, 255, 0.9)",
    fontWeight: isactive === "true" ? 600 : 400,
  },
}));

// Contenedor del Sidebar
const SidebarContainer = styled(Box)(({ theme, open }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: open ? "250px" : "70px",
  backgroundColor: theme.palette.primary.main,
  boxShadow: "2px 0 15px rgba(0, 0, 0, 0.1)",
  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  zIndex: 1100,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

// Perfil del usuario
const UserProfile = styled(Box)(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  padding: open ? "20px 16px" : "20px 0",
  borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
  justifyContent: open ? "flex-start" : "center",
  transition: "all 0.3s ease",
}));

// Botón de toggle
const ToggleButton = styled(IconButton)(({ theme, open }) => ({
  position: "absolute",
  right: open ? "12px" : "50%",
  top: "12px",
  transform: open ? "translateX(0)" : "translateX(50%)",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: theme.palette.primary.main,
  width: "32px",
  height: "32px",
  "&:hover": {
    backgroundColor: "white",
    transform: open ? "translateX(0) scale(1.1)" : "translateX(50%) scale(1.1)",
  },
  transition: "all 0.3s ease",
}));

// Logo
const Logo = styled(Box)(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: open ? "space-between" : "center",
  padding: open ? "16px" : "16px 0",
  backgroundColor: theme.palette.primary.dark,
  color: "white",
  height: "64px",
  transition: "all 0.3s ease",
}));

// Botón de menú flotante
const MenuButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  left: "15px",
  top: "15px",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  zIndex: 1200,
  width: "44px",
  height: "44px",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.05)",
  },
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
}));

// Overlay para móviles
const SidebarOverlay = styled(Box)(({ open }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1050,
  opacity: open ? 1 : 0,
  visibility: open ? "visible" : "hidden",
  transition: "opacity 0.3s ease",
}));

function Sidebar({ setIsSidebarOpen, onNavigate }) {
  const [isOpen, setIsOpen] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [userType, setUserType] = useState("normal");
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const storedAccess = localStorage.getItem("navbarAccess");
    const storedUserType = localStorage.getItem("userType") || "normal";
    setAllowedRoutes(storedAccess ? JSON.parse(storedAccess) : []);
    setUserType(storedUserType);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (setIsSidebarOpen) {
      setIsSidebarOpen(isOpen);
    }
    document.body.style.overflow = isMobile && isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsSidebarOpen, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    if (onNavigate) {
      // Si existe la función onNavigate, la usamos para manejar la navegación con advertencia
      onNavigate(path);
    } else {
      // Si no existe, hacemos la navegación normal
      window.location.href = path;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const allRoutes = [
    { path: "/dashboard", icon: <GridView />, text: "Panel Principal" },
    { path: "/reportes", icon: <Assessment />, text: "Informes" },
    { path: "/alarmas", icon: <Notifications />, text: "Alarmas" },
    { path: "/dashboardconfig", icon: <DashboardCustomize />, text: "Configurar Dashboard" },
    { path: "/devices", icon: <Devices />, text: "Dispositivos" },
    { path: "/tickets", icon: <ConfirmationNumber />, text: "Tickets" },
    { path: "/ia", icon: <Psychology />, text: "Asistente IA", isNew: true },
    { path: "/subcuenta", icon: <AccountCircle />, text: "Cuentas" },
  ];

  const renderSidebarContent = () => (
    <>
      <Logo open={isOpen}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ opacity: isOpen ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          SAIT
        </Typography>
        {isOpen && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Logo>

      <UserProfile open={isOpen}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.light,
            width: 40,
            height: 40,
            mr: isOpen ? 2 : 0,
          }}
        >
          {userType.charAt(0).toUpperCase()}
        </Avatar>
        {isOpen && (
          <Fade in={isOpen}>
            <Box>
              <Typography variant="subtitle1" color="white" fontWeight={600}>
                {userType === "root" ? "Administrador" : "Usuario"}
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                {userType === "root" ? "Acceso completo" : "Acceso limitado"}
              </Typography>
            </Box>
          </Fade>
        )}
      </UserProfile>

      <Box sx={{ flex: 1, overflowY: "auto", mt: 2 }}>
        <List>
          {allRoutes.map((route) => {
            const canAccess = userType === "root" || allowedRoutes.includes(route.path);
            const isActive = location.pathname === route.path;
            if (!canAccess) return null;

            return (
              <Tooltip key={route.path} title={!isOpen ? route.text : ""} placement="right">
                <StyledListItem
                  component="li"
                  onClick={() => handleNavigation(route.path)}
                  isactive={isActive.toString()}
                  sx={{ justifyContent: isOpen ? "flex-start" : "center", cursor: 'pointer' }}
                >
                  <ListItemIcon>{route.icon}</ListItemIcon>
                  {isOpen && (
                    <Fade in={isOpen}>
                      <ListItemText primary={route.text} />
                    </Fade>
                  )}
                  {route.isNew && isOpen && (
                    <Box
                      sx={{
                        ml: 1,
                        bgcolor: "warning.main",
                        color: "warning.contrastText",
                        px: 1,
                        py: 0.5,
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    >
                      beta
                    </Box>
                  )}
                </StyledListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ my: 1, bgcolor: "rgba(255, 255, 255, 0.1)" }} />
      <Box sx={{ p: isOpen ? 2 : 1 }}>
        {isOpen ? (
          <StyledListItem
            component="li"
            onClick={handleLogout}
            sx={{
              cursor: 'pointer',
              "&:hover": {
                backgroundColor: "rgba(255, 76, 76, 0.2)",
                "& .MuiListItemIcon-root": { color: "#ff4c4c" },
                "& .MuiListItemText-primary": { color: "#ff4c4c" },
              },
            }}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </StyledListItem>
        ) : (
          <Tooltip title="Cerrar Sesión" placement="right">
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": { color: "#ff4c4c" },
              }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      {isMobile && <SidebarOverlay open={isOpen} onClick={toggleSidebar} />}

      {isMobile ? (
        <>
          <MenuButton onClick={toggleSidebar}>
            <MenuIcon />
          </MenuButton>
          <Drawer
            variant="temporary"
            open={isOpen}
            onClose={toggleSidebar}
            sx={{
              "& .MuiDrawer-paper": {
                width: "250px",
                backgroundColor: theme.palette.primary.main,
                color: "white",
                boxShadow: "2px 0 15px rgba(0, 0, 0, 0.2)",
                borderRight: "none",
              },
            }}
          >
            {renderSidebarContent()}
          </Drawer>
        </>
      ) : (
        <SidebarContainer open={isOpen}>
          {renderSidebarContent()}
          {!isOpen && (
            <ToggleButton onClick={toggleSidebar} open={isOpen}>
              <ChevronRight />
            </ToggleButton>
          )}
        </SidebarContainer>
      )}
    </ThemeProvider>
  );
}

export default Sidebar;