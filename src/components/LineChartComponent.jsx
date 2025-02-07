import React from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const LineChartComponent = ({ data, title }) => {
  // console.log("Datos recibidos en LineChartComponent:", data); // Depuración

  // Asegúrate de que los datos tengan la estructura correcta
  const chartData = {
    labels: data.labels || [], // Si no hay labels, usa un arreglo vacío
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || "#eb377f", // Color por defecto
      borderColor: dataset.borderColor || "#eb377f", // Color por defecto
      borderWidth: dataset.borderWidth || 2, // Grosor por defecto
      fill: dataset.fill || false, // Por defecto no rellenar
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
          elements: {
            line: {
              tension: 0.4,
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
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default LineChartComponent;