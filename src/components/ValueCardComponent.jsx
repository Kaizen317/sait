import React from "react";
import PropTypes from "prop-types";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

const ValueCardComponent = ({ variables, title, height }) => {
  // Verificar si hay datos
  if (!variables || variables.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: height ? `${height}px` : "100%", // Usar altura por defecto relativa
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: height ? `${height}px` : "100%", // Usar la prop height si se proporciona
        padding: "15px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      role="figure"
      aria-label={`Value card: ${title}`}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: "14px",
          color: "#666",
          marginBottom: "8px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>

      {/* Mostrar todas las variables */}
      {variables.map((variable, index) => {
        const values = variable.data || [];
        const currentValue = values.length > 0 ? values[values.length - 1] : 0;
        const previousValue = values.length > 1 ? values[values.length - 2] : 0;

        // Calcular el cambio porcentual
        const percentageChange = previousValue !== 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0;

        // Determinar el color basado en la tendencia y el color configurado
        const getTrendColor = (change) => {
          const configuredColor = variable.backgroundColor;
          if (configuredColor) return configuredColor;
          if (change > 0) return "#4caf50";
          if (change < 0) return "#f44336";
          return "#757575";
        };

        return (
          <Box key={index} sx={{ marginBottom: "16px" }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "4px",
              }}
            >
              {variable.value}: {currentValue.toFixed(1)}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", color: getTrendColor(percentageChange), fontSize: "12px" }}>
              {percentageChange > 0 ? (
                <ArrowUpward sx={{ fontSize: 16 }} />
              ) : percentageChange < 0 ? (
                <ArrowDownward sx={{ fontSize: 16 }} />
              ) : null}
              <Typography sx={{ marginLeft: "4px" }}>
                {Math.abs(percentageChange).toFixed(1)}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  marginLeft: "4px",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                vs anterior
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

ValueCardComponent.propTypes = {
  variables: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string, // Nombre de la variable (por ejemplo, "potencia")
      data: PropTypes.arrayOf(PropTypes.number), // Valores de la variable
      backgroundColor: PropTypes.string, // Color de fondo
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number, // Nueva prop para controlar la altura
};

ValueCardComponent.defaultProps = {
  height: undefined, // Dejar como relativo al contenedor padre por defecto
};

export default ValueCardComponent;