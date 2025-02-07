import React from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";

const StackedBarChartComponent = ({ data, title }) => {
  // Opciones del gráfico
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        reverse: true, // Invertir el orden de las leyendas
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
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
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};

StackedBarChartComponent.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
        borderWidth: PropTypes.number,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default StackedBarChartComponent;