import React, { useState, useEffect, useContext, useRef } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types";
import { MqttContext } from "./MqttContext";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const StackedBarHistorico = ({ userId, title, variables, fetchHistoricalData, height }) => {
  const { mqttData } = useContext(MqttContext);
  const chartRef = useRef(null);
  
  // Estados
  const [filter, setFilter] = useState("1D");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  // Efecto para inicializar fechas
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setStartDate(formattedDate);
    setEndDate(formattedDate);
  }, []);

  // Efecto para cargar datos al cambiar filtro o variables
  useEffect(() => {
    if (variables && variables.length > 0) {
      fetchData();
    }
  }, [filter, variables, userId]);

  // Función para manejar el cambio de filtro
  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
    setShowDatePicker(false);
    setError(null); // Resetear el error al cambiar de filtro
  };

  // Función para aplicar filtro personalizado
  const handleCustomFilter = () => {
    if (startDate && endDate) {
      setFilter("custom");
      setShowDatePicker(false);
      fetchData();
    }
  };

  // Función para obtener datos históricos
  const fetchData = async () => {
    if (!variables || variables.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let startDateTime = null;
      let endDateTime = null;

      if (filter === "custom" && startDate && endDate) {
        startDateTime = startTime ? `${startDate}T${startTime}:00.000Z` : `${startDate}T00:00:00.000Z`;
        endDateTime = endTime ? `${endDate}T${endTime}:00.000Z` : `${endDate}T23:59:59.999Z`;
      }

      console.log("Solicitando datos históricos con:", { userId, variables, filter, startDateTime, endDateTime });
      const historicalData = await fetchHistoricalData(userId, variables, filter, startDateTime, endDateTime);
      console.log("Datos históricos recibidos en StackedBarHistorico:", historicalData);

      if (!historicalData || historicalData.length === 0) {
        setError("No hay datos disponibles para el período seleccionado");
        setData({
          labels: [],
          datasets: [],
        });
        setLoading(false);
        return;
      }

      setData({
        labels: historicalData.map((item) => new Date(item.timestamp).toLocaleString()),
        datasets: variables
          .slice() // Crear una copia para no modificar el array original
          .sort((a, b) => {
            // Calcular el valor promedio de cada variable para ordenarlas
            const avgA = historicalData.reduce((sum, item) => sum + (item.values[a.value] || 0), 0) / historicalData.length;
            const avgB = historicalData.reduce((sum, item) => sum + (item.values[b.value] || 0), 0) / historicalData.length;
            // Ordenar de mayor a menor para que los valores más grandes estén en la base
            return avgB - avgA;
          })
          .map((variable, index) => ({
            label: variable.value,
            data: historicalData.map((item) => item.values[variable.value] || 0),
            backgroundColor: variable.color,
            borderColor: variable.color,
            borderWidth: 1,
            stack: 'stack1', // Todos los datasets se apilan en el mismo grupo
          })),
      });
    } catch (err) {
      console.error("Error al cargar datos históricos:", err);
      setError("Error al cargar los datos históricos. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true, // Apila las barras horizontalmente
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
      y: {
        stacked: true, // Apila las barras verticalmente
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        beginAtZero: true,
      },
    },
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
  };

  return (
    <Card
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
            {title || "Gráfico de Barras Apiladas Histórico"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Recargar datos">
              <IconButton 
                onClick={fetchData} 
                disabled={loading}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
            sx={{ mb: 3, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.875rem" } }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            height: height ? `${height}px` : "400px", // Altura fija para asegurar visibilidad del eje X
            minHeight: "300px", // Mínimo para garantizar espacio
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
              <Typography sx={{ color: "#666", fontSize: "0.875rem" }}>Cargando datos...</Typography>
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
            <Bar ref={chartRef} data={data} options={options} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

StackedBarHistorico.propTypes = {
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

StackedBarHistorico.defaultProps = {
  variables: [],
  height: 400,
};

export default StackedBarHistorico;
