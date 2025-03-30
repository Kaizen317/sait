import React, { useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Typography, Button, Stack } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Registrar los plugins necesarios
Chart.register(...registerables, ChartDataLabels, zoomPlugin);

const BarChartComponent = ({ data, title, height = 700 }) => {
  const chartRef = useRef(null);
  
  // Función para restablecer el zoom
  const resetZoom = () => {
    if (chartRef.current) {
      const chart = chartRef.current;
      if (chart && chart.resetZoom) {
        chart.resetZoom();
      } else if (chart.chart && chart.chart.resetZoom) {
        chart.chart.resetZoom();
      }
    }
  };
  
  // Efecto para asegurar que el zoom se inicialice correctamente
  useEffect(() => {
    return () => {
      // Cleanup al desmontar
      if (chartRef.current && chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, []);
  
  // Colores profesionales predeterminados para las barras
  const defaultColors = [
    "#3a86ff", "#ff006e", "#8338ec", "#fb5607", "#06d6a0",
    "#118ab2", "#ef476f", "#073b4c", "#0077b6", "#ffbe0b"
  ];

  // Asegurarse de que los datos tengan la estructura correcta
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: 1, // Ajustado para barras (normalmente no necesitan borde grueso),
    })),
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: height ? `${height}px` : "700px", // Usar 700px según preferencia del usuario
        padding: "15px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontSize: "22px",
          marginBottom: "10px",
          color: "#333",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {title}
      </Typography>
      {/* Mostrar estadísticas */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        {chartData.datasets.map((dataset, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{
              color: dataset.backgroundColor || defaultColors[index % defaultColors.length],
              fontSize: "12px",
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
            }}
          >
            {dataset.label}: Máx: {dataset.maxValue?.toLocaleString() || "N/A"}, 
            Mín: {dataset.minValue?.toLocaleString() || "N/A"}, 
            Prom: {dataset.avgValue?.toLocaleString() || "N/A"}
          </Typography>
        ))}
      </Box>
      
      {/* Controles de zoom */}
      <Stack 
        direction="row" 
        spacing={1} 
        justifyContent="center" 
        sx={{ mb: 1 }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={resetZoom}
          sx={{ 
            fontSize: '0.75rem', 
            py: 0.5,
            borderColor: '#006a75',
            color: '#006a75',
            '&:hover': {
              borderColor: '#004a52',
              backgroundColor: 'rgba(0,106,117,0.1)'
            }
          }}
        >
          Restablecer Zoom
        </Button>
      </Stack>
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          minHeight: 0, 
          position: "relative", 
          width: "100%",
          height: 'calc(100% - 100px)', // Restar espacio para título, estadísticas y botón
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& canvas': {
            maxWidth: "100% !important",
            width: "100% !important",
            height: "100% !important",
          }
        }}
      >
        <Bar
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // Desactivar relación de aspecto para controlar altura
            animation: {
              duration: 1200,
              easing: "easeOutQuart",
            },
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    family: "Helvetica Neue, Arial, sans-serif",
                    size: 14,
                  },
                  color: "#444",
                  padding: 10,
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4,
                titleFont: {
                  size: 14,
                  weight: "bold",
                },
                bodyFont: {
                  size: 13,
                },
                displayColors: true,
                boxWidth: 10,
                boxHeight: 10,
                boxPadding: 3,
                usePointStyle: true,
              },
              datalabels: {
                display: false, // Ocultar las etiquetas numéricas sobre las barras
                color: "#333",
                anchor: "end",
                align: "top",
                formatter: (value) => value.toLocaleString(),
                font: {
                  weight: "bold",
                  size: 11,
                },
                padding: {
                  top: 5,
                  bottom: 5,
                },
              },
              // Configuración del plugin de zoom
              zoom: {
                limits: {
                  x: {minRange: 1},
                  y: {minRange: 1}
                },
                pan: {
                  enabled: true,
                  mode: 'xy',
                  modifierKey: 'ctrl',
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true
                  },
                  drag: {
                    enabled: true,
                    backgroundColor: 'rgba(0,106,117,0.2)',
                    borderColor: '#006a75',
                    borderWidth: 1
                  },
                  mode: 'xy',
                },
              }
            },
            scales: {
              x: {
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                  font: {
                    family: "Helvetica Neue, Arial, sans-serif",
                    size: 12,
                  },
                  color: "#666",
                  maxRotation: 45,
                  minRotation: 0,
                },
              },
              y: {
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                  font: {
                    family: "Helvetica Neue, Arial, sans-serif",
                    size: 12,
                  },
                  color: "#666",
                  callback: (value) => value.toLocaleString(),
                },
                beginAtZero: true,
              },
            },
            layout: {
              padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 10,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.array.isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        data: PropTypes.array.isRequired,
        backgroundColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.array,
        ]),
        borderColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.array,
        ]),
        maxValue: PropTypes.number,
        minValue: PropTypes.number,
        avgValue: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
};

BarChartComponent.defaultProps = {
  height: 700,
};

export default BarChartComponent;