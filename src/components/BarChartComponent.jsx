import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const BarChartComponent = ({ data, title }) => {
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
          color: "#333",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {title}
      </h3>

      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
              },
            },
            tooltip: {
              backgroundColor: "rgba(50,50,50,0.9)",
              titleFont: { size: 16, weight: "bold" },
              bodyFont: { size: 14 },
              padding: 10,
              borderColor: "#2196f3",
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
              grid: {
                display: false,
              },
              ticks: {
                color: "#444",
                font: {
                  size: 13,
                  family: "Arial, sans-serif",
                },
                // Si las etiquetas son fechas, formatearlas; de lo contrario, mostrarlas tal cual
                callback: function (value) {
                  const label = this.getLabelForValue(value);
                  if (label && !isNaN(new Date(label).getTime())) {
                    const date = new Date(label);
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                  }
                  return label; // Mostrar el valor original si no es una fecha válida
                },
              },
              stacked: false, // No usar stacked para barras agrupadas
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "#ddd",
              },
              ticks: {
                color: "#444",
                font: {
                  size: 13,
                  family: "Arial, sans-serif",
                },
                // Mostrar los valores del eje Y tal cual
                callback: function (value) {
                  return value;
                },
              },
            },
          },
          datasets: {
            bar: {
              categoryPercentage: 0.8, // Ancho del grupo de barras (80% del espacio disponible)
              barPercentage: 0.9, // Ancho de cada barra individual (90% del espacio del grupo)
            },
          },
        }}
      />
    </div>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

export default BarChartComponent;