import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import { Chart } from 'chart.js';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Box, Typography, useTheme, Paper, Grid, Divider, Chip, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Registro del plugin de datalabels
Chart.register(ChartDataLabels);

// Componente para la leyenda personalizada con diseño mejorado
const CustomLegendItem = ({ color, label, value, percentage, index }) => {
  return (
    <Grid 
      container 
      alignItems="center" 
      sx={{ 
        mb: 1.2,
        p: 1, 
        borderRadius: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha(color, 0.08),
          transform: 'translateX(3px)'
        }
      }}
    >
      <Grid item>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: 1,
            backgroundColor: color,
            boxShadow: `0 2px 4px ${alpha(color, 0.4)}`,
            mr: 1.5
          }}
        />
      </Grid>
      <Grid item xs>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500, 
            fontSize: "0.85rem",
            color: theme => theme.palette.mode === 'dark' ? alpha('#fff', 0.9) : alpha('#000', 0.8),
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid item>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              fontSize: "0.85rem",
              color: color,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              letterSpacing: '0.01em',
            }}
          >
            {value.toLocaleString()}
          </Typography>
          <Chip 
            label={`${percentage}%`} 
            size="small" 
            sx={{ 
              fontSize: "0.7rem", 
              height: "20px", 
              fontWeight: 600,
              backgroundColor: alpha(color, 0.15),
              color: color,
              border: 'none',
              '& .MuiChip-label': {
                px: 1
              }
            }} 
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

// Componente para mostrar el centro del donut con estadísticas
const DonutCenter = ({ total, title }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block',
          color: theme => theme.palette.text.secondary,
          fontSize: '0.75rem',
          mb: 0.5,
          opacity: 0.7,
        }}
      >
        {title || 'Total'}
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          color: theme => theme.palette.primary.main,
          fontSize: '1.5rem',
          lineHeight: 1.2,
        }}
      >
        {total.toLocaleString()}
      </Typography>
    </Box>
  );
};

