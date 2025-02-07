import React from "react";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importar el plugin de etiquetas

const PieChartComponent = ({ data, title }) => {
  console.log("Datos recibidos en PieChartComponent:", data);

  // Verificar si los datos están vacíos o no tienen la estructura esperada
  if (!data || !data.labels || !data.datasets) {
    console.error("Datos no válidos:", data);
    return <div>No hay datos disponibles para mostrar.</div>;
  }

  // Agrupar y sumar los valores por variable
  const sums = data.labels.reduce((acc, label, index) => {
    const value = data.datasets[0].data[index];
    acc[label] = (acc[label] || 0) + value;
    return acc;
  }, {});

  // Obtener las etiquetas y los valores sumados
  const labels = Object.keys(sums);
  const values = Object.values(sums);

  // Calcular el total de todos los valores
  const total = values.reduce((acc, value) => acc + value, 0);

  // Configurar los datos para el gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values, // Usar los valores sumados
        backgroundColor: [
          "#36a2eb", // Color para la primera variable
          "#ff6384", // Color para la segunda variable
          "#4bc0c0", // Color para la tercera variable
          "#ff9f40", // Color para la cuarta variable
          "#9966ff", // Color para la quinta variable
        ],
        borderColor: "#fff", // Color del borde
        borderWidth: 1, // Grosor del borde
        spacing: 0, // Eliminar espacio entre pedazos
        borderRadius: 0, // Eliminar bordes redondeados
        hoverOffset: 5, // Ajustar el hover para un efecto más compacto
      },
    ],
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