import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions,
  DialogContent, DialogTitle, Typography, LinearProgress, IconButton, Chip, Divider,
  Card, CardContent, CardHeader, Tooltip, Avatar, Grid, CircularProgress, Backdrop,
  useTheme, useMediaQuery
} from '@mui/material';
import { 
  Edit, Delete, AddCircleOutline, Visibility, Lock, ManageAccounts, CheckCircle, 
  Dashboard, Menu as MenuIcon, NoAccounts, PersonAdd, Group, AssignmentInd 
} from '@mui/icons-material';
import Sidebar from './Navbar';
import './Subcuenta.css';

const Subcuenta = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [subaccounts, setSubaccounts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [subdashboards, setSubdashboards] = useState([]);
  const [selectedSubdashboards, setSelectedSubdashboards] = useState([]);
  const [description, setDescription] = useState('');
  const [navbarAccess, setNavbarAccess] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isNewRole, setIsNewRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const navbarOptions = [
    { label: 'Panel Principal', value: '/dashboard', icon: <Dashboard fontSize="small" /> },
    { label: 'Informes', value: '/reportes', icon: <AssignmentInd fontSize="small" /> },
    { label: 'Alarmas', value: '/alarmas', icon: <CheckCircle fontSize="small" /> },
    { label: 'Configurar Dashboard', value: '/dashboardconfig', icon: <ManageAccounts fontSize="small" /> },
    { label: 'Dispositivos', value: '/devices', icon: <MenuIcon fontSize="small" /> },
    { label: 'IA', value: '/ia', icon: <MenuIcon fontSize="small" /> },
    { label: 'Subcuentas', value: '/subcuenta', icon: <Group fontSize="small" /> },
  ];

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({
    username: '', description: '', role: '', subdashboards: [], navbarAccess: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [viewSubaccountsOpen, setViewSubaccountsOpen] = useState(false);

  // Fetch de subdashboards
  useEffect(() => {
    const fetchSubdashboards = async () => {
      if (!userId) return setSnackbar({ open: true, message: "El usuario no está logueado.", severity: 'error' });
      setPageLoading(true);
      try {
        const response = await fetch(`https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}`);
        if (!response.ok) throw new Error((await response.json()).error || "Error al cargar subdashboards.");
        const data = await response.json();
        setSubdashboards(data.dashboards.map(d => ({ id: d.subdashboardId, name: d.subdashboardName })));
      } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      } finally {
        setPageLoading(false);
      }
    };
    fetchSubdashboards();
  }, [userId]);

  // Fetch de roles y subcuentas inicial
  const fetchSubaccountsAndRoles = async () => {
    setPageLoading(true);
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: { 'Authorization': localStorage.getItem('token') },
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al cargar datos.');
      const data = await response.json();
      const userSubaccounts = data.subaccounts.filter(sub => sub.userId === localStorage.getItem('userId'));
      setSubaccounts(userSubaccounts);
      setRoles([...new Set(data.subaccounts.map(sub => sub.role))]);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSubaccountsAndRoles();
  }, []);

  const handleAddSubaccount = async () => {
    if (!username || !password || !confirmPassword || !role || selectedSubdashboards.length === 0 || navbarAccess.length === 0) {
      setSnackbar({ open: true, message: 'Complete todos los campos obligatorios.', severity: 'warning' });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: 'Las contraseñas no coinciden.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const checkResponse = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: { 'Authorization': localStorage.getItem('token') },
      });
      const data = await checkResponse.json();
      if (data.subaccounts.some(sub => sub.username === username)) {
        setSnackbar({ open: true, message: 'El nombre de usuario ya existe.', severity: 'warning' });
        setLoading(false);
        return;
      }
      const subaccountData = {
        username, password, role, subdashboards: selectedSubdashboards, description, navbarAccess,
        userIdadmin: localStorage.getItem('userId'),
      };
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/roluser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify(subaccountData),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al añadir subcuenta.');
      const newSubaccount = await response.json();
      setSubaccounts(prev => [...prev, newSubaccount]); // Actualización inmediata
      setUsername(''); setPassword(''); setConfirmPassword(''); setDescription(''); setNavbarAccess([]); setRole(''); setSelectedSubdashboards([]);
      setSnackbar({ open: true, message: 'Subcuenta añadida con éxito.', severity: 'success' });
      fetchSubaccountsAndRoles(); // Refresca roles también
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (index) => {
    const sub = subaccounts[index];
    setEditData({
      username: sub.username, description: sub.description || '', role: sub.role,
      subdashboards: sub.subdashboards || [], navbarAccess: sub.navbarAccess || []
    });
    setEditIndex(index);
    setOpen(true);
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    const updatedData = { ...editData, userId: subaccounts[editIndex].userId, subaccountId: subaccounts[editIndex].subaccountId };
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/roluser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al actualizar.');
      const updatedSubaccounts = [...subaccounts];
      updatedSubaccounts[editIndex] = { ...subaccounts[editIndex], ...updatedData };
      setSubaccounts(updatedSubaccounts);
      setSnackbar({ open: true, message: 'Subcuenta actualizada con éxito.', severity: 'success' });
      setOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubaccount = async () => {
    setLoading(true);
    const sub = subaccounts[deleteIndex];
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/deleteuser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') },
        body: JSON.stringify({ userId: sub.userId, subaccountId: sub.subaccountId }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error al eliminar.');
      setSubaccounts(subaccounts.filter((_, i) => i !== deleteIndex));
      setSnackbar({ open: true, message: 'Subcuenta eliminada con éxito.', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event) => {
    const value = event.target.value;
    if (value === 'new') {
      setIsNewRole(true);
      setRole('');
      setSelectedSubdashboards([]);
      setNavbarAccess([]);
      setDescription('');
    } else {
      setIsNewRole(false);
      setRole(value);
      fetchRoleDetails(value);
    }
  };

  // Fetch de detalles del rol seleccionado
  const fetchRoleDetails = async (selectedRole) => {
    setLoading(true);
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: { 'Authorization': localStorage.getItem('token') },
      });
      if (!response.ok) throw new Error('Error al cargar detalles del rol.');
      const data = await response.json();
      const roleData = data.subaccounts.find(sub => sub.role === selectedRole);
      if (roleData) {
        setSelectedSubdashboards(roleData.subdashboards || []);
        setNavbarAccess(roleData.navbarAccess || []);
        setDescription(roleData.description || '');
      } else {
        setSnackbar({ open: true, message: 'No se encontraron datos para el rol seleccionado.', severity: 'warning' });
        setSelectedSubdashboards([]);
        setNavbarAccess([]);
        setDescription('');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Función para generar color de Avatar basado en nombre de usuario
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        padding: { xs: '16px', sm: '24px', md: '32px' },
        marginLeft: { xs: 0, sm: '250px' },
        maxWidth: { xs: '100%', sm: 'calc(100% - 250px)' },
        overflow: 'hidden'
      }}>
        {pageLoading ? (
          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={pageLoading}>
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : (
          <>
            {/* Encabezado */}
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              flexDirection: {xs: 'column', md: 'row'}, 
              justifyContent: 'space-between',
              alignItems: {xs: 'flex-start', md: 'center'},
              gap: 2
            }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: {xs: '1.75rem', md: '2.25rem'}, color: '#2c3e50', mb: 1 }}>
                  Gestión de Subcuentas
                </Typography>
                <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                  Administre usuarios y sus permisos de acceso
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={() => setViewSubaccountsOpen(true)}
                startIcon={<Visibility />}
                sx={{
                  backgroundColor: '#3498db',
                  '&:hover': { backgroundColor: '#2980b9' },
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  padding: '10px 20px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Ver Subcuentas ({subaccounts.length})
              </Button>
            </Box>

            {/* Indicador de progreso */}
            {loading && (
              <LinearProgress sx={{ mb: 3, height: '4px', borderRadius: '2px', '.MuiLinearProgress-bar': { backgroundColor: '#27ae60' } }} />
            )}

            {/* Formulario */}
            <Card sx={{ mb: 4, borderRadius: '12px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)', overflow: 'visible' }}>
              <CardHeader 
                title="Crear Nueva Subcuenta" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#2c3e50' }}
                avatar={<Avatar sx={{ backgroundColor: '#27ae60' }}><PersonAdd /></Avatar>}
                sx={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Descripción" 
                      variant="outlined" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Usuario" 
                      variant="outlined" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      fullWidth
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Contraseña" 
                      type="password" 
                      variant="outlined" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      fullWidth
                      required
                      InputProps={{ startAdornment: <Lock sx={{ color: '#7f8c8d', mr: 1 }} fontSize="small" /> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField 
                      label="Confirmar Contraseña" 
                      type="password" 
                      variant="outlined" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      fullWidth
                      required
                      error={password !== confirmPassword && confirmPassword !== ''}
                      helperText={password !== confirmPassword && confirmPassword !== '' ? 'Las contraseñas no coinciden' : ''}
                      InputProps={{ startAdornment: <Lock sx={{ color: '#7f8c8d', mr: 1 }} fontSize="small" /> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}>
                      <InputLabel>Rol *</InputLabel>
                      <Select value={isNewRole ? 'new' : role} onChange={handleRoleChange} label="Rol *">
                        <MenuItem value="new">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AddCircleOutline sx={{ mr: 1, color: '#27ae60' }} />
                            <em>Agregar nuevo rol</em>
                          </Box>
                        </MenuItem>
                        {roles.map(r => (
                          <MenuItem key={r} value={r}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AssignmentInd sx={{ mr: 1, color: '#7f8c8d' }} />
                              {r}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {isNewRole && (
                    <Grid item xs={12}>
                      <TextField 
                        label="Nuevo Rol" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        fullWidth
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}>
                      <InputLabel>Subdashboards</InputLabel>
                      <Select
                        multiple
                        value={selectedSubdashboards}
                        onChange={(e) => setSelectedSubdashboards(e.target.value)}
                        label="Subdashboards"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((id) => (
                              <Chip key={id} label={subdashboards.find(sub => sub.id === id)?.name} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 500 }} />
                            ))}
                          </Box>
                        )}
                      >
                        {subdashboards.map(sub => (
                          <MenuItem key={sub.id} value={sub.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Dashboard sx={{ mr: 1, color: '#7f8c8d', fontSize: '1rem' }} />
                              {sub.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#27ae60' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#27ae60' } }}>
                      <InputLabel>Acceso al Navbar</InputLabel>
                      <Select
                        multiple
                        value={navbarAccess}
                        onChange={(e) => setNavbarAccess(e.target.value)}
                        label="Acceso al Navbar"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((val) => (
                              <Chip key={val} label={navbarOptions.find(opt => opt.value === val)?.label} size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                            ))}
                          </Box>
                        )}
                      >
                        {navbarOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              {opt.icon}
                              <Box sx={{ ml: 1 }}>{opt.label}</Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleAddSubaccount} 
                    disabled={loading}
                    startIcon={<AddCircleOutline />}
                    sx={{
                      backgroundColor: '#27ae60',
                      '&:hover': { backgroundColor: '#219653' },
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
                      padding: '12px 24px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      minWidth: '200px'
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Añadir Subcuenta'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Diálogo para ver subcuentas */}
            <Dialog open={viewSubaccountsOpen} onClose={() => setViewSubaccountsOpen(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' } }}>
              <DialogTitle sx={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center' }}>
                <Group sx={{ mr: 1, color: '#2c3e50' }} />
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Lista de Subcuentas ({subaccounts.length})
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}>
                {subaccounts.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <NoAccounts sx={{ fontSize: 60, color: '#bdc3c7', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#7f8c8d', mb: 1 }}>No hay subcuentas</Typography>
                    <Typography variant="body2" sx={{ color: '#95a5a6', textAlign: 'center' }}>
                      Aún no se han creado subcuentas. Utilice el formulario para añadir una nueva.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Usuario</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Rol</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Descripción</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Acceso al Navbar</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Subdashboards</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#2c3e50' }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subaccounts.map((sub, index) => (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' }, borderBottom: '1px solid #e9ecef' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: stringToColor(sub.username), width: 32, height: 32, fontSize: '0.875rem', mr: 1 }}>
                                  {sub.username.substring(0, 1).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{sub.username}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={sub.role} size="small" sx={{ backgroundColor: '#e8f0fe', color: '#1a73e8', fontWeight: 500 }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{sub.description || '-'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(sub.navbarAccess || []).map((access, i) => (
                                  <Tooltip key={i} title={navbarOptions.find(opt => opt.value === access)?.label || access} arrow>
                                    <Chip label={navbarOptions.find(opt => opt.value === access)?.label || access} size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontSize: '0.75rem' }} />
                                  </Tooltip>
                                ))}
                                {(sub.navbarAccess || []).length === 0 && '-'}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(sub.subdashboards || []).map((dashId, i) => {
                                  const dashboardName = subdashboards.find(d => d.id === dashId)?.name || dashId;
                                  return (
                                    <Tooltip key={i} title={dashboardName} arrow>
                                      <Chip label={dashboardName} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.75rem' }} />
                                    </Tooltip>
                                  );
                                })}
                                {(sub.subdashboards || []).length === 0 && '-'}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar subcuenta" arrow>
                                <IconButton onClick={() => handleOpenEditDialog(index)} size="small" sx={{ color: '#3498db', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar subcuenta" arrow>
                                <IconButton onClick={() => { setDeleteIndex(index); setDeleteDialogOpen(true); }} size="small" sx={{ color: '#e74c3c', '&:hover': { backgroundColor: '#fef0ef' } }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e9ecef' }}>
                <Button onClick={() => setViewSubaccountsOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', color: '#7f8c8d', borderColor: '#bdc3c7', '&:hover': { borderColor: '#95a5a6', backgroundColor: '#f8f9fa' }, fontWeight: 500 }}>
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para editar */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' } }}>
              <DialogTitle sx={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center' }}>
                <Edit sx={{ mr: 1, color: '#2c3e50' }} />
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Editar Subcuenta
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: 3, mt: 1 }}>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                  <Grid item xs={12} md={6}>
                    <TextField label="Usuario" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#3498db' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#3498db' } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="Descripción" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#3498db' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#3498db' } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Rol" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#3498db' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#3498db' } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#3498db' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#3498db' } }}>
                      <InputLabel>Subdashboards</InputLabel>
                      <Select multiple value={editData.subdashboards} onChange={(e) => setEditData({ ...editData, subdashboards: e.target.value })} label="Subdashboards" renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((id) => (
                            <Chip key={id} label={subdashboards.find(sub => sub.id === id)?.name || id} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 500 }} />
                          ))}
                        </Box>
                      )}>
                        {subdashboards.map(sub => (
                          <MenuItem key={sub.id} value={sub.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Dashboard sx={{ mr: 1, color: '#7f8c8d', fontSize: '1rem' }} />
                              {sub.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#3498db' } }, '& .MuiFormLabel-root.Mui-focused': { color: '#3498db' } }}>
                      <InputLabel>Acceso al Navbar</InputLabel>
                      <Select multiple value={editData.navbarAccess} onChange={(e) => setEditData({ ...editData, navbarAccess: e.target.value })} label="Acceso al Navbar" renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((val) => (
                            <Chip key={val} label={navbarOptions.find(opt => opt.value === val)?.label || val} size="small" sx={{ backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 500 }} />
                          ))}
                        </Box>
                      )}>
                        {navbarOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              {opt.icon}
                              <Box sx={{ ml: 1 }}>{opt.label}</Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e9ecef', justifyContent: 'space-between' }}>
                <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', color: '#7f8c8d', borderColor: '#bdc3c7', '&:hover': { borderColor: '#95a5a6', backgroundColor: '#f8f9fa' }, fontWeight: 500 }}>
                  Cancelar
                </Button>
                <Button onClick={handleEditSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Edit />} sx={{ backgroundColor: '#3498db', '&:hover': { backgroundColor: '#2980b9' }, borderRadius: '8px', boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)', padding: '8px 20px', textTransform: 'none', fontWeight: 600 }}>
                  Guardar Cambios
                </Button>
              </DialogActions>
            </Dialog>

            {/* Diálogo para eliminar */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '100%' } }}>
              <DialogTitle sx={{ backgroundColor: '#fef5f4', color: '#e74c3c', display: 'flex', alignItems: 'center', borderBottom: '1px solid #fadbd8' }}>
                <Delete sx={{ mr: 1, color: '#e74c3c' }} />
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: '#e74c3c' }}>
                  Confirmar Eliminación
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ p: 3, mt: 1 }}>
                <Typography sx={{ color: '#2c3e50' }}>
                  ¿Estás seguro de eliminar esta subcuenta? Esta acción no se puede deshacer.
                </Typography>
                {deleteIndex !== null && subaccounts[deleteIndex] && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                      Detalles de la subcuenta:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: stringToColor(subaccounts[deleteIndex].username), width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                        {subaccounts[deleteIndex].username.substring(0, 1).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{subaccounts[deleteIndex].username}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Rol: {subaccounts[deleteIndex].role}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid #e9ecef', justifyContent: 'space-between' }}>
                <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', color: '#7f8c8d', borderColor: '#bdc3c7', '&:hover': { borderColor: '#95a5a6', backgroundColor: '#f8f9fa' }, fontWeight: 500 }}>
                  Cancelar
                </Button>
                <Button onClick={handleDeleteSubaccount} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Delete />} sx={{ backgroundColor: '#e74c3c', '&:hover': { backgroundColor: '#c0392b' }, borderRadius: '8px', boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)', padding: '8px 20px', textTransform: 'none', fontWeight: 600 }}>
                  Eliminar
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', alignItems: 'center' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Subcuenta;