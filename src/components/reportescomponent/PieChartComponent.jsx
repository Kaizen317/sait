import React from "react";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importar el plugin de etiquetas
import { Chart as ChartJS } from 'chart.js';

// Registrar el plugin de datalabels
ChartJS.register(ChartDataLabels);

const PieChartComponent = ({ data, title, showTitle = true }) => {
  console.log("Datos recibidos en PieChartComponent:", data);

  // Verificar si los datos están vacíos o no tienen la estructura esperada
  if (!data || !data.labels || !data.datasets) {
    console.error("Datos no válidos:", data);
    return <div>No hay datos disponibles para mostrar.</div>;
  }

  // Agrupar y sumar los valores por variable
  const sums = {};
  data.datasets.forEach((dataset, datasetIndex) => {
    dataset.data.forEach((value, index) => {
      const label = data.labels[index];
      if (!sums[label]) {
        sums[label] = 0;
      }
      sums[label] += value;
    });
  });

  // Obtener las etiquetas y los valores sumados
  const labels = Object.keys(sums);
  const values = Object.values(sums);

  // Calcular el total de todos los valores
  const total = values.reduce((acc, value) => acc + value, 0);

  // Obtener colores de los datasets originales si están disponibles
  const colors = data.datasets[0].backgroundColor;
  console.log("Colores recibidos:", colors);
  
  // Generar colores si no hay suficientes
  const defaultColors = [
    "#36a2eb", // Azul
    "#ff6384", // Rosa
    "#4bc0c0", // Verde azulado
    "#ff9f40", // Naranja
    "#9966ff", // Púrpura
    "#ffcd56", // Amarillo
    "#c9cbcf", // Gris
    "#4d5360"  // Azul oscuro
  ];

  // Configurar los datos para el gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values, // Usar los valores sumados
        backgroundColor: Array.isArray(colors) ? colors : labels.map((_, index) => 
          defaultColors[index % defaultColors.length]
        ),
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
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
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
          return `${value} (${percentage}%)`;
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
    <div
      style={{
        width: "100%",
        height: "700px", // Altura fija de 700px según preferencia del usuario
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {showTitle && (
        <h3
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "10px",
            color: "#444",
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: "0.5px",
            fontWeight: "bold",
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Pie data={chartData} options={options} />
      </div>
      
      {/* Cuadro de información con valores detallados */}
      <div style={{ 
        marginTop: "15px", 
        padding: "15px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        maxHeight: "200px",
        overflowY: "auto"
      }}>
        <h4 style={{ 
          margin: "0 0 10px 0", 
          fontSize: "14px", 
          fontWeight: "bold", 
          color: "#333",
          borderBottom: "1px solid #ddd",
          paddingBottom: "8px"
        }}>Valores detallados</h4>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
          gap: "12px" 
        }}>
          {labels.map((label, index) => (
            <div key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "white",
              border: "1px solid #eee"
            }}>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                backgroundColor: chartData.datasets[0].backgroundColor[index],
                borderRadius: "3px",
                marginRight: "10px"
              }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                  <span>Valor: <strong>{values[index].toLocaleString()}</strong></span>
                  <span>Porcentaje: <strong>{((values[index] / total) * 100).toFixed(1)}%</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.object,
  title: PropTypes.string,
  showTitle: PropTypes.bool
};

export default PieChartComponent;