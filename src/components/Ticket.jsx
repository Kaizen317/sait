import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
  SwipeableDrawer,
  CircularProgress,
  Stack
} from '@mui/material';
import { 
  Send as SendIcon,
  ConfirmationNumber as TicketIcon,
  Cancel as CancelIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import Sidebar from './Navbar';
import { MqttContext } from './MqttContext';

const Ticket = () => {
  const context = useContext(MqttContext);
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType") || "normal";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estado para el drawer móvil
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [ticketData, setTicketData] = useState({
    asunto: '',
    tipo: '',
    descripcion: '',
    prioridad: ''
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleReset = () => {
    setTicketData({
      asunto: '',
      tipo: '',
      descripcion: '',
      prioridad: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setSnackbarMessage('Error: Usuario no identificado');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch('https://l11lxg6l12.execute-api.us-east-1.amazonaws.com/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ticketData,
          userId,
          userType
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al enviar el ticket');
      }
  
      const data = await response.json();
      console.log('Ticket enviado:', data);
  
      setSnackbarMessage('Ticket enviado exitosamente');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
  
      setTicketData({
        asunto: '',
        tipo: '',
        descripcion: '',
        prioridad: ''
      });
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Error al enviar el ticket');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const toggleMobileDrawer = (open) => {
    setMobileDrawerOpen(open);
  };

  const getPriorityColor = (prioridad) => {
    switch(prioridad) {
      case 'baja': return '#4caf50';
      case 'media': return '#ff9800';
      case 'alta': return '#f44336';
      case 'urgente': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'soporte': return '🔧';
      case 'consulta': return '❓';
      case 'error': return '⚠️';
      case 'mejora': return '✨';
      default: return '📝';
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh", background: '#f5f7fa' }}>
      {!isMobile && <Sidebar />}
      
      {/* AppBar para móvil */}
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            boxShadow: 1, 
            bgcolor: 'white',
            color: '#333'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => toggleMobileDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #70BC7E 30%, #4CAF50 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sistema de Tickets
            </Typography>
            <Avatar 
              sx={{
                width: 35, 
                height: 35, 
                bgcolor: '#4CAF50'
              }}
            >
              <TicketIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </Toolbar>
        </AppBar>
      )}
      
      {/* Drawer para móvil */}
      <SwipeableDrawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => toggleMobileDrawer(false)}
        onOpen={() => toggleMobileDrawer(true)}
      >
        <Sidebar isMobile onClose={() => toggleMobileDrawer(false)} />
      </SwipeableDrawer>
      
      <Container 
        sx={{ 
          flex: 1, 
          padding: { xs: "16px", sm: "20px", md: "24px" }, 
          marginLeft: { xs: 0, sm: "250px" }, 
          maxWidth: { xs: "100%", sm: "calc(100% - 250px)" }, 
          overflow: "hidden",
          mt: isMobile ? "56px" : 0
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          py: { xs: 2, sm: 3, md: 4 }
        }}>
          {!isMobile && (
            <Avatar 
              sx={{
                width: { xs: 50, sm: 60, md: 70 }, 
                height: { xs: 50, sm: 60, md: 70 }, 
                bgcolor: '#4CAF50', 
                boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                mb: 2
              }}
            >
              <TicketIcon sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />
            </Avatar>
          )}
          
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.5rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #70BC7E 30%, #4CAF50 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              textAlign: 'center'
            }}
          >
            {isMobile ? 'Nuevo Ticket' : 'Sistema de Tickets'}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            textAlign="center"
            sx={{ 
              maxWidth: 600, 
              mb: { xs: 2, sm: 3, md: 4 },
              px: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Complete el formulario para enviar un nuevo ticket de soporte.
            Procuraremos responder a la brevedad posible.
          </Typography>
        </Box>
        
        <Paper 
          elevation={4} 
          sx={{ 
            padding: { xs: '16px', sm: '20px', md: '30px', lg: '40px' },
            margin: '0 auto 40px',
            maxWidth: '900px',
            borderRadius: { xs: '12px', sm: '16px' },
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #70BC7E, #4CAF50)',
            }
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  fontWeight={600} 
                  mb={1} 
                  color="#333"
                >
                  Información del Ticket
                </Typography>
                <Divider sx={{ mb: isMobile ? 2 : 3 }} />
              </Grid>
            
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Asunto"
                  name="asunto"
                  value={ticketData.asunto}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="Breve descripción del problema"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                  <InputLabel id="ticket-type-label">Tipo de Ticket</InputLabel>
                  <Select
                    labelId="ticket-type-label"
                    name="tipo"
                    value={ticketData.tipo}
                    onChange={handleChange}
                    required
                    label="Tipo de Ticket"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" mr={1}>
                          {getTipoIcon(selected)}
                        </Typography>
                        {selected === 'soporte' && 'Soporte Técnico'}
                        {selected === 'consulta' && 'Consulta General'}
                        {selected === 'error' && 'Reporte de Error'}
                        {selected === 'mejora' && 'Sugerencia de Mejora'}
                      </Box>
                    )}
                  >
                    <MenuItem value="soporte">🔧 Soporte Técnico</MenuItem>
                    <MenuItem value="consulta">❓ Consulta General</MenuItem>
                    <MenuItem value="error">⚠️ Reporte de Error</MenuItem>
                    <MenuItem value="mejora">✨ Sugerencia de Mejora</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size={isMobile ? "small" : "medium"}>
                  <InputLabel id="priority-label">Prioridad</InputLabel>
                  <Select
                    labelId="priority-label"
                    name="prioridad"
                    value={ticketData.prioridad}
                    onChange={handleChange}
                    required
                    label="Prioridad"
                    renderValue={(selected) => (
                      <Chip
                        label={selected.charAt(0).toUpperCase() + selected.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(selected)}20`,
                          color: getPriorityColor(selected),
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    )}
                  >
                    <MenuItem value="baja">Baja</MenuItem>
                    <MenuItem value="media">Media</MenuItem>
                    <MenuItem value="alta">Alta</MenuItem>
                    <MenuItem value="urgente">Urgente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 4 : 6}
                  label="Descripción"
                  name="descripcion"
                  value={ticketData.descripcion}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  placeholder="Describa el problema o solicitud con el mayor detalle posible..."
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  mt: 2, 
                  gap: 2 
                }}>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={handleReset}
                    sx={{
                      borderRadius: '8px',
                      py: isMobile ? 1 : 1.5,
                      order: { xs: 2, sm: 1 }
                    }}
                    startIcon={<CancelIcon />}
                    fullWidth={isMobile}
                    size={isMobile ? "medium" : "large"}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #4CAF50 30%, #70BC7E 90%)',
                      color: 'white',
                      padding: isMobile ? '10px 16px' : '12px 24px',
                      borderRadius: '8px',
                      boxShadow: '0 3px 5px 2px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                        boxShadow: '0 4px 8px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      order: { xs: 1, sm: 2 },
                      width: { xs: '100%', sm: '200px' },
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }}
                    size={isMobile ? "large" : "large"}
                  >
                    {loading ? 'Enviando...' : 'Enviar Ticket'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ 
            vertical: isMobile ? 'top' : 'bottom', 
            horizontal: 'center' 
          }}
          sx={{
            bottom: isMobile ? 'auto' : 16,
            top: isMobile ? 60 : 'auto'
          }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ 
              width: '100%',
              fontSize: isMobile ? '0.8rem' : '0.875rem'
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default Ticket;