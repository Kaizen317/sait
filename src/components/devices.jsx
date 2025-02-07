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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const apiBaseUrl = "https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices";

  useEffect(() => {
    const fetchDevices = async () => {
      if (!userId) {
        setSnackbarMessage("El usuario no está logueado.");
        setSnackbarOpen(true);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          setSnackbarMessage(`Error: ${errorData.error || "No se pudieron cargar los dispositivos."}`);
          setSnackbarOpen(true);
          return;
        }
        const data = await response.json();
        setDevices(data.devices || []);
      } catch (error) {
        setSnackbarMessage("Hubo un error al conectar con el servidor.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [userId]);

  const handleInputChange = (e) => {
    setNewDevice({
      ...newDevice,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddDevice = async () => {
    const { deviceId, name, location } = newDevice;

    if (!userId) {
      setSnackbarMessage("El usuario no está logueado.");
      setSnackbarOpen(true);
      return;
    }

    if (!deviceId || !name || !location) {
      setSnackbarMessage("Todos los campos son obligatorios.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const payload = {
        userId,
        deviceId,
        name,
        location,
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
        setSnackbarOpen(true);
        return;
      }

      const newDeviceData = await response.json();
      setDevices((prevDevices) => [...prevDevices, newDeviceData]);
      setNewDevice({ deviceId: "", name: "", location: "" });

      setSnackbarMessage("Dispositivo agregado con éxito.");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Hubo un error al conectar con el servidor.");
      setSnackbarOpen(true);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenDeleteDialog = (device) => {
    setDeviceToDelete(device);
    setDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDialogOpen(false);
    setConfirmationInput("");
  };

  const handleDeleteDevice = async () => {
    if (confirmationInput !== "confirmar") {
      setSnackbarMessage("Escribe 'confirmar' para eliminar el dispositivo.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}?userId=${userId}&deviceId=${deviceToDelete.deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error: ${errorData.error || "No se pudo eliminar el dispositivo."}`);
        setSnackbarOpen(true);
        return;
      }

      setDevices((prevDevices) =>
        prevDevices.filter((device) => device.deviceId !== deviceToDelete.deviceId)
      );

      setSnackbarMessage("Dispositivo eliminado con éxito.");
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbarMessage("Hubo un error al eliminar el dispositivo.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-6" style={{ marginLeft: "250px" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h5"
                    style={{
                      textAlign: "center",
                      marginBottom: "20px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    Agregar Nuevo Dispositivo
                  </Typography>
                  <form className="flex flex-col space-y-4">
                    <TextField
                      label="ID de dispositivo"
                      name="deviceId"
                      variant="outlined"
                      fullWidth
                      value={newDevice.deviceId}
                      onChange={handleInputChange}
                    />
                    <TextField
                      label="Nombre"
                      name="name"
                      variant="outlined"
                      fullWidth
                      value={newDevice.name}
                      onChange={handleInputChange}
                    />
                    <TextField
                      label="Ubicación"
                      name="location"
                      variant="outlined"
                      fullWidth
                      value={newDevice.location}
                      onChange={handleInputChange}
                    />
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleAddDevice}
                      style={{
                        backgroundColor: "#70bc7e",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Agregar Dispositivo
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      fullWidth
                      onClick={handleOpenModal}
                      style={{
                        marginTop: "15px",
                        color: "#70bc7e",
                        fontWeight: "bold",
                      }}
                    >
                      Ver Dispositivos
                    </Button>
                  </form>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}
      </div>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xl" fullWidth>
        <DialogTitle>Lista de Dispositivos</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} style={{ borderRadius: "16px", overflow: "hidden" }}>
            <Table>
              <TableHead style={{ backgroundColor: "#70bc7e" }}>
                <TableRow>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Device ID</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Ubicación</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Username</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Password</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Topic</TableCell>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device, index) => (
                  <TableRow key={index}>
                    <TableCell>{device.deviceId}</TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{device.username}</TableCell>
                    <TableCell>{device.password}</TableCell>
                    <TableCell>{device.topic}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(device)}
                        style={{ backgroundColor: "#F44336", color: "white" }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} style={{ color: "#70bc7e", fontWeight: "bold" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Escribe <strong>"confirmar"</strong> para eliminar el dispositivo: {deviceToDelete?.name}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Escribe confirmar"
            fullWidth
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteDevice}
            color="secondary"
            disabled={confirmationInput.toLowerCase() !== "confirmar"}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DevicesList;