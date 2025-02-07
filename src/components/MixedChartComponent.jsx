import React from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";

const MixedChartComponent = ({ data, title }) => {
  console.log("Datos recibidos en MixedChartComponent:", data); // Depuración

  // Configuración del gráfico mixto
  const chartData = {
    labels: data.labels || [], // Etiquetas del eje X
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "#36a2eb", // Color por defecto para barras
      borderColor: dataset.borderColor || "#ff6384", // Color por defecto para líneas
      borderWidth: dataset.borderWidth || 2, // Grosor por defecto
      fill: dataset.fill || false, // Por defecto no rellenar
      type: dataset.type || "bar", // Tipo de gráfico (bar o line)
    })),
  };

  return (
    <div
      style={{
        width: "95%",
        height: "320px",
        padding: "20px",
        marginBottom: "30px",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          fontSize: "22px",
          marginBottom: "15px",
          color: "#444",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {title}
      </h3>

      <Chart
        type="bar" // Tipo base del gráfico
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: {
                  family: "Helvetica Neue, Arial, sans-serif",
                  size: 15,
                },
                color: "#333",
                padding: 15,
              },
            },
            tooltip: {
              backgroundColor: "rgba(50,50,50,0.8)",
              titleFont: { size: 16, weight: "bold" },
              bodyFont: { size: 14 },
              padding: 12,
              borderColor: "#1e88e5",
              borderWidth: 1,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw}`;
                },
              },
            },
          },
          scales: {
            x: {
              type: "category", // Escala de categoría para el eje X
              grid: {
                display: false,
              },
              ticks: {
                color: "#333",
                font: {
                  size: 14,
                  family: "Arial, sans-serif",
                },
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "#eee",
              },
              ticks: {
                color: "#333",
                font: {
                  size: 14,
                  family: "Arial, sans-serif",
                },
              },
            },
          },
        }}
      />
    </div>
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
        type: PropTypes.oneOf(["bar", "line"]), // Tipo de gráfico
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default MixedChartComponent;