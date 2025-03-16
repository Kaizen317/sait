import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { 
  Person, 
  Lock, 
  Visibility, 
  VisibilityOff,
  ArrowBack,
  LockOutlined,
  LoginOutlined
} from "@mui/icons-material";
import {
  Button,
  TextField,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Container,
  Paper,
  useMediaQuery,
  Zoom,
  Slide,
  Grow,
  Box,
  InputAdornment,
  IconButton,
  Divider,
  Avatar,
  Fade,
  Backdrop
} from "@mui/material";
import { useTheme, styled, alpha } from '@mui/material/styles';

// Definición de colores y tema - manteniendo los mismos
const COLORS = {
  primary: "#1e5128", // Verde profesional
  primaryLight: "#2e7d32",
  primaryDark: "#133018",
  secondary: "#e8f5e9",
  text: "#333333",
  textSecondary: "#666666",
  background: "#ffffff",
  error: "#d32f2f",
  success: "#388e3c",
  border: "#e0e0e0"
};

// Componente Paper con estilo mejorado y efectos refinados
const StyledPaper = styled(Paper)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Curva de animación más profesional
  '&:hover': {
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-6px)',
  },
  padding: theme.spacing(4, 4, 5, 4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 430, // Ligeramente más ancho para mejor aspecto
  borderRadius: 20, // Bordes aún más suaves
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
  background: `${COLORS.background}`,
  boxShadow: '0 6px 30px rgba(0, 0, 0, 0.07)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})`
  }
}));

// Botón principal estilizado con efectos mejorados
const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(30, 81, 40, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  background: `linear-gradient(45deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
  letterSpacing: '0.5px',
  '&:hover': {
    boxShadow: '0 8px 20px rgba(30, 81, 40, 0.25)',
    background: `linear-gradient(45deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
    transform: 'translateY(-3px)'
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 8px rgba(30, 81, 40, 0.2)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
  }
}));

// Botón secundario estilizado con animaciones más sutiles
const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2),
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.9rem',
  color: COLORS.primary,
  borderColor: alpha(COLORS.primary, 0.5),
  transition: 'all 0.25s ease',
  '&:hover': {
    borderColor: COLORS.primary,
    backgroundColor: alpha(COLORS.primary, 0.05),
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0px)',
  }
}));

// Campo de texto estilizado con mejor feedback visual
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.2s ease',
    backgroundColor: alpha(COLORS.secondary, 0.15),
    '&:hover': {
      backgroundColor: alpha(COLORS.secondary, 0.25),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(COLORS.primary, 0.5),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(COLORS.secondary, 0.3),
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: COLORS.primary,
      borderWidth: '2px',
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.7, 2),
    '&:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 100px ${alpha(COLORS.secondary, 0.3)} inset`,
      WebkitTextFillColor: COLORS.text,
    },
  },
  '& .MuiInputLabel-root': {
    color: COLORS.textSecondary,
    fontWeight: 500,
    '&.Mui-focused': {
      color: COLORS.primary,
      fontWeight: 600,
    }
  },
  '& .MuiInputAdornment-root': {
    marginRight: 8,
  }
}));

