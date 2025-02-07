import React from "react";
import PropTypes from "prop-types";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const ValueCardComponent = ({ variables, title }) => {
  // Verificar si hay datos
  if (!variables || variables.length === 0) {
    return (
      <div style={{
        width: "100%",
        height: "100%",
        padding: "15px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div style={{ fontSize: "14px", color: "#666" }}>
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      height: "100%",
      padding: "15px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <div style={{
        fontSize: "14px",
        color: "#666",
        marginBottom: "8px"
      }}>
        {title}
      </div>

      {/* Mostrar todas las variables */}
      {variables.map((variable, index) => {
        const values = variable.data || [];
        const currentValue = values[values.length - 1] || 0;
        const previousValue = values[values.length - 2] || 0;

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
          <div key={index} style={{ marginBottom: "16px" }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "4px"
            }}>
              {variable.value}: {currentValue.toFixed(1)}
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              color: getTrendColor(percentageChange),
              fontSize: "12px"
            }}>
              {percentageChange > 0 ? (
                <ArrowUpward style={{ fontSize: 16 }} />
              ) : percentageChange < 0 ? (
                <ArrowDownward style={{ fontSize: 16 }} />
              ) : null}
              <span style={{ marginLeft: "4px" }}>
                {Math.abs(percentageChange).toFixed(1)}%
              </span>
              <span style={{
                marginLeft: "4px",
                fontSize: "11px",
                color: "#666"
              }}>
                vs anterior
              </span>
            </div>
          </div>
        );
      })}
    </div>
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
};

export default ValueCardComponent;