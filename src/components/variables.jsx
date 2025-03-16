import React, { useState, useEffect, useContext } from "react";
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
import AddIcon from "@mui/icons-material/Add"; // Importa el ícono de "más"
import DeleteIcon from "@mui/icons-material/Delete"; // Importa el ícono de eliminación
import { styled } from "@mui/system";
import { MqttContext } from "./MqttContext";

// Estilo personalizado para las tarjetas
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
}));

// Función para formatear fechas
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const VariablesList = () => {
  const [newVariable, setNewVariable] = useState({
    variableKey: "",
    name: "",
    description: "",
  });
  const [variables, setVariables] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar el modal
  const [dialogOpen, setDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [loading, setLoading] = useState(true);
  const { mqttData, userId } = useContext(MqttContext);
  const apiBaseUrl = "https://mt1snfrnuj.execute-api.us-east-1.amazonaws.com/variables";

  // Efecto para mostrar el token
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token almacenado:', token);
  }, []);

  // Función para manejar la expiración del token
  const handleTokenExpiration = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchVariables = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbarMessage("No hay token disponible. Inicia sesión nuevamente.");
        setSnackbarOpen(true);
        handleTokenExpiration();
        return;
      }
  
      try {
        const response = await fetch("https://mt1snfrnuj.execute-api.us-east-1.amazonaws.com/variables", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
  
        if (response.status === 401) {
          setSnackbarMessage("La sesión ha expirado. Por favor, inicia sesión nuevamente.");
          setSnackbarOpen(true);
          handleTokenExpiration();
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error en la respuesta:", errorData);
          setSnackbarMessage(`Error: ${errorData.error || "No se pudieron cargar las variables."}`);
          setSnackbarOpen(true);
          return;
        }
  
        const data = await response.json();
        setVariables(data.variables || []);
      } catch (error) {
        console.error("Error en la solicitud:", error);
        setSnackbarMessage("Hubo un error al conectar con el servidor.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVariables();
  }, [userId]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    setNewVariable({
      ...newVariable,
      [e.target.name]: e.target.value,
    });
  };

  // Modificar handleAddVariable
  const handleAddVariable = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbarMessage("No hay token disponible. Inicia sesión nuevamente.");
      setSnackbarOpen(true);
      handleTokenExpiration();
      return;
    }
    const { variableKey, name, description } = newVariable;
  
    if (!userId) {
      setSnackbarMessage("El usuario no está logueado.");
      setSnackbarOpen(true);
      return;
    }
  
    if (!variableKey || !name || !description) {
      setSnackbarMessage("Todos los campos son obligatorios.");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const payload = {
        userId,
        variableKey,
        name,
        description,
      };
  
      const response = await fetch(apiBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Incluir el token aquí
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error: ${errorData.error || "No se pudo agregar la variable."}`);
        setSnackbarOpen(true);
        return;
      }
  
      const newVariableData = await response.json();
      setVariables((prevVariables) => [...prevVariables, newVariableData]);
      setNewVariable({ variableKey: "", name: "", description: "" });
      setModalOpen(false);
      setSnackbarMessage("Variable agregada con éxito.");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Hubo un error al conectar con el servidor.");
      setSnackbarOpen(true);
    }
  };

  // Abrir modal para añadir variable
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = (variable) => {
    setVariableToDelete(variable);
    setDialogOpen(true);
  };

  // Cerrar diálogo de confirmación
  const handleCloseDeleteDialog = () => {
    setDialogOpen(false);
    setConfirmationInput("");
  };

  // Eliminar una variable
  const handleDeleteVariable = async () => {
    if (confirmationInput !== "confirmar") {
      setSnackbarMessage("Escribe 'confirmar' para eliminar la variable.");
      setSnackbarOpen(true);
      return;
    }
    try {
      const response = await fetch(
        `${apiBaseUrl}?userId=${userId}&variableKey=${variableToDelete.variableKey}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error: ${errorData.error || "No se pudo eliminar la variable."}`);
        setSnackbarOpen(true);
        return;
      }
      setVariables((prevVariables) =>
        prevVariables.filter((variable) => variable.variableKey !== variableToDelete.variableKey)
      );
      setSnackbarMessage("Variable eliminada con éxito.");
      setSnackbarOpen(true);
      handleCloseDeleteDialog();
    } catch (error) {
      setSnackbarMessage("Hubo un error al eliminar la variable.");
      setSnackbarOpen(true);
    }
  };

  // Cerrar Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <NavBar />
      {!localStorage.getItem('token') && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: No se encontró token de autenticación
        </Alert>
      )}
      {/* Contenedor principal con padding-top */}
      <Box
        sx={{
          marginTop: "80px",
          marginLeft: "240px", // Espacio para el navbar
          padding: "20px",
          width: "calc(100% - 260px)", // Ancho ajustado al navbar
          height: "calc(100vh - 100px)",
          overflow: "auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "margin-left 0.3s, width 0.3s", // Transición suave
          '@media (max-width: 600px)': {
            marginLeft: "60px",
            width: "calc(100% - 80px)"
          }
        }}
      >
        {/* Botón centrado para añadir variable */}
        <Box display="flex" justifyContent="center" marginBottom={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal} // Aquí llamamos a la función handleOpenModal
            sx={{
              padding: "10px 20px",
              fontSize: "1rem",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            Añadir Variable
          </Button>
        </Box>

        {/* Mostrar variables */}
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Clave</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Último Valor</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variables.map((variable, index) => (
                  <TableRow key={index}>
                    <TableCell>{variable.name}</TableCell>
                    <TableCell>{variable.variableKey}</TableCell>
                    <TableCell>{variable.description}</TableCell>
                    <TableCell>
                      {mqttData[variable.variableKey] && (
                        <Typography variant="body2">
                          Último valor:
                          <br />
                          {JSON.stringify(mqttData[variable.variableKey], null, 2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(variable)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal para añadir variable */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>Añadir Nueva Variable</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Clave de la Variable"
              name="variableKey"
              value={newVariable.variableKey}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Nombre"
              name="name"
              value={newVariable.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Descripción"
              name="description"
              value={newVariable.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleAddVariable} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog open={dialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Eliminar Variable</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar la variable "{variableToDelete?.name}"?
              <br />
              Escribe "confirmar" para proceder.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Confirmación"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteVariable} color="error">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para mensajes */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="info">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default VariablesList;