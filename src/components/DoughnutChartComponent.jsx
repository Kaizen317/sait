import React from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Box, Typography } from "@mui/material";

const DoughnutChartComponent = ({ data, title, subtitle, height }) => {
  // Paleta de colores premium
  const premiumColors = [
    "#2563EB", "#0891B2", "#059669", "#7C3AED", 
    "#DB2777", "#DC2626", "#D97706", "#4F46E5"
  ];
  
  // Función para ajustar color (más oscuro o más claro)
  const adjustColor = (color, amount) => {
    const clamp = (val) => Math.min(255, Math.max(0, val));
    
    // Convertir hex a RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Ajustar valores
    const adjustedR = clamp(r + amount);
    const adjustedG = clamp(g + amount);
    const adjustedB = clamp(b + amount);
    
    // Convertir de vuelta a hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
  };

  // Plugin personalizado para el efecto de sombra interior
  const innerGlowPlugin = {
    id: 'innerGlow',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.restore();
    }
  };

  // Configuración mejorada de datos
  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || premiumColors,
      borderColor: "#ffffff",
      borderWidth: 3,
      spacing: 3,
      borderRadius: 4,
      hoverOffset: 15,
      hoverBorderWidth: 4,
      hoverBorderColor: "#ffffff"
    })),
  };

  // Opciones premium
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Desactivar relación de aspecto para controlar altura
    cutout: '70%',
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 20,
          color: "#1E293B",
          font: {
            size: 13,
            weight: '500',
            family: "'SF Pro Display', 'Inter', system-ui, sans-serif",
            lineHeight: 1.5
          },
          usePointStyle: true,
          pointStyle: 'rectRounded',
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels;
            const data = datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            
            return labels.map((label, i) => {
              const value = data[i];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: datasets[0].backgroundColor[i],
                strokeStyle: "#fff",
                lineWidth: 1,
                hidden: false,
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#0F172A",
        bodyColor: "#334155",
        titleFont: {
          size: 14,
          weight: '600',
          family: "'SF Pro Display', 'Inter', system-ui, sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'SF Pro Display', 'Inter', system-ui, sans-serif"
        },
        padding: 16,
        cornerRadius: 10,
        boxPadding: 6,
        displayColors: true,
        borderColor: "rgba(226, 232, 240, 0.8)",
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    elements: {
      arc: {
        borderWidth: 3
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 20,
        right: 20
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    hover: {
      mode: 'index',
      intersect: true,
    }
  };

  return (
    <Box
      sx={{
        width: "100%", // Ajustado de maxWidth: "750px" a 100% para ocupar todo el espacio disponible
        height: height ? `${height}px` : "450px", // Usar la prop height si se proporciona
        maxWidth: "750px", // Mantener un ancho máximo para evitar que se desborde
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        "& canvas": {
          maxWidth: "100% !important",
          width: "100% !important",
          height: "100% !important", // Asegurar que el canvas ocupe toda la altura
        },
      }}
    >
      {/* Título y subtítulo */}
      <Box sx={{ marginBottom: "20px" }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#0F172A",
            fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
            letterSpacing: "0.2px",
            margin: "0 0 4px 0"
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: "14px",
              color: "#64748B",
              fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
              margin: 0
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {/* Panel principal con gráfico */}
      <Box sx={{ flex: "1", display: "flex", flexDirection: "column" }}>
        {/* Área del gráfico */}
        <Box sx={{ flex: "1", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Doughnut 
            data={chartData} 
            options={options}
            plugins={[innerGlowPlugin]}
          />
        </Box>
        
        {/* Información de resumen en la parte inferior */}
        {data.datasets && data.datasets[0] && data.datasets[0].data && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0 5px 0",
              borderTop: "1px solid rgba(226, 232, 240, 0.6)",
              marginTop: "10px"
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "13px",
                color: "#64748B",
                fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif"
              }}
            >
              Elementos: <span style={{ fontWeight: "600", color: "#334155" }}>
                {data.labels?.length || 0}
              </span>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "13px",
                color: "#64748B",
                fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif"
              }}
            >
              Total: <span style={{ fontWeight: "600", color: "#334155" }}>
                {data.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}
              </span>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

DoughnutChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string),
        ]),
        borderColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string),
        ]),
        borderWidth: PropTypes.number,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  height: PropTypes.number, // Nueva prop para controlar la altura
};

DoughnutChartComponent.defaultProps = {
  subtitle: undefined,
  height: 450, // Valor por defecto si no se proporciona
};

export default DoughnutChartComponent;