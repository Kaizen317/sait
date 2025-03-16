import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Grid,
  IconButton,
  Alert,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types"; // Añadido la importación de PropTypes

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ChartDataLabels);

const BarHistorico = ({ userId, title, variables = [], fetchHistoricalData, height }) => {
  const [filter, setFilter] = useState("1D");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = async (currentFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      let startDateTime = null;
      let endDateTime = null;

      // Solo usar fechas personalizadas si el filtro es "custom"
      if (currentFilter === "custom") {
        if (startDate) {
          startDateTime = startTime ? `${startDate}T${startTime}:00.000Z` : `${startDate}T00:00:00.000Z`;
        }

        if (endDate) {
          endDateTime = endTime ? `${endDate}T${endTime}:00.000Z` : `${endDate}T23:59:59.999Z`;
        }
      } else {
        // Para filtros predefinidos, no enviar fechas personalizadas
        startDateTime = null;
        endDateTime = null;
      }

      const historicalData = await fetchHistoricalData(userId, variables, currentFilter, startDateTime, endDateTime);
      console.log("Datos históricos recibidos:", historicalData);

      setData({
        labels: historicalData.map((item) => new Date(item.timestamp).toLocaleString()),
        datasets: variables.map((variable, index) => ({
          label: variable.value,
          data: historicalData.map((item) => item.values[variable.value] || 0),
          backgroundColor: hexToRgba(variable.color, 0.7),
          borderColor: variable.color,
          borderWidth: 2,
        })),
      });
    } catch (error) {
      console.error("Error al cargar datos históricos:", error);
      setError("Error al cargar los datos históricos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleFilterClick = (newFilter) => {
    // Reiniciar fechas personalizadas cuando se cambia a filtros predefinidos
    if (newFilter !== "custom") {
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    }
    setFilter(newFilter);
    setShowDatePicker(false);
    setError(null); // Reiniciar el error al cambiar de filtro
    // No llamamos a fetchData aquí porque ya se llamará en el useEffect
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      setFilter("custom");
      setError(null); // Reiniciar el error al aplicar filtro personalizado
      // Forzar la actualización de los datos inmediatamente en lugar de esperar al useEffect
      // ya que el cambio de estado de setFilter puede no reflejarse inmediatamente
      fetchData("custom");
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            weight: 500,
          },
          color: "#555",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: {
          size: 14,
          weight: "bold",
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          },
          color: "#666",
          maxRotation: 90,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            if (!label) return "";

            try {
              const parts = label.split(", ");
              if (parts.length >= 2) {
                const datePart = parts[0];
                const timePart = parts[1].split(":").slice(0, 2).join(":");
                return `${datePart}\n${timePart}`;
              }
              return label;
            } catch (e) {
              return label;
            }
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          },
          color: "#666",
          padding: 8,
          callback: function (value) {
            return value.toFixed(2);
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    barPercentage: 0.9,
    categoryPercentage: 0.8,
    colors: ['#006875', '#338c98', '#004b55'],
  };

  return (
    <Card
      elevation={2}
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 3,
        bgcolor: "#ffffff",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            {title || "Gráfico Histórico"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Actualizar datos">
              <IconButton
                size="small"
                onClick={fetchData}
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.2)",
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#f5f8fe",
              border: "1px solid rgba(25, 118, 210, 0.1)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              {["1D", "7D", "30D"].map((option) => (
                <Button
                  key={option}
                  variant={filter === option ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleFilterClick(option)}
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: "80px" },
                    borderRadius: 6,
                    textTransform: "none",
                    fontWeight: 500,
                    py: 0.75,
                    boxShadow: filter === option ? 2 : 0,
                    "&:hover": {
                      boxShadow: 1,
                    },
                  }}
                >
                  {option}
                </Button>
              ))}
              <Button
                variant={showDatePicker ? "contained" : "outlined"}
                color="primary"
                startIcon={<CalendarTodayIcon />}
                onClick={() => setShowDatePicker(!showDatePicker)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  borderRadius: 20,
                  textTransform: "none",
                  fontWeight: 500,
                  py: 0.75,
                  boxShadow: showDatePicker ? 2 : 0,
                  "&:hover": {
                    boxShadow: 1,
                  },
                }}
              >
                Personalizado
              </Button>
            </Stack>
          </Paper>
        </Box>

        {showDatePicker && (
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: "#fafbfc",
              borderLeft: "4px solid #1976d2",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Inicial"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Hora Inicial"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  inputProps={{ step: 300 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Final"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Hora Final"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  inputProps={{ step: 300 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  variant="contained"
                  onClick={handleCustomFilter}
                  disabled={!startDate || !endDate}
                  fullWidth
                  sx={{
                    height: "40px",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: 0,
                    "&:hover": {
                      boxShadow: 1,
                    },
                  }}
                >
                  Aplicar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {error && (
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setError(null)}
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-message": {
                fontSize: "0.875rem",
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            height: height ? `${height}px` : "400px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            bgcolor: "#fafbfc",
            p: 2,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            "& canvas": {
              maxWidth: "100% !important",
              width: "100% !important",
              height: "100% !important",
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress size={40} thickness={4} />
              <Typography sx={{ color: "#666", fontSize: "0.875rem" }}>
                Cargando datos...
              </Typography>
            </Box>
          ) : !data || !data.labels || data.labels.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: 3,
              }}
            >
              <InfoIcon sx={{ fontSize: 50, color: "#70bc7e" }} />
              <Box>
                <Typography variant="h6" sx={{ color: "#333", mb: 1, fontWeight: 600 }}>
                  No hay datos disponibles
                </Typography>
                <Typography variant="body2" sx={{ color: "#666", maxWidth: "400px", mx: "auto" }}>
                  No se encontraron datos para el período seleccionado. Prueba a cambiar el filtro o seleccionar un rango de fechas diferente.
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={fetchData}
                startIcon={<RefreshIcon />}
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Reintentar
              </Button>
            </Box>
          ) : (
            <Bar data={data} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Función auxiliar para convertir colores hex a rgba
const hexToRgba = (hex, alpha = 1) => {
  try {
    if (!hex) return "rgba(0, 0, 0, " + alpha + ")";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    console.error("Error al convertir color:", e);
    return hex;
  }
};

BarHistorico.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  variables: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      color: PropTypes.string,
    })
  ),
  fetchHistoricalData: PropTypes.func.isRequired,
  height: PropTypes.number,
};

BarHistorico.defaultProps = {
  variables: [],
  height: 400,
};

export default BarHistorico;