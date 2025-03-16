import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Typography, Button, Stack } from "@mui/material";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Registrar los plugins necesarios
Chart.register(...registerables, ChartDataLabels, zoomPlugin);

const LineChartComponent = ({ data, title, height = 700 }) => {
  const chartRef = useRef(null);
  
  // Función para restablecer el zoom
  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  // Colores profesionales predeterminados
  const defaultColors = [
    "#006875", "#ff006e", "#8338ec", "#fb5607", "#118ab2",
    "#ef476f", "#073b4c", "#0077b6", "#ffbe0b", "#3a86ff"
  ];

  // Verificar si los datos son válidos
  if (!data || !data.labels || !data.datasets) {
    console.warn("LineChartComponent: Datos inválidos o incompletos", data);
    return (
      <Box sx={{ 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles para mostrar
        </Typography>
      </Box>
    );
  }

  // Asegurarse de que los datos tengan la estructura correcta
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth || 3,
      fill: dataset.fill || false,
      pointBackgroundColor: "white",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBorderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
    })),
  };

  // Depuración: Mostrar las etiquetas que se pasan al gráfico
  console.log(`Labels para ${title}:`, chartData.labels);

  // Usar las opciones de prepareChart y añadir solo configuraciones específicas
  const mergedOptions = {
    ...data.options, // Usar las opciones de prepareChart, incluyendo el ticks.callback
    responsive: true,
    maintainAspectRatio: false, // Desactivar la relación de aspecto para controlar la altura manualmente
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            family: "Arial, sans-serif",
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "white",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        padding: 12,
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 3,
        cornerRadius: 4,
      },
      // Configuración para ocultar las etiquetas de datos
      datalabels: {
        display: false,
        color: 'transparent',
        labels: {
          title: {
            display: false
          },
          value: {
            display: false
          }
        }
      },
      // Configuración del plugin de zoom
      zoom: {
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
    elements: {
      point: { radius: 4 },
      line: { tension: 0.3 },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    layout: {
      padding: { left: 10, right: 25, top: 20, bottom: 10 },
    },
    scales: {
      x: {
        border: { display: true, width: 2, color: "#333" },
        grid: { display: true, color: "#f0f0f0", drawTicks: true, tickLength: 8 },
        title: {
          display: true,
          text: "PERÍODO",
          color: "#333",
          font: { family: "Arial, sans-serif", size: 14, weight: "bold" },
          padding: { top: 15 }
        }
      },
      y: {
        border: { display: true, width: 2, color: "#333" },
        position: "left",
        grid: { display: true, color: "#f0f0f0", drawTicks: true, tickLength: 8 },
        ticks: {
          color: "#333",
          font: { size: 12, weight: "bold", family: "Arial, sans-serif" },
          padding: 10,
          callback: function(value) { return value.toLocaleString(); }
        },
        title: {
          display: true,
          text: "VALORES",
          color: "#333",
          font: { family: "Arial, sans-serif", size: 14, weight: "bold" },
          padding: { bottom: 15 }
        }
      },
    },
    animations: { tension: { duration: 1000, easing: "linear" } },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: height ? `${height}px` : "700px", 
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
          fontSize: "18px",
          marginBottom: "10px",
          color: "#333",
          fontFamily: "Arial, sans-serif",
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
              color: dataset.borderColor || defaultColors[index % defaultColors.length],
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
      
      {/* Contenedor del gráfico */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          width: '100%', 
          height: 'calc(100% - 100px)', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& canvas': {
            maxWidth: '100% !important',
            width: '100% !important',
            height: '100% !important',
          }
        }}
      >
        <Line 
          data={chartData} 
          options={{
            ...mergedOptions,
            maintainAspectRatio: false,
          }} 
          ref={chartRef}
        />
      </Box>
    </Box>
  );
};

LineChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
        fill: PropTypes.bool,
        maxValue: PropTypes.number,
        minValue: PropTypes.number,
        avgValue: PropTypes.string,
      })
    ),
    options: PropTypes.object,
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number, 
};

LineChartComponent.defaultProps = {
  height: 700, 
};

export default LineChartComponent;