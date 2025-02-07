import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Email, Lock, VerifiedUser } from "@mui/icons-material";
import { 
  Snackbar, 
  Alert, 
  CircularProgress, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button as MuiButton 
} from "@mui/material";

function Login({ setUserId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isRootLogin, setIsRootLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState('email'); // 'email', 'code', 'password'
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);

  const navigate = useNavigate();

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Enviar correo de recuperación
  const handleSendResetEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://loikijgpnc.execute-api.us-east-1.amazonaws.com/send-reset-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showSnackbar("Correo de recuperación enviado exitosamente", "success");
        setRecoveryStage("code");
      } else {
        showSnackbar(data.message || "Error al enviar correo de recuperación", "error");
      }
    } catch (error) {
      showSnackbar("Error al enviar correo de recuperación", "error");
    } finally {
      setLoading(false);
    }
  };
  // Verificar código de recuperación
  const handleVerifyResetCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://loikijgpnc.execute-api.us-east-1.amazonaws.com/verify-reset-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, code: resetCode }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        showSnackbar("Código verificado exitosamente", "success");
        setRecoveryStage("password");
      } else {
        showSnackbar(data.message || "Código inválido", "error");
      }
    } catch (error) {
      showSnackbar("Error al verificar código", "error");
    } finally {
      setLoading(false);
    }
  };

 
