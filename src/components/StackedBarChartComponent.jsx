import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Box, Typography } from "@mui/material";

// Registrar los plugins necesarios
Chart.register(...registerables, ChartDataLabels);

const StackedBarChartComponent = ({ data, title, height }) => {
  // Validar que los datos existan y tengan datasets
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return (
      <Box
        sx={{
          width: "100%",
          height: height ? `${height}px` : "300px", // Usar altura por defecto consistente
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="error">
          Error: Datos inválidos o no proporcionados
        </Typography>
      </Box>
    );
  }

  // Colores profesionales predeterminados
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
      borderWidth: dataset.borderWidth || 2,
    })),
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: height ? `${height}px` : "300px", // Usar la prop height si se proporciona
        padding: "10px 0",
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
      role="figure"
      aria-label={`Stacked bar chart: ${title}`}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontSize: "20px",
          marginBottom: "25px",
          color: "#2c3e50",
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontWeight: "600",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                reverse: true,
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
                mode: "index",
                intersect: false,
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
              datalabels: {
                display: false, // Ocultar los valores numéricos
              },
            },
            layout: {
              padding: {
                left: 10,
                right: 25,
                top: 20,
                bottom: 10
              }
            },
            scales: {
              x: {
                stacked: true,
                border: {
                  display: true,
                  color: "#ddd"
                },
                grid: {
                  display: false,
                },
                ticks: {
                  color: "#666",
                  font: {
                    size: 12,
                    family: "Arial, sans-serif",
                  },
                  callback: function(value) {
                    const label = this.getLabelForValue(value);
                    if (label && !isNaN(new Date(label).getTime())) {
                      const date = new Date(label);
                      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                    }
                    return label;
                  },
                },
              },
              y: {
                stacked: true,
                border: {
                  display: true,
                  color: "#ddd"
                },
                grid: {
                  color: "#f0f0f0",
                },
                ticks: {
                  color: "#666",
                  font: {
                    size: 12,
                    family: "Arial, sans-serif",
                  },
                },
                beginAtZero: true,
              },
            },
            datasets: {
              bar: {
                categoryPercentage: 0.8,
                barPercentage: 0.9,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

StackedBarChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number, // Nueva prop para controlar la altura
};

StackedBarChartComponent.defaultProps = {
  height: 300, // Valor por defecto consistente con DashboardConfig
};

export default StackedBarChartComponent;