import React from "react";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importar el plugin de etiquetas

const PieChartComponent = ({ data, title }) => {
  // console.log("Datos recibidos en PieChartComponent:", data);

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((dataset) => ({
      ...dataset,
      borderWidth: 1, // Reducir borde para menor separación
      spacing: 0, // Eliminar espacio entre pedazos
      borderRadius: 0, // Eliminar bordes redondeados
      hoverOffset: 5, // Ajustar el hover para un efecto más compacto
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#333",
        bodyColor: "#333",
        padding: 12,
        displayColors: true,
        borderColor: "#ddd",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        anchor: "center",
        align: "center",
        offset: 0,
      },
    },
    elements: {
      arc: {
        borderWidth: 1, // Reducir el borde de los arcos para que se vean más unidos
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
  };

  return (
    <div style={{ width: "95%", height: "320px", padding: "10px", marginBottom: "30px" }}>
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
      <Pie data={chartData} options={options} plugins={[ChartDataLabels]} />
    </div>
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string),
        ]),
        borderColor: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string),
        ]),
        borderWidth: PropTypes.number,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default PieChartComponent;
