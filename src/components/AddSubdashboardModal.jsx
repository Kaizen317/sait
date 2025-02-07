/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Importa PropTypes para validar las props
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

const AddSubdashboardModal = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#1976d2'); // Default color

  const handleSave = () => {
    if (name) {
      onSave({ name, color }); // Guardar el subdashboard con nombre y color
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Añadir Subdashboard</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del Subdashboard"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          type="color"
          margin="dense"
          label="Color del Subdashboard"
          fullWidth
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} color="primary">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

// Añadir validación de las props con PropTypes
AddSubdashboardModal.propTypes = {
  open: PropTypes.bool.isRequired, // 'open' debe ser un booleano y es requerido
  onClose: PropTypes.func.isRequired, // 'onClose' debe ser una función y es requerida
  onSave: PropTypes.func.isRequired, // 'onSave' debe ser una función y es requerida
};

export default AddSubdashboardModal;
