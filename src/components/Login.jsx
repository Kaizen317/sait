import React, { useState, useEffect } from "react";
import "./Login.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import {
  Email,
  Lock,
  VerifiedUser,
  LoginOutlined,
  PersonAddOutlined,
  KeyOutlined,
  ArrowForwardIos,
  MailOutline,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
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
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Fade,
  Divider,
  Paper,
  Slide,
  useTheme,
  useMediaQuery,
  alpha,
  styled
} from "@mui/material";

// Definición de paleta de colores profesional
const COLORS = {
  primary: "#006875",         // Azul principal (color de la navbar)
  primaryLight: "#338c98",    // Azul claro para hover y efectos
  primaryDark: "#004b55",     // Azul más oscuro para estados activos
  secondary: "#0095a8",       // Azul secundario
  secondaryLight: "#33aab9",  // Azul claro para acentos
  text: "#1a2127",            // Texto oscuro para mejor legibilidad
  textSecondary: "#546e7a",   // Texto secundario
  background: "#ffffff",      // Fondo blanco
  backgroundAlt: "#f8f9fa",   // Fondo alternativo
  border: "#dee2e6",          // Color de borde
  surface: "#ffffff",         // Superficie de componentes
  error: "#d32f2f",           // Rojo para errores
  success: "#2e7d32",         // Verde para éxitos
  warning: "#f57c00"          // Naranja para advertencias
};

// Estilos personalizados para componentes MUI
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.2s ease",
    backgroundColor: alpha("#f8f9fa", 0.5),
    "&:hover": {
      backgroundColor: alpha("#f8f9fa", 0.8)
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: alpha(COLORS.primary, 0.5)
    },
    "&.Mui-focused": {
      backgroundColor: alpha("#f8f9fa", 0.8)
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: COLORS.primary,
      borderWidth: "2px"
    }
  },
  "& .MuiOutlinedInput-input": {
    padding: theme.spacing(1.7, 2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.2, 1.5), // Reducir padding en móviles
      fontSize: "0.9rem", // Reducir tamaño de fuente
    },
    "&:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 100px ${alpha("#f8f9fa", 0.8)} inset`,
      WebkitTextFillColor: COLORS.text
    }
  },
  "& .MuiInputLabel-root": {
    color: COLORS.textSecondary,
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.9rem", // Reducir tamaño de la etiqueta en móviles
    },
    "&.Mui-focused": {
      color: COLORS.primary,
      fontWeight: 600
    }
  }
}));

// Botón principal estilizado
const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
  boxShadow: "0 4px 12px rgba(0, 104, 117, 0.2)",
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  background: `linear-gradient(45deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
  letterSpacing: "0.5px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1), // Reducir padding en móviles
    fontSize: "0.9rem", // Reducir tamaño de fuente
  },
  "&:hover": {
    boxShadow: "0 6px 16px rgba(0, 104, 117, 0.25)",
    background: `linear-gradient(45deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
    transform: "translateY(-2px)"
  },
  "&:active": {
    transform: "translateY(1px)",
    boxShadow: "0 2px 8px rgba(0, 104, 117, 0.2)"
  },
  "&.Mui-disabled": {
    background: alpha(COLORS.primary, 0.5),
    color: "#fff"
  }
}));

// Botón secundario estilizado
const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2),
  fontWeight: 500,
  textTransform: "none",
  fontSize: "0.95rem",
  color: COLORS.primary,
  borderColor: alpha(COLORS.primary, 0.5),
  transition: "all 0.25s ease",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.8), // Reducir padding en móviles
    fontSize: "0.85rem", // Reducir tamaño de fuente
  },
  "&:hover": {
    borderColor: COLORS.primary,
    backgroundColor: alpha(COLORS.primary, 0.05),
    transform: "translateY(-2px)"
  },
  "&:active": {
    transform: "translateY(0px)"
  }
}));

