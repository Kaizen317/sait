import React from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";

const RadarChartComponent = ({ data, title }) => {
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div style={{ width: "95%", height: "320px", padding: "20px" }}>
      <Radar data={data} options={options} />
    </div>
  );
};

RadarChartComponent.propTypes = {
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

export default RadarChartComponent;