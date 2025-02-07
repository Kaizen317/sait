import React from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const AreaChartComponent = ({ data, title }) => {
  // console.log("Datos recibidos en AreaChartComponent:", data); // Depuración

  // Colores con mayor transparencia (alpha más bajo)
  const defaultColors = [
    "rgba(235, 55, 127, 0.2)", // Rosa con mayor transparencia
    "rgba(54, 162, 235, 0.2)", // Azul con mayor transparencia
    "rgba(75, 192, 192, 0.2)", // Verde con mayor transparencia
    "rgba(255, 206, 86, 0.2)", // Amarillo con mayor transparencia
    "rgba(153, 102, 255, 0.2)", // Morado con mayor transparencia
  ];

  // Asegúrate de que los datos tengan la estructura correcta
  const chartData = {
    labels: data.labels || [], // Si no hay labels, usa un arreglo vacío
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length], // Color con mayor transparencia
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length], // Color sólido
      borderWidth: dataset.borderWidth || 2, // Grosor por defecto
      fill: true, // Rellenar el área bajo la línea
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

      <Line
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
              backgroundColor: "rgba(50,50,50,0.2)",
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
          elements: {
            line: {
              tension: 0.4, // Curvatura de la línea
            },
          },
          scales: {
            x: {
              type: "category", // Usar escala de categoría en lugar de tiempo
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
};

export default AreaChartComponent;