// Componente estilizado para la sección de login
const StyledLoginSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  width: "100%",
  maxWidth: 440,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 15px 50px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-5px)"
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`
  }
}));

function Login({ setUserId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isRootLogin, setIsRootLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState("email");
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    // Efecto de fade-in al cargar
    setFadeIn(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
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
          body: JSON.stringify({ email: resetEmail })
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
          body: JSON.stringify({ email: resetEmail, code: resetCode })
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
            email: resetEmail,
            newPassword
          })
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
          body: JSON.stringify({ email })
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
        "https://e3vvtcxv1k.execute-api.us-east-1.amazonaws.com/send-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode })
        }
      );
      const data = await response.json();
      if (response.ok) {
        showSnackbar("Email verificado exitosamente", "success");
        setIsVerifying(false);
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
          body: JSON.stringify({ email, password })
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
          body: JSON.stringify({ email, password })
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setUserId(data.userId);
        localStorage.setItem("userType", data.userType);
        showSnackbar("Inicio de sesión exitoso", "success");
        setTimeout(() => {
          navigate("/dashboard");
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
      if (!isVerifying) {
        handleSendVerificationCode();
      } else {
        handleVerifyCode();
      }
      return;
    }
    handleLogin();
  };

  const toggleLoginType = () => {
    setIsRootLogin(!isRootLogin);
    setEmail("");
    setPassword("");
  };

  const handleOpenRecoveryDialog = () => {
    setIsRecoveryDialogOpen(true);
    setRecoveryStage("email");
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleCloseRecoveryDialog = () => {
    setIsRecoveryDialogOpen(false);
    setRecoveryStage("email");
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      className="container"
      sx={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Sección info con efectos animados */}
      <Box
        className="info-section"
        sx={{
          position: "relative",
          width: { xs: "0", md: "55%" },
          bgcolor: "#006875",
          backgroundImage: "linear-gradient(135deg, #00647a 0%, #004a59 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden"
        }}
      >
        {/* Fondo con gradiente y efectos */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #006875 0%, #004a59 100%)",
            overflow: "hidden"
          }}
        />
        {/* Patrones de fondo */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
            background: `radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1), transparent 70%),
                     radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 60%),
                     radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 40%)`
          }}
        />
        {/* Líneas de cuadrícula */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.07,
            background: `
            linear-gradient(0deg, transparent 99%, rgba(255,255,255,0.3) 100%) 0 0 / 40px 40px,
            linear-gradient(90deg, transparent 99%, rgba(255,255,255,0.3) 100%) 0 0 / 40px 40px
          `,
            animation: "moveGrid 40s linear infinite",
            "@keyframes moveGrid": {
              from: { transform: "translate(0, 0)" },
              to: { transform: "translate(40px, 40px)" }
            }
          }}
        />
        {/* Partículas flotantes */}
        <Box sx={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}>
          {[...Array(50)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: `${1 + Math.random() * 6}px`,
                height: `${1 + Math.random() * 6}px`,
                background: `rgba(255,255,255,${0.3 + Math.random() * 0.5})`,
                borderRadius: "50%",
                boxShadow: `0 0 ${5 + Math.random() * 10}px rgba(255,255,255,0.8)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite ${Math.random() * 5}s, 
                           twinkle ${3 + Math.random() * 5}s ease-in-out infinite ${Math.random() * 3}s`,
                "@keyframes float": {
                  "0%": {
                    transform: `translateY(0px) translateX(0px)`,
                  },
                  "50%": {
                    transform: `translateY(${-10 - Math.random() * 20}px) translateX(${5 + Math.random() * 10}px)`,
                  },
                  "100%": {
                    transform: `translateY(0px) translateX(0px)`,
                  },
                },
                "@keyframes twinkle": {
                  "0%": { opacity: 0.3 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.3 },
                },
              }}
            />
          ))}
          {/* Estrellas más grandes y brillantes */}
          {[...Array(10)].map((_, i) => (
            <Box
              key={`big-star-${i}`}
              sx={{
                position: "absolute",
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                background: `rgba(255,255,255,0.9)`,
                borderRadius: "50%",
                boxShadow: `0 0 ${10 + Math.random() * 15}px rgba(255,255,255,0.9), 
                           0 0 ${20 + Math.random() * 30}px rgba(255,255,255,0.5)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `bigStarTwinkle ${4 + Math.random() * 6}s ease-in-out infinite ${Math.random() * 3}s`,
                "@keyframes bigStarTwinkle": {
                  "0%": { opacity: 0.5, transform: "scale(0.8)" },
                  "50%": { opacity: 1, transform: "scale(1.2)" },
                  "100%": { opacity: 0.5, transform: "scale(0.8)" },
                },
              }}
            />
          ))}
        </Box>
        {/* Círculos tecnológicos */}
        <Box
          sx={{
            position: "absolute",
            left: "15%",
            top: "60%",
            width: "180px",
            height: "180px",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            animation: "rotate 25s linear infinite",
            "@keyframes rotate": {
              from: { transform: "rotate(0deg)" },
              to: { transform: "rotate(360deg)" }
            },
            "&::before": {
              content: '""',
              position: "absolute",
              width: "10px",
              height: "10px",
              background: "#2ECC71",
              borderRadius: "50%",
              top: "50%",
              left: "-5px",
              boxShadow: "0 0 20px #2ECC71"
            },
            "&::after": {
              content: '""',
              position: "absolute",
              width: "15px",
              height: "15px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              bottom: "30px",
              right: "40px"
            }
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: "10%",
            top: "30%",
            width: "120px",
            height: "120px",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            animation: "rotate 18s linear infinite reverse",
            "&::before": {
              content: '""',
              position: "absolute",
              width: "8px",
              height: "8px",
              background: "#3498DB",
              borderRadius: "50%",
              top: "30px",
              right: "-4px",
              boxShadow: "0 0 15px #3498DB"
            }
          }}
        />
        {/* Contenido principal */}
        <Fade in={fadeIn} timeout={1500}>
          <Box
            sx={{
              position: "relative",
              width: "90%",
              maxWidth: 800,
              textAlign: "center",
              zIndex: 1
            }}
          >
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              minHeight: "200px"
            }}>
              <Fade in={true} timeout={1000}>
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    mb: 2,
                    letterSpacing: "-0.5px",
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    textAlign: "center"
                  }}
                >
                  {[
                    "Sistema Integral de Monitoreo IoT",
                    "Visualización en Tiempo Real",
                    "Control Total de Dispositivos",
                    "Análisis Avanzado de Datos"
                  ][currentTextIndex]}
                </Typography>
              </Fade>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Sección de login */}
      <Box
        className="login-section"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, md: 3 },
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            background: "radial-gradient(circle at 10% 20%, #0d904f 0%, transparent 20%), radial-gradient(circle at 90% 80%, #006875 0%, transparent 20%)",
            pointerEvents: "none"
          }}
        />
        <Fade in={fadeIn} timeout={800}>
          <StyledLoginSection>
            <Box
              component="form"
              className="login-form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                position: "relative",
                zIndex: 1
              }}
            >
              {/* Logo */}
              <Box
                className="logo-container"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 3,
                  position: "relative"
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "rgba(13, 144, 79, 0.1)",
                    boxShadow: "0 0 0 8px rgba(13, 144, 79, 0.05)",
                    transition: "all 0.3s ease",
                    p: 2,
                    "&:hover": {
                      transform: "scale(1.05) rotate(3deg)",
                      boxShadow: "0 0 0 10px rgba(13, 144, 79, 0.08)"
                    }
                  }}
                >
                  <img
                    src={logo}
                    alt="Logo"
                    className="logo-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </Box>
              </Box>
              <Slide direction="down" in={true} timeout={600}>
                <Typography
                  variant="h4"
                  className="form-title"
                  sx={{
                    fontWeight: 700,
                    color: COLORS.primary,
                    textAlign: "center",
                    mb: 3,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "40px",
                      height: "3px",
                      background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                      borderRadius: "2px"
                    }
                  }}
                >
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </Typography>
              </Slide>
              {isLogin ? (
                isRootLogin ? (
                  <>
                    <StyledTextField
                      label="Email"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutline sx={{ color: COLORS.primary }} />
                          </InputAdornment>
                        )
                      }}
                      autoComplete="email"
                    />
                    <StyledTextField
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: COLORS.primary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: COLORS.textSecondary,
                                "&:hover": { color: COLORS.primary }
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      autoComplete="current-password"
                    />
                    <PrimaryButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      startIcon={!loading && <LoginOutlined />}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar Sesión"}
                    </PrimaryButton>
                  </>
                ) : (
                  <>
                    <StyledTextField
                      label="Correo Electrónico"
                      variant="outlined"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutline sx={{ color: COLORS.primary }} />
                          </InputAdornment>
                        )
                      }}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                    <StyledTextField
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: COLORS.primary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: COLORS.textSecondary,
                                "&:hover": { color: COLORS.primary }
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                    <PrimaryButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      startIcon={!loading && <LoginOutlined />}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar Sesión"}
                    </PrimaryButton>
                  </>
                )
              ) : (
                <>
                  {!isVerifying ? (
                    <>
                      <StyledTextField
                        label="Correo Electrónico"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutline sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          )
                        }}
                        placeholder="ejemplo@correo.com"
                        required
                      />
                      <StyledTextField
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                sx={{
                                  color: COLORS.textSecondary,
                                  "&:hover": { color: COLORS.primary }
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                      <StyledTextField
                        label="Confirmar Contraseña"
                        type={showPassword ? "text" : "password"}
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                sx={{
                                  color: COLORS.textSecondary,
                                  "&:hover": { color: COLORS.primary }
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        placeholder="Confirma tu contraseña"
                        required
                      />
                      <PrimaryButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        startIcon={!loading && <PersonAddOutlined />}
                        sx={{ mt: 2 }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Registrarse"}
                      </PrimaryButton>
                    </>
                  ) : (
                    <>
                      <StyledTextField
                        label="Código de Verificación"
                        variant="outlined"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VerifiedUser sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          )
                        }}
                        placeholder="Ingresa el código"
                        required
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          mb: 2,
                          color: COLORS.textSecondary,
                          p: 2,
                          bgcolor: alpha(COLORS.secondary, 0.05),
                          borderRadius: 2,
                          border: `1px solid ${alpha(COLORS.secondary, 0.1)}`
                        }}
                      >
                        Se ha enviado un código de verificación a tu correo electrónico.
                      </Typography>
                      <PrimaryButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        startIcon={!loading && <VerifiedUser />}
                        sx={{ mt: 2 }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar Código"}
                      </PrimaryButton>
                    </>
                  )}
                </>
              )}
              {error && (
                <Typography
                  className="error-message"
                  sx={{
                    color: COLORS.error,
                    mt: 2,
                    textAlign: "center",
                    fontWeight: 500
                  }}
                >
                  {error}
                </Typography>
              )}
              {isLogin && (
                <Fade in={true} style={{ transitionDelay: "300ms" }}>
                  <Box sx={{ mt: 3 }}>
                    <SecondaryButton
                      variant="outlined"
                      onClick={handleOpenRecoveryDialog}
                      fullWidth
                      startIcon={<KeyOutlined />}
                    >
                      Recuperar Contraseña
                    </SecondaryButton>
                  </Box>
                </Fade>
              )}
              <Divider sx={{ my: 3, borderColor: alpha(COLORS.primary, 0.1) }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    color: COLORS.textSecondary,
                    fontWeight: 500
                  }}
                >
                  o
                </Typography>
              </Divider>
              <Typography
                variant="body2"
                className="toggle-form"
                sx={{
                  textAlign: "center",
                  mb: 2,
                  color: COLORS.textSecondary
                }}
              >
                {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <Box
                  component="span"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setIsVerifying(false);
                    setError("");
                  }}
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  }}
                >
                  {isLogin ? "Regístrate" : "Inicia Sesión"}
                </Box>
              </Typography>
              {isLogin && (
                <SecondaryButton
                  variant="outlined"
                  onClick={() => navigate("/login1")}
                  fullWidth
                  startIcon={<ArrowForwardIos sx={{ fontSize: 18 }} />}
                  sx={{ mt: 1 }}
                >
                  Cambiar a Usuario Normal
                </SecondaryButton>
              )}
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, opacity: 0.7 }}>
                  {new Date().getFullYear()} SAIT-Monitoreo IoT. Todos los derechos reservados
                </Typography>
              </Box>
            </Box>
          </StyledLoginSection>
        </Fade>
      </Box>

      {/* Diálogo de Recuperación de contraseña */}
      <Dialog
        open={isRecoveryDialogOpen}
        onClose={handleCloseRecoveryDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "4px",
              background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`
            }
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            pt: 3,
            fontWeight: 600,
            color: COLORS.primary,
            textAlign: "center",
            fontSize: "1.5rem"
          }}
        >
          Recuperar Contraseña
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          {recoveryStage === "email" && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: COLORS.textSecondary }}>
                Ingresa tu correo electrónico para recibir un código de recuperación.
              </Typography>
              <StyledTextField
                label="Correo Electrónico"
                variant="outlined"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline sx={{ color: COLORS.primary }} />
                    </InputAdornment>
                  )
                }}
              />
              <PrimaryButton
                variant="contained"
                onClick={handleSendResetEmail}
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar correo"}
              </PrimaryButton>
            </>
          )}
          {recoveryStage === "code" && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: COLORS.textSecondary }}>
                Ingresa el código de verificación enviado a tu correo.
              </Typography>
              <StyledTextField
                label="Código de Verificación"
                variant="outlined"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUser sx={{ color: COLORS.primary }} />
                    </InputAdornment>
                  )
                }}
              />
              <PrimaryButton
                variant="contained"
                onClick={handleVerifyResetCode}
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar código"}
              </PrimaryButton>
            </>
          )}
          {recoveryStage === "password" && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: COLORS.textSecondary }}>
                Crea una nueva contraseña para tu cuenta.
              </Typography>
              <StyledTextField
                label="Nueva Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: COLORS.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: COLORS.textSecondary,
                          "&:hover": { color: COLORS.primary }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <StyledTextField
                label="Confirmar Nueva Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: COLORS.primary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: COLORS.textSecondary,
                          "&:hover": { color: COLORS.primary }
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <PrimaryButton
                variant="contained"
                onClick={handleResetPassword}
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Restablecer Contraseña"}
              </PrimaryButton>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseRecoveryDialog}
            color="primary"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: alpha(COLORS.primary, 0.05)
              }
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Efecto de visualización de datos 3D avanzado */}
      <Box sx={{ 
        position: "absolute", 
        width: "100%", 
        height: "100%", 
        perspective: "1200px",
        transformStyle: "preserve-3d",
        pointerEvents: "none",
        overflow: "hidden",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,15,30,0.95))"
      }}>
        {/* Cuadrícula principal */}
        <Box sx={{ 
          position: "absolute", 
          width: "300%", 
          height: "300%",
          top: "-100%",
          left: "-100%", 
          backgroundImage: `
            linear-gradient(rgba(0, 104, 117, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 104, 117, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: "rotateX(60deg) translateZ(-100px)",
          animation: "gridMove 30s linear infinite",
          "@keyframes gridMove": {
            "0%": { transform: "rotateX(60deg) translateZ(-100px) translateY(0%)" },
            "100%": { transform: "rotateX(60deg) translateZ(-100px) translateY(40px)" }
          }
        }}/>

        {/* Cuadrícula secundaria */}
        <Box sx={{ 
          position: "absolute", 
          width: "300%", 
          height: "300%",
          top: "-100%",
          left: "-100%", 
          backgroundImage: `
            linear-gradient(rgba(0, 104, 117, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 104, 117, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px",
          transform: "rotateX(60deg) translateZ(-50px)",
          animation: "gridMove2 20s linear infinite",
          "@keyframes gridMove2": {
            "0%": { transform: "rotateX(60deg) translateZ(-50px) translateY(0%)" },
            "100%": { transform: "rotateX(60deg) translateZ(-50px) translateY(10px)" }
          }
        }}/>

        {/* Ejes X, Y, Z */}
        <Box sx={{
          position: "absolute",
          width: "150%",
          height: "150%",
          top: "-25%",
          left: "-25%",
          transform: "rotateX(60deg) translateZ(-75px)",
          "& .axis": {
            position: "absolute",
            background: "rgba(255, 255, 255, 0.3)",
            transformOrigin: "0 0"
          },
          "& .x-axis": {
            width: "100%",
            height: "2px",
            top: "50%",
            left: 0,
          },
          "& .y-axis": {
            width: "2px",
            height: "100%",
            top: 0,
            left: "50%",
          },
          "& .z-axis": {
            width: "2px",
            height: "30%",
            top: "50%",
            left: "50%",
            transform: "rotateX(-60deg)",
            background: "linear-gradient(to top, rgba(255,255,255,0.3), rgba(255,255,255,0))"
          }
        }}>
          <Box className="axis x-axis" />
          <Box className="axis y-axis" />
          <Box className="axis z-axis" />
        </Box>

        {/* Puntos de datos (nodos) - Reducidos para mejorar rendimiento */}
        {[...Array(60)].map((_, i) => (
          <Box
            key={`data-point-${i}`}
            sx={{
              position: "absolute",
              width: `${2 + Math.random() * 5}px`,
              height: `${2 + Math.random() * 5}px`,
              background: i % 5 === 0 
                ? "rgba(0, 104, 117, 0.9)" // Azul (primario - color navbar)
                : i % 3 === 0 
                  ? "rgba(51, 140, 152, 0.9)" // Azul claro (secundario)
                  : i % 7 === 0
                    ? "rgba(255, 180, 0, 0.9)" // Amarillo (alertas)
                    : "rgba(255, 255, 255, 0.9)", // Blanco (default)
              borderRadius: "50%",
              boxShadow: i % 4 === 0 
                ? `0 0 8px rgba(0, 104, 117, 0.8)` 
                : i % 7 === 0
                  ? `0 0 8px rgba(255, 180, 0, 0.8)`
                  : `0 0 5px rgba(255, 255, 255, 0.6)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: 10,
              animation: `dataPoint ${5 + Math.random() * 10}s ease-in-out infinite ${Math.random() * 5}s`,
              "@keyframes dataPoint": {
                "0%": { opacity: 0.3, transform: `scale(0.8) translateZ(${Math.random() * 50}px)` },
                "50%": { opacity: 1, transform: `scale(1.2) translateZ(${50 + Math.random() * 100}px)` },
                "100%": { opacity: 0.3, transform: `scale(0.8) translateZ(${Math.random() * 50}px)` },
              },
            }}
          />
        ))}

        {/* Líneas de conexión entre puntos de datos - Reducidas para mejorar rendimiento */}
        {[...Array(30)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = startX + (Math.random() * 40 - 20);
          const endY = startY + (Math.random() * 40 - 20);
          const isHighlighted = i % 5 === 0;
          const isAlert = i % 11 === 0;
          
          return (
            <Box
              key={`data-line-${i}`}
              sx={{
                position: "absolute",
                width: `${Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))}%`,
                height: "1px",
                background: isAlert
                  ? "linear-gradient(90deg, rgba(255, 180, 0, 0.7), rgba(255, 180, 0, 0.1))"
                  : isHighlighted 
                    ? "linear-gradient(90deg, rgba(0, 104, 117, 0.7), rgba(0, 104, 117, 0.1))" 
                    : "linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05))",
                left: `${Math.min(startX, endX)}%`,
                top: `${Math.min(startY, endY)}%`,
                transform: `rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg)`,
                transformOrigin: "0 0",
                opacity: isAlert ? 0.9 : isHighlighted ? 0.8 : 0.3,
                animation: `dataLine ${8 + Math.random() * 12}s ease-in-out infinite ${Math.random() * 5}s`,
                "@keyframes dataLine": {
                  "0%": { opacity: isAlert ? 0.5 : 0.1, transform: `rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg) scaleX(0.8)` },
                  "50%": { opacity: isAlert ? 0.9 : isHighlighted ? 0.8 : 0.4, transform: `rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg) scaleX(1.1)` },
                  "100%": { opacity: isAlert ? 0.5 : 0.1, transform: `rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg) scaleX(0.8)` },
                },
              }}
            />
          );
        })}

        {/* Gráficos de datos flotantes - Reducidos para mejorar rendimiento */}
        {[...Array(8)].map((_, i) => {
          const width = 40 + Math.random() * 80;
          const height = 20 + Math.random() * 40;
          const graphType = i % 3; // 0: bar, 1: line, 2: pie
          
          return (
            <Box
              key={`data-graph-${i}`}
              sx={{
                position: "absolute",
                width: `${width}px`,
                height: `${height}px`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                opacity: 0.2,
                transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 100}px)`,
                animation: `floatGraph ${15 + Math.random() * 20}s ease-in-out infinite ${Math.random() * 10}s`,
                "@keyframes floatGraph": {
                  "0%": { 
                    opacity: 0.1, 
                    transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 50}px)` 
                  },
                  "50%": { 
                    opacity: 0.4, 
                    transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${50 + Math.random() * 100}px)` 
                  },
                  "100%": { 
                    opacity: 0.1, 
                    transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 50}px)` 
                  },
                },
              }}
            >
              {graphType === 0 ? (
                // Gráfico de barras
                [...Array(5)].map((_, j) => (
                  <Box
                    key={`bar-${i}-${j}`}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: `${j * (100 / 5)}%`,
                      width: `${80 / 5}%`,
                      height: `${10 + Math.random() * (height - 10)}px`,
                      background: j % 2 === 0 
                        ? "rgba(0, 104, 117, 0.7)" // Azul (primario - color navbar)
                        : "rgba(51, 140, 152, 0.7)", // Azul claro (secundario)
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                ))
              ) : graphType === 1 ? (
                // Gráfico de línea
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      width: "100%",
                      height: "2px",
                      background: "rgba(0, 104, 117, 0.7)",
                      top: `${Math.random() * 100}%`,
                      clipPath: `polygon(
                        0% 0%, 
                        ${10 + Math.random() * 10}% ${50 + Math.random() * 50}%, 
                        ${30 + Math.random() * 10}% ${Math.random() * 50}%, 
                        ${50 + Math.random() * 10}% ${70 + Math.random() * 30}%, 
                        ${70 + Math.random() * 10}% ${30 + Math.random() * 30}%, 
                        100% ${Math.random() * 100}%, 
                        100% 0%
                      )`,
                    }
                  }}
                />
              ) : (
                // Gráfico circular
                <Box
                  sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "rgba(30, 30, 30, 0.6)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      background: "conic-gradient(rgba(0, 104, 117, 0.7) 0% 25%, rgba(51, 140, 152, 0.7) 25% 55%, rgba(255, 180, 0, 0.7) 55% 70%, rgba(255, 255, 255, 0.5) 70% 100%)",
                    }
                  }}
                />
              )}
            </Box>
          );
        })}

        {/* Indicadores numéricos flotantes - Reducidos para mejorar rendimiento */}
        {[...Array(12)].map((_, i) => (
          <Box
            key={`data-number-${i}`}
            sx={{
              position: "absolute",
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              color: i % 5 === 0 
                ? "rgba(0, 104, 117, 0.8)" // Azul (primario - color navbar)
                : i % 7 === 0
                  ? "rgba(255, 180, 0, 0.8)"
                  : "rgba(255, 255, 255, 0.6)",
              fontSize: `${Math.random() * 4 + 8}px`,
              fontFamily: "monospace",
              fontWeight: "bold",
              textShadow: i % 5 === 0 
                ? "0 0 5px rgba(0, 104, 117, 0.8)" 
                : i % 7 === 0
                  ? "0 0 5px rgba(255, 180, 0, 0.8)"
                  : "0 0 5px rgba(255, 255, 255, 0.5)",
              opacity: 0.5,
              animation: `floatNumber ${10 + Math.random() * 15}s ease-in-out infinite ${Math.random() * 5}s`,
              "@keyframes floatNumber": {
                "0%": { opacity: 0.2, transform: `translateZ(${Math.random() * 50}px)` },
                "50%": { opacity: 0.7, transform: `translateZ(${50 + Math.random() * 100}px)` },
                "100%": { opacity: 0.2, transform: `translateZ(${Math.random() * 50}px)` },
              },
            }}
          >
            {i % 8 === 0 
              ? `${(Math.random() * 100).toFixed(2)}%` 
              : i % 6 === 0
                ? `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
                : (Math.random() > 0.5 
                  ? (Math.random() * 100).toFixed(1) 
                  : (Math.random() * 1000).toFixed(0))}
          </Box>
        ))}

        {/* Círculos de pulso (como ondas de radar) - Reducidos para mejorar rendimiento */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={`pulse-circle-${i}`}
            sx={{
              position: "absolute",
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: i % 3 === 0 
                ? "rgba(0, 104, 117, 0.9)" // Azul (primario - color navbar)
                : i % 5 === 0
                  ? "rgba(255, 180, 0, 0.9)"
                  : "rgba(51, 140, 152, 0.9)", // Azul claro (secundario)
              boxShadow: i % 3 === 0 
                ? "0 0 8px rgba(0, 104, 117, 0.8)" 
                : i % 5 === 0
                  ? "0 0 8px rgba(255, 180, 0, 0.8)"
                  : "0 0 8px rgba(51, 140, 152, 0.8)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "transparent",
                border: i % 3 === 0 
                  ? "1px solid rgba(0, 104, 117, 0.5)" 
                  : i % 5 === 0
                    ? "1px solid rgba(255, 180, 0, 0.5)"
                    : "1px solid rgba(51, 140, 152, 0.5)",
                transform: "translate(-50%, -50%)",
                animation: "pulseWave 4s ease-out infinite",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "transparent",
                border: i % 3 === 0 
                  ? "1px solid rgba(0, 104, 117, 0.3)" 
                  : i % 5 === 0
                    ? "1px solid rgba(255, 180, 0, 0.3)"
                    : "1px solid rgba(51, 140, 152, 0.3)",
                transform: "translate(-50%, -50%)",
                animation: "pulseWave 4s ease-out 2s infinite",
              },
              "@keyframes pulseWave": {
                "0%": { width: "4px", height: "4px", opacity: 1 },
                "100%": { width: "50px", height: "50px", opacity: 0 },
              },
            }}
          />
        ))}

        {/* Indicadores de gauge - Reducidos para mejorar rendimiento */}
        {[...Array(4)].map((_, i) => {
          const gaugeValue = Math.random();
          return (
            <Box
              key={`gauge-${i}`}
              sx={{
                position: "absolute",
                width: `${30 + Math.random() * 20}px`,
                height: `${15 + Math.random() * 10}px`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                borderRadius: "3px",
                background: "rgba(30, 30, 30, 0.6)",
                overflow: "hidden",
                opacity: 0.4,
                animation: `floatGauge ${12 + Math.random() * 18}s ease-in-out infinite ${Math.random() * 8}s`,
                "@keyframes floatGauge": {
                  "0%": { opacity: 0.2, transform: `translateZ(${Math.random() * 50}px)` },
                  "50%": { opacity: 0.6, transform: `translateZ(${50 + Math.random() * 100}px)` },
                  "100%": { opacity: 0.2, transform: `translateZ(${Math.random() * 50}px)` },
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  height: "100%",
                  width: `${gaugeValue * 100}%`,
                  background: gaugeValue > 0.7 
                    ? "rgba(255, 180, 0, 0.8)" 
                    : gaugeValue > 0.4 
                      ? "rgba(0, 104, 117, 0.8)" // Azul (primario - color navbar)
                      : "rgba(51, 140, 152, 0.8)", // Azul claro (secundario)
                  transition: "width 1s ease-in-out",
                }}
              />
            </Box>
          );
        })}

        {/* Tablas de datos - Reducidas para mejorar rendimiento */}
        {[...Array(3)].map((_, i) => (
          <Box
            key={`table-${i}`}
            sx={{
              position: "absolute",
              width: `${60 + Math.random() * 40}px`,
              height: `${40 + Math.random() * 30}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              background: "rgba(30, 30, 30, 0.5)",
              borderRadius: "3px",
              display: "flex",
              flexDirection: "column",
              opacity: 0.3,
              transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 100}px)`,
              animation: `floatTable ${15 + Math.random() * 20}s ease-in-out infinite ${Math.random() * 10}s`,
              "@keyframes floatTable": {
                "0%": { 
                  opacity: 0.1, 
                  transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 50}px)` 
                },
                "50%": { 
                  opacity: 0.4, 
                  transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${50 + Math.random() * 100}px)` 
                },
                "100%": { 
                  opacity: 0.1, 
                  transform: `rotateX(${Math.random() * 40 + 30}deg) rotateY(${Math.random() * 40 - 20}deg) translateZ(${Math.random() * 50}px)` 
                },
              },
            }}
          >
            {/* Filas de la tabla */}
            {[...Array(4)].map((_, j) => (
              <Box
                key={`table-row-${i}-${j}`}
                sx={{
                  width: "100%",
                  height: `${100 / 4}%`,
                  borderBottom: j < 3 ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                  display: "flex",
                }}
              >
                {/* Columnas de la tabla */}
                {[...Array(3)].map((_, k) => (
                  <Box
                    key={`table-cell-${i}-${j}-${k}`}
                    sx={{
                      width: `${100 / 3}%`,
                      height: "100%",
                      borderRight: k < 2 ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                      background: j === 0 ? "rgba(0, 104, 117, 0.3)" : "transparent",
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        ))}

        {/* Líneas de cuadrícula en primer plano */}
        <Box sx={{ 
          position: "absolute", 
          width: "200%", 
          height: "200%",
          top: "-50%",
          left: "-50%", 
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          transform: "translateZ(50px)",
          pointerEvents: "none"
        }}/>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            borderRadius: 2,
            "& .MuiAlert-icon": { fontSize: "1.5rem" }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;