const PieChartComponent = ({ 
  data, 
  title, 
  height = 480, 
  darkMode = false,
  showLegend = true,
  showTotal = true,
  legendPosition = "right",
  donut = false,
  animated = true,
  pattern = false 
}) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);
  const [percentages, setPercentages] = useState([]);
  const [total, setTotal] = useState(0);

  // Configuración de apariencia según el modo
  const appearance = {
    background: darkMode ? '#1a2027' : '#ffffff',
    cardBackground: darkMode ? '#242f39' : '#ffffff',
    titleColor: darkMode ? '#e4e6eb' : '#1e293b',
    textColor: darkMode ? '#b0b3b8' : '#475569',
    labelColor: '#ffffff',
    tooltipBackground: darkMode ? 'rgba(30, 39, 46, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: darkMode ? '#3e6ae1' : '#4183d7',
    tooltipTextColor: darkMode ? '#e4e6eb' : '#1e293b',
    legendBg: darkMode ? '#242f39' : '#f8fafc',
    card: darkMode ? 
      "0 8px 32px rgba(0, 0, 0, 0.3)" : 
      "0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)",
    divider: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    statBackground: darkMode ? 'rgba(66, 72, 86, 0.5)' : 'rgba(248, 250, 252, 0.8)',
  };
  
  // Paleta de colores moderna y vibrante
  const chartPalette = [
    "#3b82f6", // Azul
    "#8b5cf6", // Violeta
    "#06b6d4", // Turquesa
    "#ec4899", // Rosa
    "#f97316", // Naranja
    "#14b8a6", // Teal
    "#6366f1", // Indigo
    "#10b981", // Esmeralda
    "#f43f5e", // Rojo
    "#84cc16", // Lima
    "#a855f7", // Púrpura
    "#0ea5e9", // Celeste
  ];

  useEffect(() => {
    if (!data || !data.datasets || !Array.isArray(data.datasets)) {
      setChartData({
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2
        }]
      });
      setTotal(0);
      setPercentages([]);
      return;
    }
    
    // Calcular el total de los valores
    let sum = 0;
    if (data.datasets && data.datasets[0] && data.datasets[0].data) {
      sum = data.datasets[0].data.reduce((acc, val) => acc + (val || 0), 0);
    }
    setTotal(sum);
    
    // Calcular los porcentajes
    const percentages = data.datasets[0].data.map(value => ((value / sum) * 100).toFixed(1));
    setPercentages(percentages);
    
    // Preparar los datos para el gráfico
    const formattedData = {
      labels: data.labels || [],
      datasets: (data.datasets || []).map((dataset) => {
        // Asegurarse de que colors siempre sea un array
        let colors;
        if (dataset.backgroundColor) {
          colors = Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor 
            : data.labels.map(() => dataset.backgroundColor);
        } else {
          colors = data.labels.map((_, i) => chartPalette[i % chartPalette.length]);
        }
        
        return {
          ...dataset,
          backgroundColor: colors,
          borderColor: darkMode ? 'rgba(26, 32, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1.5,
          hoverBorderWidth: 2,
          hoverBorderColor: darkMode ? '#fff' : '#1a2027',
          hoverBackgroundColor: colors.map(color => alpha(color, 0.85)),
          spacing: 1,
          borderRadius: 4,
          hoverOffset: 8,
          weight: 1,
        };
      }),
    };
    
    setChartData(formattedData);
  }, [data, darkMode]);

  // Validar que los datos existan y tengan datasets
  if (!data || !data.datasets || !Array.isArray(data.datasets)) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          height: height ? `${height}px` : "400px",
          padding: 3,
          backgroundColor: appearance.background,
          borderRadius: 2,
          boxShadow: appearance.card,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Typography 
          variant="h6" 
          color={darkMode ? "error.light" : "error"}
          sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif' }}
        >
          Error: Datos inválidos o no proporcionados
        </Typography>
      </Paper>
    );
  }

  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: donut ? '65%' : 0, 
    animation: animated ? {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.dataIndex * 80;
      }
    } : false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: appearance.tooltipBackground,
        titleFont: { 
          size: 15, 
          weight: 600,
          family: '"Inter", "Roboto", "Helvetica", sans-serif' 
        },
        bodyFont: { 
          size: 13,
          family: '"Inter", "Roboto", "Helvetica", sans-serif' 
        },
        padding: 12,
        cornerRadius: 8,
        titleColor: appearance.tooltipTextColor,
        bodyColor: appearance.tooltipTextColor,
        borderColor: appearance.tooltipBorder,
        borderWidth: 1,
        caretSize: 6,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `${context.label}: ${value.toLocaleString()}`,
              `Porcentaje: ${percentage}%`
            ];
          },
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          }
        },
      },
      datalabels: {
        color: (context) => {
          return appearance.labelColor;
        },
        textStrokeColor: 'rgba(0,0,0,0.35)',
        textStrokeWidth: 2,
        font: {
          weight: 600,
          size: 14,
          family: '"Inter", "Roboto", "Helvetica", sans-serif',
        },
        formatter: (value, context) => {
          const percentage = ((value / total) * 100).toFixed(1);
          const label = context.chart.data.labels[context.dataIndex];
          return [`${label}`, `${value.toLocaleString()} (${percentage}%)`];
        },
        anchor: 'center',
        align: 'center',
        offset: 0,
        textAlign: 'center',
        display: true,
        textShadowBlur: 3,
        textShadowColor: 'rgba(0,0,0,0.35)',
      },
    },
    elements: {
      arc: {
        borderWidth: 1.5,
        borderColor: darkMode ? 'rgba(26, 32, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
    <Paper
      elevation={darkMode ? 2 : 1}
      sx={{
        width: "100%",
        height: `${height}px`,
        backgroundColor: appearance.cardBackground,
        borderRadius: 3,
        boxShadow: appearance.card,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(darkMode ? '#ffffff' : '#000000', 0.06)}`,
      }}
    >
      {/* Encabezado */}
      {title && (
        <Box 
          sx={{
            p: 2.5,
            pb: 1.5,
            borderBottom: `1px solid ${appearance.divider}`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: appearance.titleColor,
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      
      {/* Contenido principal - Solo gráfico sin leyenda */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          height: title ? `calc(100% - 60px)` : '100%',
        }}
      >
        {/* Gráfico */}
        <Box 
          sx={{ 
            flex: 1,
            height: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pie 
            data={chartData || {
              labels: [],
              datasets: [{
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1.5
              }]
            }}
            options={options}
          />
          
          {donut && showTotal && (
            <DonutCenter total={total} title={title} />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

// Importaciones para el Accordion
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  height: PropTypes.number,
  darkMode: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTotal: PropTypes.bool,
  legendPosition: PropTypes.oneOf(['right', 'bottom', 'left']),
  donut: PropTypes.bool,
  animated: PropTypes.bool,
  pattern: PropTypes.bool
};

PieChartComponent.defaultProps = {
  height: 480,
  darkMode: false,
  showLegend: true,
  showTotal: true,
  legendPosition: 'right',
  donut: false,
  animated: true,
  pattern: false
};

export default PieChartComponent;