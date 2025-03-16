import React from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const MixedChartComponent = ({ data, title, height }) => {
  // Paleta de colores moderna y profesional
  const chartColors = {
    bar: [
      "rgba(75, 192, 192, 0.7)",  // Verde azulado
      "rgba(54, 162, 235, 0.7)",  // Azul
      "rgba(255, 159, 64, 0.7)",  // Naranja
      "rgba(153, 102, 255, 0.7)", // Púrpura
      "rgba(255, 99, 132, 0.7)",  // Rosa
      "rgba(255, 206, 86, 0.7)",  // Amarillo
    ],
    line: [
      "rgba(75, 192, 192, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(255, 206, 86, 1)",
    ],
    hover: [
      "rgba(75, 192, 192, 0.9)",
      "rgba(54, 162, 235, 0.9)",
      "rgba(255, 159, 64, 0.9)",
      "rgba(153, 102, 255, 0.9)",
      "rgba(255, 99, 132, 0.9)",
      "rgba(255, 206, 86, 0.9)",
    ]
  };

  console.log("Datos recibidos en MixedChartComponent:", data);

  // Validar que los datos existan y tengan datasets
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return (
      <Box
        sx={{
          width: "100%",
          height: height ? `${height}px` : "400px", // Altura aumentada
          padding: "24px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
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

  // Configuración del gráfico mixto con mejores colores
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || 
        (dataset.type === "line" ? "transparent" : chartColors.bar[index % chartColors.bar.length]),
      borderColor: dataset.borderColor || chartColors.line[index % chartColors.line.length],
      borderWidth: dataset.borderWidth || (dataset.type === "line" ? 3 : 1),
      fill: dataset.fill || false,
      type: dataset.type || "bar",
      // Mejoras para líneas
      pointRadius: dataset.type === "line" ? 4 : undefined,
      pointHoverRadius: dataset.type === "line" ? 7 : undefined,
      pointBackgroundColor: dataset.type === "line" ? "#fff" : undefined,
      pointBorderWidth: dataset.type === "line" ? 2 : undefined,
      // Mejoras para barras
      hoverBackgroundColor: dataset.type !== "line" ? 
        chartColors.hover[index % chartColors.hover.length] : undefined,
      borderRadius: dataset.type !== "line" ? 6 : undefined,
    })),
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: height ? `${height}px` : "400px", // Altura aumentada
        padding: "28px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        "& canvas": {
          maxWidth: "100% !important",
          width: "100% !important",
          height: "100% !important",
        },
      }}
      role="figure"
      aria-label={`Mixed chart: ${title}`}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontSize: "24px",
          marginBottom: "20px",
          color: "#333",
          fontFamily: '"Poppins", "Helvetica Neue", Arial, sans-serif',
          letterSpacing: "0.5px",
          fontWeight: "600",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
        <Chart
          type="bar"
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000, // Animación más larga para mejor efecto visual
              easing: "easeOutQuart"
            },
            plugins: {
              legend: {
                position: "top",
                align: "center",
                labels: {
                  boxWidth: 15,
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    family: '"Poppins", "Helvetica Neue", Arial, sans-serif',
                    size: 13,
                    weight: "600"
                  },
                  color: "#555",
                },
              },
              tooltip: {
                backgroundColor: "rgba(50,50,50,0.85)",
                titleFont: { 
                  size: 16, 
                  weight: "bold",
                  family: '"Poppins", Arial, sans-serif' 
                },
                bodyFont: { 
                  size: 14,
                  family: '"Poppins", Arial, sans-serif' 
                },
                padding: 14,
                cornerRadius: 8,
                caretSize: 6,
                borderColor: "#1e88e5",
                borderWidth: 1,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.raw}`;
                  },
                },
              },
              datalabels: {
                color: "#333",
                anchor: "end",
                align: "top",
                formatter: Math.round,
                font: {
                  weight: "bold"
                }
              }
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
                type: "category",
                grid: {
                  display: false,
                },
                border: {
                  color: "#ddd"
                },
                ticks: {
                  color: "#555",
                  font: {
                    size: 13,
                    family: '"Poppins", Arial, sans-serif',
                    weight: "500"
                  },
                  maxRotation: 45,
                  minRotation: 45,
                  padding: 10
                },
              },
              y: {
                beginAtZero: true,
                border: {
                  color: "#ddd"
                },
                grid: {
                  color: "#f5f5f5",
                  lineWidth: 1,
                  drawBorder: false
                },
                ticks: {
                  color: "#555",
                  font: {
                    size: 13,
                    family: '"Poppins", Arial, sans-serif',
                    weight: "500"
                  },
                  padding: 10,
                  callback: function(value) {
                    return value.toLocaleString();
                  }
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

MixedChartComponent.propTypes = {
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
        type: PropTypes.oneOf(["bar", "line"]),
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
};

MixedChartComponent.defaultProps = {
  height: 400, // Altura predeterminada aumentada
};

export default MixedChartComponent;