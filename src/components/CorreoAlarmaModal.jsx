import React, { useState, useEffect } from 'react';
import { Modal, TextField, Button, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CorreoAlarmaModal = ({ open, onClose, onSave, initialEmail, initialInterval }) => {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [emailList, setEmailList] = useState([]);
  const [interval, setInterval] = useState(initialInterval);

  useEffect(() => {
    setEmailInput(initialEmail);
    setInterval(initialInterval);
  }, [initialEmail, initialInterval]);

  const handleAddEmail = () => {
    console.log('Correo ingresado:', emailInput);
    if (emailInput && !emailList.includes(emailInput)) {
      setEmailList([...emailList, emailInput]);
      setEmailInput('');
    }
  };

  const handleDeleteEmail = (email) => {
    setEmailList(emailList.filter(e => e !== email));
  };

  const handleSave = () => {
    console.log('Lista de correos antes de guardar:', emailList);
    onSave(emailList, interval);
    setEmailList([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', margin: 'auto', mt: 5, maxWidth: 400 }}>
        <h2>Agregar Correos de Alerta</h2>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          helperText="Ingrese un correo electrónico"
        />
        <Button variant="contained" color="primary" onClick={handleAddEmail} sx={{ mt: 2 }}>
          Agregar
        </Button>
        <List>
          {emailList.map((email, index) => (
            <ListItem key={index} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEmail(email)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={email} />
            </ListItem>
          ))}
        </List>
        <TextField
          label="Intervalo de Envío (segundos)"
          type="number"
          variant="outlined"
          fullWidth
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          helperText="Ingrese el intervalo de tiempo en segundos"
          sx={{ mt: 2 }}
        />
        <Button variant="contained" color="secondary" onClick={handleSave} sx={{ mt: 2 }}>
          Guardar
        </Button>
      </Box>
    </Modal>
  );
};

export default CorreoAlarmaModal;
