import React from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const GaugeChartComponent = ({ data, title }) => {
  // Obtener el último valor del dataset
  const value = data.datasets?.[0]?.data?.[data.datasets[0].data.length - 1] || 0;
  const minValue = 0;
  const maxValue = 100; // Esto podría ser configurable

  // Calcular el valor para el gráfico (el resto será el espacio vacío)
  const gaugeValue = ((value - minValue) / (maxValue - minValue)) * 100;
  const remainder = 100 - gaugeValue;

  const chartData = {
    labels: ["Valor", ""],
    datasets: [
      {
        data: [gaugeValue, remainder],
        backgroundColor: [
          data.datasets?.[0]?.backgroundColor || `rgba(54, 162, 235, ${gaugeValue / 100})`,
          "rgba(200, 200, 200, 0.1)",
        ],
        borderColor: [
          data.datasets?.[0]?.borderColor || "rgba(54, 162, 235, 1)",
          "transparent",
        ],
        borderWidth: 1,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Deshabilitar el tooltip
      },
    },
    hover: {
      mode: null, // Deshabilitar efecto hover
    },
    layout: {
      padding: {
        top: 20,
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "10px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {title}
      </div>
      <div
        style={{
          width: "100%",
          height: "calc(100% - 60px)",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Doughnut data={chartData} options={options} />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {value.toFixed(1)}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "80%",
          marginTop: "10px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};

GaugeChartComponent.propTypes = {
  data: PropTypes.shape({
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number),
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default GaugeChartComponent;
