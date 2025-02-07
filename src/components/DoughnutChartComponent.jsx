import React from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";

const DoughnutChartComponent = ({ data, title }) => {
  // console.log("Datos recibidos en DoughnutChartComponent:", data);

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((dataset) => ({
      ...dataset,
      borderWidth: 2,
      spacing: 5,
      borderRadius: 5,
      hoverOffset: 10
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    }
  };

  return (
    <div style={{ width: "95%", height: "320px", padding: "20px", marginBottom: "30px" }}>
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
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

DoughnutChartComponent.propTypes = {
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

export default DoughnutChartComponent;
