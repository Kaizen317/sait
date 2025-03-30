import React, { useState, useEffect } from "react";
import NavBar from "./Navbar";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
  Avatar,
  Fade,
  Badge,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { 
  Delete, 
  Warning, 
  Devices, 
  LocationOn, 
  DriveFileRenameOutline, 
  Settings, 
  Add, 
  Search,
  Visibility,
  VisibilityOff,
  Router,
  Inventory2,
  Menu as MenuIcon,
  MoreVert
} from "@mui/icons-material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s, box-shadow 0.3s",
  backgroundColor: "#ffffff",
  border: "none",
  overflow: "visible",
  height: "100%",
  position: "relative",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.12)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
  color: "white",
  fontWeight: 600,
  padding: "10px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(76, 175, 80, 0.25)",
  transition: "all 0.3s ease",
  textTransform: "none",
  "&:hover": {
    boxShadow: "0 6px 15px rgba(76, 175, 80, 0.35)",
    transform: "translateY(-2px)",
    background: "linear-gradient(45deg, #43A047 30%, #7CB342 90%)",
  },
  "&:disabled": {
    background: "linear-gradient(45deg, #B0BEC5 30%, #CFD8DC 90%)",
    boxShadow: "none",
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
  border: "none",
  height: "100%",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: "0.875rem",
  padding: "16px 24px",
  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
  [theme.breakpoints.down('sm')]: {
    padding: "12px 16px",
    fontSize: "0.8125rem",
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: "#f5f9f5",
  padding: "16px 24px",
  borderBottom: "2px solid rgba(76, 175, 80, 0.2)",
  color: "#424242",
  fontSize: "0.875rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  [theme.breakpoints.down('sm')]: {
    padding: "12px 16px",
    fontSize: "0.75rem",
  },
}));

const DeviceCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 0",
}));

const DeviceAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: "rgba(76, 175, 80, 0.1)",
  color: "#4CAF50",
  width: 36,
  height: 36,
  marginRight: 12,
  [theme.breakpoints.down('sm')]: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
}));

