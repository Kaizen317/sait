import React from "react";
import { Scatter } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";

const ScatterChartComponent = ({ data, title }) => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        type: "linear",
      },
    },
  };

  return (
    <div style={{ width: "95%", height: "320px", padding: "20px" }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

ScatterChartComponent.propTypes = {
  data: PropTypes.shape({
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(
          PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
          })
        ),
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
};

export default ScatterChartComponent;