import React from "react";
import { Bubble } from "react-chartjs-2";
import "chart.js/auto";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const BubbleChartComponent = ({ data, title, height }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Desactivar relación de aspecto para controlar altura
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          family: '"Helvetica Neue", Arial, sans-serif',
          weight: "bold",
        },
        color: "#333",
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: '"Helvetica Neue", Arial, sans-serif',
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
            return `${context.dataset.label}: (x: ${context.raw.x}, y: ${context.raw.y}, r: ${context.raw.r})`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        grid: {
          color: "#ddd",
        },
        ticks: {
          color: "#444",
          font: {
            size: 13,
            family: "Arial, sans-serif",
          },
        },
      },
      y: {
        type: "linear",
        grid: {
          color: "#ddd",
        },
        ticks: {
          color: "#444",
          font: {
            size: 13,
            family: "Arial, sans-serif",
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        width: "100%", // Ajustado de 95% a 100% para ocupar todo el espacio disponible
        height: height ? `${height}px` : "320px", // Usar la prop height si se proporciona
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        "& canvas": {
          maxWidth: "100% !important",
          width: "100% !important",
          height: "100% !important", // Asegurar que el canvas ocupe toda la altura
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontSize: "22px",
          marginBottom: "10px",
          color: "#333",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
        <Bubble data={data} options={options} />
      </Box>
    </Box>
  );
};

BubbleChartComponent.propTypes = {
  data: PropTypes.shape({
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(
          PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
            r: PropTypes.number,
          })
        ),
        backgroundColor: PropTypes.string,
        borderColor: PropTypes.string,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number, // Nueva prop para controlar la altura
};

BubbleChartComponent.defaultProps = {
  height: 320, // Valor por defecto si no se proporciona
};

export default BubbleChartComponent;