// Card personalizada para dispositivos móviles
const MobileDeviceCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  marginBottom: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  overflow: "visible",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
  },
}));
const DevicesList = () => {
  const [newDevice, setNewDevice] = useState({
    deviceId: "",
    name: "",
    location: "",
  });
  const [devices, setDevices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [addDeviceDrawerOpen, setAddDeviceDrawerOpen] = useState(false);
  
  // Menu para acciones en móvil
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const userId = localStorage.getItem("userId");
  const apiBaseUrl = "https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices";

  useEffect(() => {
    const fetchDevices = async () => {
      if (!userId) {
        setSnackbarMessage("El usuario no está logueado.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          setSnackbarMessage(`Error: ${errorData.error || "No se pudieron cargar los dispositivos."}`);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
        const data = await response.json();
        
        // Simular un pequeño retraso para mostrar la animación de carga
        setTimeout(() => {
          setDevices(data.devices || []);
          setLoading(false);
        }, 500);
      } catch (error) {
        setSnackbarMessage("Hubo un error al conectar con el servidor.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

    fetchDevices();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Eliminar espacios del valor ingresado
    const valueWithoutSpaces = value.replace(/\s+/g, '');
    
    setNewDevice({
      ...newDevice,
      [name]: valueWithoutSpaces,
    });
  };

  const handleAddDevice = async () => {
    const { deviceId, name, location } = newDevice;

    if (!userId) {
      setSnackbarMessage("El usuario no está logueado.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (!deviceId || !name || !location) {
      setSnackbarMessage("Todos los campos son obligatorios.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId,
        deviceId,
        name,
        location
      };

      const response = await fetch(apiBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error: ${errorData.error || "No se pudo agregar el dispositivo."}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setIsSubmitting(false);
        return;
      }

      const responseData = await response.json();
      
      // Actualizar la lista de dispositivos
      setDevices((prevDevices) => [...prevDevices, responseData]);
      setNewDevice({ deviceId: "", name: "", location: "" });

      setSnackbarMessage("Dispositivo agregado con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
      // Cerrar el drawer en móvil después de añadir
      if (isMobile) {
        setAddDeviceDrawerOpen(false);
      }

      // Refrescar la lista desde el servidor
      const refreshResponse = await fetch(`${apiBaseUrl}?userId=${userId}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setDevices(refreshData.devices || []);
      }
    } catch (error) {
      setSnackbarMessage("Hubo un error al conectar con el servidor.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (device) => {
    setDeviceToDelete(device);
    setDialogOpen(true);
    
    // Si estamos en móvil, cerramos el menú de acciones
    if (actionMenuAnchor) {
      setActionMenuAnchor(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDialogOpen(false);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await fetch(`${apiBaseUrl}?userId=${userId}&deviceId=${deviceToDelete.deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error: ${errorData.error || "No se pudo eliminar el dispositivo."}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      setDevices((prevDevices) =>
        prevDevices.filter((device) => device.deviceId !== deviceToDelete.deviceId)
      );

      setSnackbarMessage("Dispositivo eliminado con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbarMessage("Hubo un error al eliminar el dispositivo.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value || "");
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const toggleAddDeviceDrawer = () => {
    setAddDeviceDrawerOpen(!addDeviceDrawerOpen);
  };

  // Funciones para el menú de acciones en móvil
  const handleOpenActionMenu = (event, device) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedDevice(device);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedDevice(null);
  };

  const filteredDevices = (devices || []).filter(device => {
    if (!device) return false;
    
    const searchTermLower = (searchTerm || "").toLowerCase();
    const deviceName = device.name?.toLowerCase() || '';
    const deviceLocation = device.location?.toLowerCase() || '';
    const deviceId = device.deviceId?.toLowerCase() || '';

    return deviceName.includes(searchTermLower) ||
           deviceLocation.includes(searchTermLower) ||
           deviceId.includes(searchTermLower);
  });

  // Contenido principal del formulario de nuevo dispositivo
  const newDeviceFormContent = (
    <Box component="form" sx={{ "& > :not(style)": { mb: 3 } }}>
      <TextField
        label="ID de dispositivo"
        name="deviceId"
        variant="outlined"
        fullWidth
        value={newDevice.deviceId}
        onChange={handleInputChange}
        placeholder="Ej. sensor-001"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Devices sx={{ color: "#4CAF50" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
          }
        }}
      />
      <TextField
        label="Nombre"
        name="name"
        variant="outlined"
        fullWidth
        value={newDevice.name}
        onChange={handleInputChange}
        placeholder="Ej. Sensor de temperatura"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <DriveFileRenameOutline sx={{ color: "#4CAF50" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
          }
        }}
      />
      <TextField
        label="Ubicación"
        name="location"
        variant="outlined"
        fullWidth
        value={newDevice.location}
        onChange={handleInputChange}
        placeholder="Ej. Sala de estar"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOn sx={{ color: "#4CAF50" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
          }
        }}
      />
      <Box sx={{ position: 'relative', mt: 1 }}>
        <GradientButton
          variant="contained"
          fullWidth
          onClick={handleAddDevice}
          disabled={isSubmitting}
          startIcon={<Add />}
        >
          {isSubmitting ? "Agregando..." : "Agregar Dispositivo"}
        </GradientButton>
        {isSubmitting && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
              color: "#4CAF50",
            }}
          />
        )}
      </Box>
    </Box>
  );
  // Renderizado de dispositivos para móvil
  const renderMobileDevices = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
          <CircularProgress sx={{ color: "#4CAF50" }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cargando dispositivos...
          </Typography>
        </Box>
      );
    }

    if (filteredDevices.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Devices sx={{ fontSize: 50, color: "#e0e0e0", mb: 2 }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            {searchTerm ? "No se encontraron dispositivos" : "No hay dispositivos registrados"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: "auto", px: 3 }}>
            {searchTerm ? 
              "Intenta con otros términos de búsqueda o agrega un nuevo dispositivo" : 
              "Pulsa el botón + para agregar tu primer dispositivo"
            }
          </Typography>
        </Box>
      );
    }

    return filteredDevices.map((device) => (
      <MobileDeviceCard key={device.deviceId}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <DeviceCard>
              <DeviceAvatar>
                <Devices fontSize="small" />
              </DeviceAvatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {device.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {device.deviceId}
                </Typography>
              </Box>
            </DeviceCard>
            
            <IconButton 
              aria-label="device-actions" 
              onClick={(event) => handleOpenActionMenu(event, device)}
              sx={{ 
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                width: 36,
                height: 36
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Ubicación
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LocationOn fontSize="small" sx={{ mr: 0.5, color: "#9e9e9e" }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {device.location}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Topic
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "monospace", 
                  fontWeight: 500,
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  mt: 0.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {device.topic}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Credenciales
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Usuario:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {device.username}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Contraseña:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {showPassword ? device.password : "••••••••"}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={handleClickShowPassword}
                      sx={{ ml: 0.5, p: 0.5 }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </MobileDeviceCard>
    ));
  };

  return (
    <div className={isMobile ? "" : "flex min-h-screen bg-gray-100"}>
      {/* AppBar para móvil */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            backgroundColor: "#ffffff", 
            color: "#424242",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" 
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileNav}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600, color: "#2E7D32" }}>
              Gestión de Dispositivos
            </Typography>
            <IconButton 
              color="primary"
              onClick={toggleAddDeviceDrawer}
              sx={{ 
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "#4CAF50"
              }}
            >
              <Add />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer de navegación para móvil */}
      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={toggleMobileNav}
      >
        <NavBar isMobile={true} onClose={toggleMobileNav} />
      </Drawer>

      {/* Drawer para añadir dispositivo en móvil */}
      <Drawer
        anchor="bottom"
        open={addDeviceDrawerOpen}
        onClose={toggleAddDeviceDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            maxHeight: "90vh"
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar 
              sx={{ 
                bgcolor: "#4CAF50", 
                width: 40, 
                height: 40, 
                mr: 2,
                boxShadow: "0 4px 8px rgba(76, 175, 80, 0.25)" 
              }}
            >
              <Add />
            </Avatar>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#2E7D32",
              }}
            >
              Nuevo Dispositivo
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          {newDeviceFormContent}
        </Box>
      </Drawer>

      {/* Menú de acciones para dispositivos móviles */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem
          onClick={() => {
            if (selectedDevice) {
              handleOpenDeleteDialog(selectedDevice);
            }
          }}
          sx={{ color: "#f44336" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: "#f44336" }} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* NavBar para escritorio */}
      {!isMobile && <NavBar />}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          marginLeft: isMobile ? 0 : "250px",
          width: isMobile ? "100%" : "calc(100% - 250px)",
          p: { xs: 2, md: 4 },
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          mt: isMobile ? "56px" : 0,
          pb: isMobile ? 4 : 0,
        }}
      >
        {!isMobile && (
          <Box mb={4}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#2E7D32",
                position: "relative",
                display: "inline-block",
                pb: 1,
                mb: 2,
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "40%",
                  height: "3px",
                  background: "linear-gradient(90deg, #4CAF50, transparent)",
                  borderRadius: "2px",
                },
              }}
            >
              Gestión de Dispositivos
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Administra tus dispositivos IoT conectados y monitoréalos en tiempo real.
            </Typography>
            
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Chip 
                icon={<Inventory2 />} 
                label={`${devices.length} dispositivos registrados`} 
                sx={{ bgcolor: "rgba(76, 175, 80, 0.1)", color: "#4CAF50", fontWeight: 500 }}
              />
            </Box>
          </Box>
        )}

        {/* Sección para agregar dispositivo en vista desktop/tablet */}
        {!isMobile && (
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={600}>
                <StyledCard>
                  <Box sx={{ 
                    height: "6px", 
                    background: "linear-gradient(90deg, #4CAF50, #8BC34A)", 
                    borderTopLeftRadius: "16px", 
                    borderTopRightRadius: "16px" 
                  }} />
                  <CardContent sx={{ padding: "24px" }}>
                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar 
                        sx={{ 
                          bgcolor: "#4CAF50", 
                          width: 45, 
                          height: 45, 
                          mr: 2,
                          boxShadow: "0 4px 8px rgba(76, 175, 80, 0.25)" 
                        }}
                      >
                        <Add />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#2E7D32",
                        }}
                      >
                        Nuevo Dispositivo
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    {newDeviceFormContent}
                  </CardContent>
                </StyledCard>
              </Fade>
            </Grid>
          </Grid>
        )}

        {/* Barra de búsqueda para todas las vistas */}
        <Box sx={{ my: 2 }}>
          <TextField
            placeholder="Buscar dispositivos..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            sx={{ 
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Vista de dispositivos para móvil */}
        {isMobile ? (
          <Box sx={{ mt: 2 }}>
            {renderMobileDevices()}
          </Box>
        ) : (
          /* Vista de tabla para escritorio/tablet */
          <Box mt={4}>
            <Fade in={true} timeout={800}>
              <StyledTableContainer component={Paper}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  p: isTablet ? 2 : 3, 
                  borderBottom: "1px solid rgba(0, 0, 0, 0.05)" 
                }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Router sx={{ color: "#4CAF50", mr: 2 }} />
                    <Typography variant="h6" fontWeight={600} color="#424242">
                      Dispositivos Registrados
                    </Typography>
                  </Box>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell>Dispositivo</StyledTableHeadCell>
                      <StyledTableHeadCell>Ubicación</StyledTableHeadCell>
                      <StyledTableHeadCell>Credenciales</StyledTableHeadCell>
                      <StyledTableHeadCell>Topic</StyledTableHeadCell>
                      <StyledTableHeadCell align="center">Acciones</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <StyledTableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <CircularProgress sx={{ color: "#4CAF50" }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Cargando dispositivos...
                          </Typography>
                        </StyledTableCell>
                      </TableRow>
                    ) : filteredDevices.length === 0 ? (
                      <TableRow>
                        <StyledTableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Box sx={{ textAlign: "center", py: 3 }}>
                            <Devices sx={{ fontSize: 50, color: "#e0e0e0", mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                              {searchTerm ? "No se encontraron dispositivos" : "No hay dispositivos registrados"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: "auto" }}>
                              {searchTerm ? 
                                "Intenta con otros términos de búsqueda o agrega un nuevo dispositivo" : 
                                "Comienza agregando tu primer dispositivo utilizando el formulario de la izquierda"
                              }
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    ) : (
                      filteredDevices.map((device) => (
                        <TableRow key={device.deviceId} 
                          sx={{ 
                            transition: "background-color 0.2s",
                            "&:hover": { 
                              backgroundColor: "rgba(76, 175, 80, 0.04)"
                            }
                          }}
                        >
                          <StyledTableCell>
                            <DeviceCard>
                              <DeviceAvatar>
                                <Devices fontSize="small" />
                              </DeviceAvatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {device.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {device.deviceId}
                                </Typography>
                              </Box>
                            </DeviceCard>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip 
                              icon={<LocationOn fontSize="small" />} 
                              label={device.location} 
                              size="small"
                              sx={{ 
                                bgcolor: "rgba(0, 0, 0, 0.04)",
                                fontWeight: 500,
                                borderRadius: "6px"
                              }} 
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                  Usuario:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {device.username}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                                  Contraseña:
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {showPassword ? device.password : "••••••••"}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={handleClickShowPassword}
                                    sx={{ ml: 0.5, p: 0.5 }}
                                  >
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "monospace", 
                                fontWeight: 500,
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.75rem"
                              }}
                            >
                              {device.topic}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="Eliminar dispositivo">
                              <IconButton
                                onClick={() => handleOpenDeleteDialog(device)}
                                color="error"
                                size="small"
                                sx={{ 
                                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 0.2)",
                                  }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Fade>
          </Box>
        )}

        {/* Diálogo de confirmación de eliminación */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDeleteDialog}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              padding: "8px",
              margin: isMobile ? "16px" : "auto",
              width: isMobile ? "calc(100% - 32px)" : "auto",
              maxWidth: isMobile ? "none" : "450px"
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "rgba(244, 67, 54, 0.1)", color: "#F44336", mr: 2 }}>
                <Warning />
              </Avatar>
              <Typography variant="h6">Confirmar eliminación</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              ¿Estás seguro que deseas eliminar el dispositivo <strong>{deviceToDelete?.name}</strong>?
              <br/>Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button 
              onClick={handleCloseDeleteDialog}
              variant="outlined"
              sx={{ 
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteDevice}
              color="error"
              startIcon={<Delete />}
              variant="contained"
              sx={{ 
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 8px rgba(244, 67, 54, 0.25)",
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ 
            vertical: isMobile ? "top" : "bottom", 
            horizontal: "center" 
          }}
          sx={{
            mb: isMobile ? 0 : 2,
            mt: isMobile ? 7 : 0
          }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default DevicesList;