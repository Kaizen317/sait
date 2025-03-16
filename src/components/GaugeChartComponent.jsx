import React from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Box, Typography } from "@mui/material";

// Paleta de colores corporativa
const COLOR_PALETTE = {
  primary: {
    main: "#0a2463", // Azul oscuro corporativo
    light: "#3e92cc", // Azul claro
    dark: "#001845", // Azul muy oscuro
  },
  secondary: {
    main: "#1e5f74", // Verde azulado
    light: "#41afc8", // Verde azulado claro
    dark: "#0d3b49", // Verde azulado oscuro
  },
  neutral: {
    light: "#f8f9fa",
    main: "#dee2e6",
    dark: "#343a40",
    text: "#212529",
    textSecondary: "#6c757d",
  },
  status: {
    error: "#d62828", // Rojo
    warning: "#f77f00", // Naranja
    success: "#28a745", // Verde
  },
};

// Estilos centralizados con diseño profesional (convertidos a sx para Material-UI)
const STYLES = {
  container: {
    width: "100%", // Ajustado a 100% para ocupar el espacio disponible
    padding: "16px",
    backgroundColor: COLOR_PALETTE.neutral.light,
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    overflow: "hidden",
    border: `1px solid ${COLOR_PALETTE.neutral.main}`,
    "& canvas": {
      maxWidth: "100% !important",
      width: "100% !important",
      height: "100% !important", // Asegurar que el canvas ocupe toda la altura
    },
  },
  header: {
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: COLOR_PALETTE.neutral.text,
    letterSpacing: "0.02em",
    textTransform: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  valueDisplay: {
    fontSize: "14px",
    fontWeight: 500,
    color: COLOR_PALETTE.neutral.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  chartWrapper: {
    width: "100%",
    height: "calc(100% - 50px)",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "24px",
    fontWeight: 700,
    color: COLOR_PALETTE.primary.main,
  },
  valueUnit: {
    fontSize: "14px",
    fontWeight: 400,
    color: COLOR_PALETTE.neutral.textSecondary,
    marginLeft: "2px",
  },
  limits: {
    display: "flex",
    justifyContent: "space-between",
    width: "90%",
    marginTop: "4px",
    paddingTop: "8px",
    borderTop: `1px solid ${COLOR_PALETTE.neutral.main}`,
    fontSize: "12px",
    fontWeight: 400,
    color: COLOR_PALETTE.neutral.textSecondary,
  },
};

// Opciones del gráfico mejoradas para apariencia profesional
const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false, // Desactivar relación de aspecto para controlar altura
  cutout: "75%",
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  hover: { mode: null },
  layout: { padding: { top: 10, bottom: 10 } },
  circumference: 180,
  rotation: 270,
  elements: {
    arc: {
      borderWidth: 1,
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  }
};

// Función para generar colores basados en el valor (más profesional y corporativo)
const getValueColor = (value, minValue, maxValue) => {
  const percentage = (value - minValue) / (maxValue - minValue);
  
  if (percentage < 0.33) {
    return COLOR_PALETTE.status.error;
  } else if (percentage < 0.66) {
    return COLOR_PALETTE.status.warning;
  } else {
    return COLOR_PALETTE.status.success;
  }
};

// Función para obtener un gradiente profesional
const getGradientColor = (value, minValue, maxValue, ctx) => {
  const percentage = (value - minValue) / (maxValue - minValue);
  const gradient = ctx.createLinearGradient(0, 0, 200, 0);
  
  if (percentage < 0.33) {
    gradient.addColorStop(0, COLOR_PALETTE.status.error);
    gradient.addColorStop(1, COLOR_PALETTE.status.warning);
  } else if (percentage < 0.66) {
    gradient.addColorStop(0, COLOR_PALETTE.status.warning);
    gradient.addColorStop(1, COLOR_PALETTE.primary.light);
  } else {
    gradient.addColorStop(0, COLOR_PALETTE.primary.light);
    gradient.addColorStop(1, COLOR_PALETTE.status.success);
  }
  
  return gradient;
};

// Función para formatear valores
const formatValue = (value, decimals = 1) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(decimals);
};

// Componente principal mejorado
const GaugeChartComponent = ({
  data,
  title,
  minValue = 0,
  maxValue = 100,
  decimals = 1,
  theme = "light",
  customOptions = {},
  unit = "",
  useGradient = true,
  height, // Nueva prop para controlar la altura
}) => {
  const chartRef = React.useRef(null);

  // Obtener el último valor del dataset
  const value = data?.datasets?.[0]?.data?.length
    ? data.datasets[0].data[data.datasets[0].data.length - 1]
    : 0;

  // Calcular el valor del gauge
  const gaugeValue = Math.min(Math.max(((value - minValue) / (maxValue - minValue)) * 100, 0), 100);
  const remainder = 100 - gaugeValue;

  const getBackgroundColor = useGradient 
    ? (ctx) => getGradientColor(value, minValue, maxValue, ctx.chart.ctx)
    : getValueColor(value, minValue, maxValue);

  const chartData = {
    labels: ["Valor", ""],
    datasets: [
      {
        data: [gaugeValue, remainder],
        backgroundColor: [
          data.datasets?.[0]?.backgroundColor || getBackgroundColor,
          theme === "dark" ? "rgba(200, 200, 200, 0.08)" : "rgba(200, 200, 200, 0.15)",
        ],
        borderColor: [
          data.datasets?.[0]?.borderColor || (theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
          "transparent",
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Ajustar colores según el tema
  const themeStyles = theme === "dark" ? {
    container: { 
      backgroundColor: COLOR_PALETTE.neutral.dark, 
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      border: `1px solid ${COLOR_PALETTE.neutral.textSecondary}30` 
    },
    title: { color: COLOR_PALETTE.neutral.light },
    valueDisplay: { color: COLOR_PALETTE.neutral.main },
    value: { color: COLOR_PALETTE.neutral.light },
    valueUnit: { color: COLOR_PALETTE.neutral.main },
    limits: { 
      color: COLOR_PALETTE.neutral.main,
      borderTop: `1px solid ${COLOR_PALETTE.neutral.textSecondary}30`
    },
  } : {};

  const options = {
    ...DEFAULT_CHART_OPTIONS,
    ...customOptions,
  };

  // Determinar el color del valor según su nivel
  const valueColor = getValueColor(value, minValue, maxValue);

  return (
    <Box 
      sx={{ 
        ...STYLES.container, 
        ...themeStyles.container, 
        height: height ? `${height}px` : "300px" // Usar la prop height si se proporciona
      }} 
      role="figure" 
      aria-label={`Gauge chart: ${title}`}
    >
      <Box sx={{ ...STYLES.header }}>
        <Typography sx={{ ...STYLES.title, ...themeStyles.title }}>
          {title}
        </Typography>
        <Typography sx={{ ...STYLES.valueDisplay, ...themeStyles.valueDisplay }}>
          {`Actual: `}
          <span style={{ color: valueColor, fontWeight: 600 }}>
            {formatValue(value, decimals)}
            <span style={{ ...STYLES.valueUnit, ...themeStyles.valueUnit }}>{unit}</span>
          </span>
        </Typography>
      </Box>
      <Box sx={{ ...STYLES.chartWrapper }}>
        <Doughnut ref={chartRef} data={chartData} options={options} />
        <Typography sx={{ ...STYLES.value, ...themeStyles.value, color: valueColor }}>
          {formatValue(value, decimals)}
          <span style={{ ...STYLES.valueUnit, ...themeStyles.valueUnit }}>{unit}</span>
        </Typography>
      </Box>
      <Box sx={{ ...STYLES.limits, ...themeStyles.limits }}>
        <Typography component="span">{formatValue(minValue, 0)}{unit}</Typography>
        <Typography component="span">{formatValue(maxValue, 0)}{unit}</Typography>
      </Box>
    </Box>
  );
};

// PropTypes para validación
GaugeChartComponent.propTypes = {
  data: PropTypes.shape({
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        borderColor: PropTypes.string,
      })
    ),
  }).isRequired,
  title: PropTypes.string.isRequired,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  decimals: PropTypes.number,
  theme: PropTypes.oneOf(["light", "dark"]),
  customOptions: PropTypes.object,
  unit: PropTypes.string,
  useGradient: PropTypes.bool,
  height: PropTypes.number, // Nueva prop para controlar la altura
};

// Valores por defecto
GaugeChartComponent.defaultProps = {
  data: { datasets: [{ data: [0] }] },
  title: "Gauge Chart",
  minValue: 0,
  maxValue: 100,
  decimals: 1,
  theme: "light",
  customOptions: {},
  unit: "",
  useGradient: true,
  height: 300, // Valor por defecto si no se proporciona
};

export default React.memo(GaugeChartComponent);