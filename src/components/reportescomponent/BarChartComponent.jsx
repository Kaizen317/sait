import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const BarChartComponent = ({ data, title }) => {
  console.log("Datos recibidos en BarChartComponent:", data); // Depuración

  // Verificar si los datos están vacíos o no tienen la estructura esperada
  if (!data || !data.labels || !data.datasets) {
    console.error("Datos no válidos:", data);
    return <div>No hay datos disponibles para mostrar.</div>;
  }

  // Configurar los datos para el gráfico
  const chartData = {
    labels: data.labels, // Fechas (time)
    datasets: data.datasets.map((dataset, index) => ({
      label: dataset.label, // Nombre de la variable
      data: dataset.data, // Valores de la variable
      backgroundColor: dataset.backgroundColor || `rgba(0, 0, 0, 0.8)`, // Color de fondo oscuro por defecto
      borderColor: dataset.borderColor || `rgba(0, 0, 0, 1)`, // Color del borde oscuro por defecto
      borderWidth: dataset.borderWidth || 1, // Grosor del borde por defecto
      borderRadius: dataset.borderRadius || 0, // Bordes redondeados por defecto
    })),
  };

  return (
    <div
      style={{
        width: "100%",
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

      <Bar
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

BarChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired, // Fechas (time)
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired, // Nombre de la variable
        data: PropTypes.arrayOf(PropTypes.number).isRequired, // Valores de la variable
        backgroundColor: PropTypes.string, // Color de fondo
        borderColor: PropTypes.string, // Color del borde
        borderWidth: PropTypes.number, // Grosor del borde
        borderRadius: PropTypes.number, // Bordes redondeados
      })
    ).isRequired,
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default BarChartComponent;