import React from "react";
import { Button, Box, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";

/**
 * Botón para añadir un nuevo componente al dashboard
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClick - Función a ejecutar al hacer clic en el botón
 * @param {boolean} props.disabled - Indica si el botón está deshabilitado
 * @param {string} props.tooltipText - Texto a mostrar en el tooltip
 */
const AddComponentButton = ({ onClick, disabled, tooltipText }) => {
  const button = (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      startIcon={<Add />}
      sx={{
        background: "linear-gradient(90deg, #70bc7e, #5ea66b)",
        color: "#fff",
        padding: "10px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(112, 188, 126, 0.3)",
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.95rem",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "linear-gradient(90deg, #5ea66b, #4d8a59)",
          boxShadow: "0 6px 12px rgba(112, 188, 126, 0.4)",
          transform: "translateY(-2px)",
        },
        "&:disabled": {
          background: "#e0e0e0",
          color: "#a0a0a0",
          boxShadow: "none",
          transform: "none",
        },
      }}
    >
      Añadir Componente
    </Button>
  );

  // Si hay texto para el tooltip, envolver el botón en un Tooltip
  if (tooltipText) {
    return (
      <Tooltip title={tooltipText} placement="top">
        <Box sx={{ display: "inline-block" }}>{button}</Box>
      </Tooltip>
    );
  }

  return button;
};

export default AddComponentButton;
