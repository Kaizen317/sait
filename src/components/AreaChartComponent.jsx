import React, { useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Box, Typography, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";

const AreaChartComponent = ({ data, title, height, darkMode = false }) => {
  const chartRef = useRef(null);
  
  // Configuración de apariencia según el modo
  const appearance = {
    background: darkMode ? '#1a2138' : '#ffffff',
    titleColor: darkMode ? '#e4e6eb' : '#2c3e50',
    boxShadow: darkMode 
      ? "0 8px 24px rgba(0, 0, 0, 0.2)" 
      : "0 6px 18px rgba(0, 0, 0, 0.08)",
    gridColor: darkMode ? 'rgba(255, 255, 255, 0.07)' : '#f5f5f5',
  };
  
  // Colores modernos para el gráfico
  const chartColors = [
    {
      fill: darkMode ? 'rgba(45, 152, 218, 0.2)' : 'rgba(45, 152, 218, 0.2)',
      line: darkMode ? '#2d98da' : '#2d98da'
    },
    {
      fill: darkMode ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.2)',
      line: darkMode ? '#9c27b0' : '#9c27b0'
    },
    {
      fill: darkMode ? 'rgba(0, 184, 148, 0.2)' : 'rgba(0, 184, 148, 0.2)',
      line: darkMode ? '#00b894' : '#00b894'
    },
    {
      fill: darkMode ? 'rgba(253, 121, 168, 0.2)' : 'rgba(253, 121, 168, 0.2)',
      line: darkMode ? '#fd79a8' : '#fd79a8'
    },
    {
      fill: darkMode ? 'rgba(254, 202, 87, 0.2)' : 'rgba(254, 202, 87, 0.2)',
      line: darkMode ? '#feca57' : '#feca57'
    }
  ];

  // Crear gradientes para áreas
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;
      
      if (data && data.datasets && chart.ctx) {
        data.datasets.forEach((dataset, index) => {
          try {
            const ctx = chart.ctx;
            const gradientColor = chartColors[index % chartColors.length];
            
            const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
            gradient.addColorStop(0, alpha(gradientColor.line, 0.3));
            gradient.addColorStop(1, alpha(gradientColor.line, 0.02));
            
            dataset.backgroundColor = gradient;
            chart.update();
          } catch (error) {
            console.warn("Error al crear gradiente", error);
          }
        });
      }
    }
  }, [chartRef.current, data]);

  // Validar que los datos existan y tengan datasets
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          height: height ? `${height}px` : "350px",
          padding: "20px",
          backgroundColor: appearance.background,
          borderRadius: "12px",
          boxShadow: appearance.boxShadow,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="error">
          Error: Datos inválidos o no proporcionados
        </Typography>
      </Paper>
    );
  }

  // Preparar los datos del gráfico
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset, index) => {
      const colorSet = chartColors[index % chartColors.length];
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || colorSet.fill,
        borderColor: dataset.borderColor || colorSet.line,
        borderWidth: dataset.borderWidth || 2,
        pointRadius: 4,
        pointBackgroundColor: colorSet.line,
        pointBorderColor: darkMode ? '#1a2138' : '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colorSet.line,
        pointHoverBorderColor: darkMode ? '#1a2138' : '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
      };
    }),
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        height: height ? `${height}px` : "350px",
        padding: "24px",
        backgroundColor: appearance.background,
        borderRadius: "12px",
        boxShadow: appearance.boxShadow,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: darkMode 
            ? "0 10px 28px rgba(0, 0, 0, 0.25)" 
            : "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
      }}
      role="figure"
      aria-label={`Area chart: ${title}`}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontSize: "22px",
          marginBottom: "20px",
          color: appearance.titleColor,
          fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
          fontWeight: "600",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                position: "top",
                align: "end",
                labels: {
                  boxWidth: 12,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 20,
                  font: {
                    family: '"Poppins", "Segoe UI", Arial, sans-serif',
                    size: 13,
                    weight: '500',
                  },
                  color: appearance.titleColor,
                },
              },
              tooltip: {
                backgroundColor: darkMode ? 'rgba(26, 33, 56, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: darkMode ? '#fff' : '#2c3e50',
                bodyColor: darkMode ? '#e4e6eb' : '#2c3e50',
                titleFont: { size: 14, weight: "bold", family: '"Poppins", "Segoe UI", Arial, sans-serif' },
                bodyFont: { size: 13, family: '"Poppins", "Segoe UI", Arial, sans-serif' },
                padding: 12,
                borderColor: darkMode ? '#3d5af1' : '#ddd',
                borderWidth: 1,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                cornerRadius: 8,
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function (context) {
                    const value = context.raw;
                    return `${context.dataset.label}: ${value.toLocaleString()}`;
                  },
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
              point: {
                radius: 4,
                hoverRadius: 6,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: darkMode ? '#aaa' : '#666',
                  font: {
                    size: 12,
                    family: '"Poppins", "Segoe UI", Arial, sans-serif',
                  },
                  maxRotation: 30,
                  minRotation: 0,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: appearance.gridColor,
                  borderDash: [3, 3],
                },
                ticks: {
                  color: darkMode ? '#aaa' : '#666',
                  font: {
                    size: 12,
                    family: '"Poppins", "Segoe UI", Arial, sans-serif',
                  },
                  callback: function(value) {
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                      return (value / 1000).toFixed(1) + 'K';
                    }
                    return value;
                  }
                },
              },
            },
            animation: {
              duration: 2000,
              easing: 'easeOutQuart',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

AreaChartComponent.propTypes = {
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
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
  darkMode: PropTypes.bool,
};

AreaChartComponent.defaultProps = {
  height: 350,
  darkMode: false,
};

export default AreaChartComponent;