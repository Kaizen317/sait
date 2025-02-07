import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Person, Lock } from "@mui/icons-material";
import { Button, TextField, CircularProgress, Box, Typography, Snackbar, Alert } from "@mui/material";

function Login1() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch("https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/loginroluser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al iniciar sesión");
      }
  
      const data = await response.json();
      console.log("API Login Response:", data);
  
      // Guardar información en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("subaccountId", data.subaccountId);
      localStorage.setItem("userType", data.userType || "normal");
      localStorage.setItem("navbarAccess", JSON.stringify(data.navbarAccess || [])); 
      
      console.log("navbaraccess:", data.navbarAccess);
      console.log("userType:", data.userType);

      // Guardar subdashboards en localStorage (opcional)
      if (data.subdashboards) {
        localStorage.setItem("subdashboards", JSON.stringify(data.subdashboards));
      }
  
      console.log("Token stored in localStorage:", localStorage.getItem("token"));
      console.log("User Type stored in localStorage:", localStorage.getItem("userType"));
  
      // Determinar a qué ruta redirigir
      const userNavAccess = data.navbarAccess || [];
      const defaultRoute = "/dashboard";
      const routeToGo = userNavAccess.length > 0 ? userNavAccess[0] : defaultRoute;
      
      // Navegar a la primera ruta disponible, o a /dashboard si no hay
      navigate(routeToGo, { state: { subdashboards: data.subdashboards } });
  
      // Mostrar mensaje de éxito
      setSnackbar({ open: true, message: "Inicio de sesión exitoso", severity: "success" });
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setSnackbar({ open: true, message: error.message || "Error al iniciar sesión", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "20px", color: "#333", fontWeight: "bold" }}>
          Iniciar Sesión
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <Person position="start" />,
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <Lock position="start" />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: "20px", backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#45a049" } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar Sesión"}
          </Button>
        </form>
        <Button
          variant="outlined"
          onClick={() => navigate("/login")}
          sx={{ marginTop: "20px", color: "#4caf50", borderColor: "#4caf50", "&:hover": { borderColor: "#45a049" } }}
        >
          Cambiar a Usuario Raíz
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login1;