// Logo mejorado con efectos sutiles
const Logo = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: alpha(COLORS.primary, 0.1),
  color: COLORS.primary,
  fontSize: '2.2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  border: `2px solid ${alpha(COLORS.primary, 0.2)}`,
  boxShadow: `0 6px 16px ${alpha(COLORS.primary, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: `0 8px 20px ${alpha(COLORS.primary, 0.15)}`,
    backgroundColor: alpha(COLORS.primary, 0.15),
  }
}));

// Componente de carga mejorado
const LoadingBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(4px)'
}));

function Login1({ setUserId: setParentUserId }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Si el inicio de sesión es exitoso y estamos redirigiendo
    if (loading && snackbar.severity === "success") {
      setShowFullScreenLoader(true);
    } else {
      setShowFullScreenLoader(false);
    }
  }, [loading, snackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setSnackbar({ 
        open: true, 
        message: "Por favor ingrese usuario y contraseña", 
        severity: "warning" 
      });
      return;
    }
    
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
      
      if (!data.userId) {
        throw new Error("No se recibió el ID de usuario");
      }

      setParentUserId(data.userId);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("subaccountId", data.subaccountId);
      localStorage.setItem("userType", data.userType || "normal");
      localStorage.setItem("navbarAccess", JSON.stringify(data.navbarAccess || []));

      if (data.subdashboards) {
        localStorage.setItem("subdashboards", JSON.stringify(data.subdashboards));
      }

      const userNavAccess = data.navbarAccess || [];
      const defaultRoute = "/dashboard";
      const routeToGo = userNavAccess.length > 0 ? userNavAccess[0] : defaultRoute;

      setSnackbar({
        open: true,
        message: "Inicio de sesión exitoso",
        severity: "success",
      });

      // Indicar visualmente que estamos redirigiendo
      setShowFullScreenLoader(true);
      
      // Esperar un momento antes de redireccionar para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1200));

      navigate(routeToGo, {
        state: {
          subdashboards: data.subdashboards,
          userId: data.userId
        }
      });
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Credenciales incorrectas, intente nuevamente", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth={false} 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(COLORS.background, 0.9)} 0%, ${alpha(COLORS.background, 0.3)} 100%)`,
        backgroundImage: `
          radial-gradient(circle at 10% 20%, ${alpha(COLORS.primaryLight, 0.03)} 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, ${alpha(COLORS.primaryLight, 0.03)} 0%, transparent 20%),
          linear-gradient(135deg, ${alpha(COLORS.background, 0.9)} 0%, ${alpha(COLORS.background, 0.3)} 100%)
        `,
        padding: 2
      }}
    >
      {/* Loader de pantalla completa para transición */}
      <LoadingBackdrop open={showFullScreenLoader}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{ color: COLORS.secondary, mb: 2 }} 
          />
          <Typography variant="h6" color="white" fontWeight={500}>
            Iniciando sesión...
          </Typography>
        </Box>
      </LoadingBackdrop>

      <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={800}>
        <StyledPaper elevation={5}>
          <Slide direction="down" in={true} mountOnEnter unmountOnExit timeout={700}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                <SecondaryButton
                  fullWidth
                  onClick={() => navigate("/register")}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '24px',
                    minHeight: '120px',
                    '&:hover img': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <img 
                    src={logo}
                    alt="SAIT Logo" 
                    style={{ 
                      width: '100px', 
                      height: '100px',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                </SecondaryButton>
              </Zoom>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: COLORS.primary, 
                  letterSpacing: '-0.5px',
                  marginBottom: 1
                }}
              >
                Bienvenido
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: COLORS.textSecondary,
                  maxWidth: '85%',
                  margin: '0 auto',
                  lineHeight: 1.5,
                  fontSize: '0.95rem'
                }}
              >
                Ingrese sus credenciales para acceder al sistema
              </Typography>
            </Box>
          </Slide>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: "100%", 
              mt: 2,
              position: 'relative'
            }}
          >
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <StyledTextField
                label="Usuario"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: COLORS.primary, opacity: 0.8 }} />
                    </InputAdornment>
                  ),
                }}
                autoComplete="username"
                autoFocus
              />
            </Zoom>

            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
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
                      <LockOutlined sx={{ color: COLORS.primary, opacity: 0.8 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: COLORS.textSecondary,
                          '&:hover': {
                            backgroundColor: alpha(COLORS.primary, 0.1)
                          }
                        }}
                      >
                        {showPassword ? 
                          <VisibilityOff /> : 
                          <Visibility />
                        }
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                autoComplete="current-password"
              />
            </Zoom>

            <Grow in={true} style={{ transformOrigin: '0 0 0', transitionDelay:'400ms' }} timeout={800}>
              <PrimaryButton
                type="submit"
                fullWidth
                disabled={loading}
                startIcon={loading ? null : <LoginOutlined sx={{ color: '#fff' }} />}
                sx={{ mt: 1 }}
              >
                {loading ? 
                  <CircularProgress size={24} sx={{ color: '#fff' }} /> : 
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>Iniciar Sesión</Typography>
                }
              </PrimaryButton>
            </Grow>

            <Box sx={{ mt: 3.5, mb: 1.5, position: 'relative' }}>
              <Divider sx={{
                '&::before, &::after': {
                  borderColor: alpha(COLORS.primary, 0.1),
                },
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: COLORS.textSecondary, 
                    px: 1,
                    fontSize: '0.8rem'
                  }}
                >
                  o
                </Typography>
              </Divider>
            </Box>

            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
              <SecondaryButton
                variant="outlined"
                fullWidth
                onClick={() => navigate("/login")}
                startIcon={<ArrowBack />}
              >
                Acceder como Usuario Raíz
              </SecondaryButton>
            </Zoom>
          </Box>

          {/* Footer con información de copyright */}
          <Fade in={true} style={{ transitionDelay: '600ms' }}>
            <Typography 
              variant="caption" 
              color="textSecondary" 
              align="center"
              sx={{ 
                mt: 4, 
                opacity: 0.7,
                fontSize: '0.75rem'
              }}
            >
              {new Date().getFullYear()} Sistema de Gestión Empresarial
            </Typography>
          </Fade>
        </StyledPaper>
      </Grow>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            borderRadius: 3,
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login1;