import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar,
  Alert, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import Sidebar from './Navbar';

const Subcuenta = () => {
  const [subaccounts, setSubaccounts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [subdashboards, setSubdashboards] = useState([]);
  const [selectedSubdashboards, setSelectedSubdashboards] = useState([]);
  const [description, setDescription] = useState('');
  const [navbarAccess, setNavbarAccess] = useState([]); // (Quitado permisos)
  const [roles, setRoles] = useState([]);
  const [isNewRole, setIsNewRole] = useState(false);
  const userId = localStorage.getItem("userId");

  // (Quitado: const permissionOptions = [...])

  // (Quitado: const [permissions, setPermissions] = useState([]);)

  const navbarOptions = [
    { label: 'Panel Principal', value: '/dashboard' },
    { label: 'Informes', value: '/reportes' },
    { label: 'Alarmas', value: '/alarmas' },
    { label: 'Configurar Dashboard', value: '/dashboardconfig' },
    { label: 'Dispositivos', value: '/devices' },
    { label: 'Tabla de Variables', value: '/variables' },
    { label: 'IA', value: '/ia' },
    { label: 'Subcuentas', value: '/subcuenta' },
  ];

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({
    username: '',
    description: '',
    role: '',
    // (Quitado: permissions: []),
    subdashboards: [],
    navbarAccess: []
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [viewSubaccountsOpen, setViewSubaccountsOpen] = useState(false);
  const handleViewSubaccountsOpen = () => setViewSubaccountsOpen(true);
  const handleViewSubaccountsClose = () => setViewSubaccountsOpen(false);

  useEffect(() => {
    const fetchSubdashboards = async () => {
      if (!userId) {
        alert("El usuario no está logueado.");
        return;
      }
      try {
        const response = await fetch(
          `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los subdashboards:", errorData);
          alert(`Error: ${errorData.error || "No se pudieron cargar los subdashboards."}`);
          return;
        }
        const data = await response.json();
        const { dashboards } = data;
        const subdashboardsFromDB = dashboards.map((d) => ({
          id: d.subdashboardId,
          name: d.subdashboardName,
        }));
        setSubdashboards(subdashboardsFromDB);
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al conectar con el servidor.");
      }
    };
    fetchSubdashboards();
  }, [userId]);

  useEffect(() => {
    const fetchRolesFromSubaccounts = async () => {
      try {
        const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
          headers: { 'Authorization': localStorage.getItem('token') },
        });
        if (!response.ok) {
          throw new Error('Error al cargar los roles de subcuentas existentes.');
        }
        const data = await response.json();
        const uniqueRoles = [...new Set(data.subaccounts.map(subaccount => subaccount.role))];
        setRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setSnackbar({ open: true, message: error.message || 'Error al cargar los roles', severity: 'error' });
      }
    };
    fetchRolesFromSubaccounts();
  }, []);

  const fetchSubaccounts = async () => {
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: { 'Authorization': localStorage.getItem('token') },
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching subaccounts:', error);
        throw new Error(error.message || 'Error al cargar las subcuentas');
      }
      const data = await response.json();
      const userIdLocal = localStorage.getItem('userId');
      const userSubaccounts = data.subaccounts.filter(subaccount => subaccount.userId === userIdLocal);
      setSubaccounts(userSubaccounts);
    } catch (error) {
      console.error('Error fetching subaccounts:', error);
      setSnackbar({ open: true, message: error.message || 'Error al cargar las subcuentas', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchSubaccounts();
  }, []);

  const handleAddSubaccount = async () => {
    // Eliminamos la verificación de "permissions.length === 0"
    if (!username || !password || !confirmPassword || !role ||
        selectedSubdashboards.length === 0 || navbarAccess.length === 0
    ) {
      setSnackbar({ open: true, message: 'Por favor, complete todos los campos del formulario', severity: 'warning' });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: 'Las contraseñas no coinciden', severity: 'error' });
      return;
    }
    try {
      // Validar si el username ya existe
      const checkResponse = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json',
        },
      });
      if (!checkResponse.ok) {
        throw new Error('Error al validar los usuarios existentes.');
      }
      const data = await checkResponse.json();
      if (data.subaccounts && data.subaccounts.length > 0) {
        const usernameExists = data.subaccounts.some(subaccount => subaccount.username === username);
        if (usernameExists) {
          setSnackbar({ open: true, message: 'El nombre de usuario ya existe', severity: 'warning' });
          return;
        }
      }
      const userIdadmin = localStorage.getItem('userId');
      // No agregamos permissions
      const subaccountData = {
        username,
        password,
        role,
        subdashboards: selectedSubdashboards,
        description,
        navbarAccess,
        userIdadmin,
      };
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/roluser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify(subaccountData),
      });
      if (!response.ok) {
        const errorResp = await response.json();
        throw new Error(errorResp.message || 'Error al añadir la subcuenta');
      }
      const newSubaccount = await response.json();
      setSubaccounts([...subaccounts, newSubaccount]);
      // Reset fields
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setDescription('');
      setNavbarAccess([]);
      // (Quitado: setPermissions([]);)
      setSnackbar({ open: true, message: 'Subcuenta añadida exitosamente', severity: 'success' });
      fetchSubaccounts();
    } catch (error) {
      console.error('Error adding subaccount:', error);
      setSnackbar({ open: true, message: error.message || 'Error al añadir la subcuenta', severity: 'error' });
    }
  };

  const handleOpenEditDialog = (index) => {
    const subaccountToEdit = subaccounts[index];
    setEditData({
      username: subaccountToEdit.username,
      description: subaccountToEdit.description || '',
      role: subaccountToEdit.role,
      // (Quitado: permissions: Array.isArray(subaccountToEdit.permissions) ? subaccountToEdit.permissions : []),
      subdashboards: Array.isArray(subaccountToEdit.subdashboards) ? subaccountToEdit.subdashboards : [],
      navbarAccess: Array.isArray(subaccountToEdit.navbarAccess) ? subaccountToEdit.navbarAccess : [],
    });
    setEditIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(null);
  };

  const handleEditSubmit = async () => {
    const updatedData = {
      userId: subaccounts[editIndex].userId,
      subaccountId: subaccounts[editIndex].subaccountId,
      username: editData.username,
      description: editData.description,
      role: editData.role,
      // (Quitado: permissions: editData.permissions),
      subdashboards: editData.subdashboards,
      navbarAccess: editData.navbarAccess,
    };
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/roluser', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la subcuenta');
      }
      // Sin permissions
      const updatedSubaccount = await response.json();
      const updatedSubaccounts = [...subaccounts];
      updatedSubaccounts[editIndex] = { ...subaccounts[editIndex], ...updatedData };
      setSubaccounts(updatedSubaccounts);
      setSnackbar({ open: true, message: 'Subcuenta actualizada exitosamente', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error updating subaccount:', error);
      setSnackbar({ open: true, message: error.message || 'Error al actualizar la subcuenta', severity: 'error' });
    }
  };

  const handleOpenDeleteDialog = (index) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleDeleteSubaccount = async () => {
    const subaccountToDelete = subaccounts[deleteIndex];
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/deleteuser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          userId: subaccountToDelete.userId,
          subaccountId: subaccountToDelete.subaccountId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar la subcuenta');
      }
      setSubaccounts(subaccounts.filter((_, i) => i !== deleteIndex));
      setSnackbar({ open: true, message: 'Subcuenta eliminada exitosamente', severity: 'success' });
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting subaccount:', error);
      setSnackbar({ open: true, message: error.message || 'Error al eliminar la subcuenta', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // (Quitado handlePermissionsChange por completo)

  const handleRoleChange = (event) => {
    const value = event.target.value;
    if (value === 'new') {
      setIsNewRole(true);
      setRole('');
    } else {
      setIsNewRole(false);
      setRole(value);
    }
  };

  const fetchRoleDetails = async () => {
    try {
      const response = await fetch('https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getroluser', {
        headers: { 'Authorization': localStorage.getItem('token') },
      });
      if (!response.ok) {
        throw new Error('Error al cargar los detalles del rol.');
      }
      const data = await response.json();
      const selectedRoleData = data.subaccounts.find(subaccount => subaccount.role === role);
      if (selectedRoleData) {
        setSelectedSubdashboards(selectedRoleData.subdashboards || []);
        setNavbarAccess(selectedRoleData.navbarAccess || []);
        // (Quitado: setPermissions(selectedRoleData.permissions || []);)
        setDescription(selectedRoleData.description || '');
      } else {
        setSnackbar({
          open: true,
          message: 'No se encontraron datos para el rol seleccionado',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
      setSnackbar({ open: true, message: error.message || 'Error al cargar los detalles del rol', severity: 'error' });
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div style={{
        marginLeft: "250px", padding: "20px", maxWidth: "100%",
        overflowX: "auto", backgroundColor: '#f5f5f5', minHeight: '100vh'
      }}>
        <h2>Gestión de Subcuentas</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewSubaccountsOpen}
          style={{ marginBottom: 20 }}
        >
          Ver Subcuentas
        </Button>

        {/* Dialog para visualizar subcuentas */}
        <Dialog
          open={viewSubaccountsOpen}
          onClose={handleViewSubaccountsClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Subcuentas</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre de Usuario</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Descripción</TableCell>
                    {/* (Quitado columna Permisos)
                        <TableCell>Permisos</TableCell>
                    */}
                    <TableCell>Acceso al Navbar</TableCell>
                    <TableCell>Subdashboards</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subaccounts.map((subaccount, index) => (
                    <TableRow key={index}>
                      <TableCell>{subaccount.username}</TableCell>
                      <TableCell>{subaccount.role}</TableCell>
                      <TableCell>{subaccount.description || ''}</TableCell>
                      {/* (Quitado permisos)
                          <TableCell>
                            {Array.isArray(subaccount.permissions)
                              ? subaccount.permissions.join(', ')
                              : ''}
                          </TableCell>
                      */}
                      <TableCell>
                        {Array.isArray(subaccount.navbarAccess)
                          ? subaccount.navbarAccess.join(', ')
                          : ''}
                      </TableCell>
                      <TableCell>
                        {Array.isArray(subaccount.subdashboards)
                          ? subaccount.subdashboards.join(', ')
                          : ''}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenEditDialog(index)}>Editar</Button>
                        <Button onClick={() => handleOpenDeleteDialog(index)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleViewSubaccountsClose} color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Campos para crear nueva subcuenta */}
        <TextField
          label="Descripción"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Nombre de Usuario"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <TextField
          label="Confirmar Contraseña"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="subdashboard-label">Subdashboards</InputLabel>
          <Select
            labelId="subdashboard-label"
            multiple
            value={selectedSubdashboards}
            onChange={(e) =>
              setSelectedSubdashboards(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value
              )
            }
            label="Subdashboards"
            renderValue={(selected) =>
              selected
                .map(id => subdashboards.find(sub => sub.id === id)?.name)
                .join(', ')
            }
          >
            {subdashboards.map((subdashboard) => (
              <MenuItem key={subdashboard.id} value={subdashboard.id}>
                {subdashboard.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="navbar-access-label">Acceso al Navbar</InputLabel>
          <Select
            labelId="navbar-access-label"
            multiple
            value={navbarAccess}
            onChange={(e) =>
              setNavbarAccess(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value
              )
            }
            label="Acceso al Navbar"
            renderValue={(selected) =>
              selected
                .map(value => navbarOptions.find(option => option.value === value)?.label)
                .join(', ')
            }
          >
            {navbarOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* (Quitado bloque FormControl de Permisos) */}

        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            value={isNewRole ? 'new' : role}
            onChange={handleRoleChange}
            label="Rol"
          >
            <MenuItem value="new"><em>Agregar nuevo rol</em></MenuItem>
            {roles.map((existingRole) => (
              <MenuItem key={existingRole} value={existingRole}>{existingRole}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {role && !isNewRole && (
          <Button
            variant="contained"
            color="secondary"
            onClick={fetchRoleDetails}
            style={{ marginTop: 10 }}
          >
            Traer Datos del Rol
          </Button>
        )}
        {isNewRole && (
          <TextField
            margin="dense"
            label="Nuevo Rol"
            type="text"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        )}

        <div style={{ marginTop: 20 }}>
          <Button variant="contained" color="primary" onClick={handleAddSubaccount}>
            Añadir Subcuenta
          </Button>
        </div>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Diálogo para Editar Subcuenta */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Editar Subcuenta</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nombre de Usuario"
              type="text"
              fullWidth
              value={editData.username}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Descripción"
              type="text"
              fullWidth
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Rol"
              type="text"
              fullWidth
              value={editData.role}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            />

            {/* (Quitado bloque FormControl de Permisos) */}

            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-subdashboard-label">Subdashboards</InputLabel>
              <Select
                labelId="edit-subdashboard-label"
                multiple
                value={editData.subdashboards}
                onChange={(e) => setEditData({ ...editData, subdashboards: e.target.value })}
                renderValue={(selected) =>
                  selected
                    .map(id => subdashboards.find(sub => sub.id === id)?.name)
                    .join(', ')
                }
              >
                {subdashboards.map((subdashboard) => (
                  <MenuItem key={subdashboard.id} value={subdashboard.id}>
                    {subdashboard.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-navbar-access-label">Acceso al Navbar</InputLabel>
              <Select
                labelId="edit-navbar-access-label"
                multiple
                value={editData.navbarAccess}
                onChange={(e) => setEditData({ ...editData, navbarAccess: e.target.value })}
                renderValue={(selected) =>
                  selected
                    .map(value => navbarOptions.find(option => option.value === value)?.label)
                    .join(', ')
                }
              >
                {navbarOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para Eliminar Subcuenta */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <p>¿Estás seguro de que deseas eliminar esta subcuenta?</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteSubaccount} color="secondary">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Subcuenta;