// En el diálogo de recuperación, actualiza el handleResetPassword:
const handleResetPassword = async () => {
  if (newPassword !== confirmNewPassword) {
    showSnackbar("Las contraseñas no coinciden", "error");
    return;
  }

  try {
    setLoading(true);
    const response = await fetch(
      "https://loikijgpnc.execute-api.us-east-1.amazonaws.com/update-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail, // Asegurar que se envía el email
          newPassword,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en la actualización");
    }

    showSnackbar("¡Contraseña actualizada correctamente!", "success");
    setIsRecoveryDialogOpen(false);
    
  } catch (error) {
    showSnackbar(error.message, "error");
  } finally {
    setLoading(false);
  }
};
  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://e3vvtcxv1k.execute-api.us-east-1.amazonaws.com/send-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setIsVerifying(true);
        showSnackbar("Código de verificación enviado al correo", "success");
      } else {
        showSnackbar(data.message || "Error al enviar código", "error");
      }
    } catch (error) {
      showSnackbar("Error al enviar código de verificación", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://e3vvtcxv1k.execute-api.us-east-1.amazonaws.com/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        showSnackbar("Email verificado exitosamente", "success");
        setIsVerifying(false);
        // Proceder con el registro
        handleRegister();
      } else {
        showSnackbar(data.message || "Código inválido", "error");
      }
    } catch (error) {
      showSnackbar("Error al verificar código", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showSnackbar("Las contraseñas no coinciden", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://aet8yzih98.execute-api.us-east-1.amazonaws.com/create_user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        showSnackbar("Usuario creado exitosamente", "success");
        setIsLogin(true);
      } else {
        showSnackbar(data.message || "Error al crear usuario", "error");
      }
    } catch (error) {
      showSnackbar("Error al crear usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        isRootLogin
          ? "https://aet8yzih98.execute-api.us-east-1.amazonaws.com/root_login"
          : "https://aet8yzih98.execute-api.us-east-1.amazonaws.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        // Guardar token y userId en localStorage **antes** de navegar
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setUserId(data.userId);  // <--- avisamos a App.jsx

        localStorage.setItem("userType", data.userType);

 
        // Mostrar alerta de éxito
        showSnackbar("Inicio de sesión exitoso", "success");

        // Redirigir a dashboard
        setTimeout(() => {
          navigate("/dashboard");
          // Como respaldo, usar window.location si no redirige
          if (!window.location.pathname.includes("dashboard")) {
            window.location.href = "/dashboard";
          }
        }, 1000);
      } else {
        showSnackbar(data.message || "Error al iniciar sesión", "error");
      }
    } catch (error) {
      showSnackbar("Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      // Registro
      if (!isVerifying) {
        handleSendVerificationCode();
      } else {
        handleVerifyCode();
      }
      return;
    }

    // Login
    handleLogin();
  };

  const toggleLoginType = () => {
    setIsRootLogin(!isRootLogin);
    setEmail("");
    setPassword("");
  };

  const handleOpenRecoveryDialog = () => {
    setIsRecoveryDialogOpen(true);
    setRecoveryStage('email');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleCloseRecoveryDialog = () => {
    setIsRecoveryDialogOpen(false);
    setRecoveryStage('email');
  };

  return (
    <div className="container">
      <div className="info-section">
        <h1 className="title">SAIT</h1>
        <p className="description">
          SAIT es una plataforma de IoT diseñada para monitoreo remoto y
          eficiente.
        </p>
      </div>

      <div className="login-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>

          <h2 className="form-title">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          {/* Formulario de Login */}
          {isLogin ? (
            isRootLogin ? (
              <>
                <TextField
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    marginTop: "20px",
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <div className="input-container">
                    <Email className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                  </div>
                </div>
              </>
            )
          ) : (
            // Formulario de Registro y Verificación
            <>
              {!isVerifying ? (
                // Paso 1: Email y Contraseña
                <>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <div className="input-container">
                      <Email className="input-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <div className="input-container">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirmar Contraseña</label>
                    <div className="input-container">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu contraseña"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Paso 2: Código de Verificación
                <div className="form-group">
                  <label>Código de Verificación</label>
                  <div className="input-container">
                    <VerifiedUser className="input-icon" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Ingresa el código"
                      required
                    />
                  </div>
                  <p className="verification-text">
                    Se ha enviado un código de verificación a tu correo electrónico.
                  </p>
                </div>
              )}
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isLogin ? (
              "Iniciar Sesión"
            ) : isVerifying ? (
              "Verificar Código"
            ) : (
              "Registrarse"
            )}
          </button>

          {isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <Button
                variant="outlined"
                onClick={handleOpenRecoveryDialog}
                fullWidth
                sx={{
                  marginTop: "20px",
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": { 
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    borderColor: "#45a049" 
                  },
                }}
              >
                Recuperar Contraseña
              </Button>
            </div>
          )}

          {/* Sección de texto para alternar entre Login y Registro */}
          <p className="toggle-form">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setIsVerifying(false);
                setError("");
              }}
              style={{
                color: "#4caf50",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
                marginLeft: "5px",
              }}
            >
              {isLogin ? "Regístrate" : "Inicia Sesión"}
            </span>
          </p>

          {isLogin && (
            <Button
              variant="outlined"
              onClick={() => navigate("/login1")}
              fullWidth
              sx={{
                marginTop: "20px",
                color: "#4caf50",
                borderColor: "#4caf50",
                "&:hover": {
                  backgroundColor: "#e8f5e9",
                  borderColor: "#45a049",
                },
              }}
            >
              {isRootLogin ? "Cambiar a Usuario Normal" : "Cambiar a Usuario Normal"}
            </Button>
          )}
        </form>
      </div>

      <Dialog
        open={isRecoveryDialogOpen}
        onClose={handleCloseRecoveryDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Recuperar Contraseña</DialogTitle>
        <DialogContent>
          {recoveryStage === 'email' && (
            <>
              <TextField
                label="Correo Electrónico"
                variant="outlined"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleSendResetEmail}
                fullWidth
                sx={{
                  marginTop: "20px",
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
                disabled={loading}
              >
                Enviar correo de recuperación
              </Button>
            </>
          )}
          {recoveryStage === 'code' && (
            <>
              <TextField
                label="Código de Verificación"
                variant="outlined"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleVerifyResetCode}
                fullWidth
                sx={{
                  marginTop: "20px",
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
                disabled={loading}
              >
                Verificar código
              </Button>
            </>
          )}
          {recoveryStage === 'password' && (
            <>
              <TextField
                label="Nueva Contraseña"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Confirmar Nueva Contraseña"
                type="password"
                variant="outlined"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleResetPassword}
                fullWidth
                sx={{
                  marginTop: "20px",
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#45a049" },
                }}
                disabled={loading}
              >
                Restablecer Contraseña
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecoveryDialog} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Login;
