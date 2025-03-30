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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PropTypes from "prop-types"; 

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
  const [chartData, setChartData] = useState(null);
  const fetchData = async (currentFilter = filter) => {
    setLoading(true);
    setError(null);
    setChartData(null);
  
    try {
      let effectiveStart, effectiveEnd;
  
      if (currentFilter === "custom") {
        // Si es personalizado, se espera que el usuario haya seleccionado startDate y endDate
        if (startDate && endDate) {
          let startDateValue = new Date(startDate);
          let endDateValue = new Date(endDate);
  
          // Combinar con las horas si se han seleccionado
          if (startTime) {
            const [sh, sm] = startTime.split(":");
            startDateValue.setHours(parseInt(sh, 10), parseInt(sm, 10), 0, 0);
          } else {
            startDateValue.setHours(0, 0, 0, 0);
          }
  
          if (endTime) {
            const [eh, em] = endTime.split(":");
            endDateValue.setHours(parseInt(eh, 10), parseInt(em, 10), 59, 999);
          } else {
            endDateValue.setHours(23, 59, 59, 999);
          }
  
          // Convertir a string ISO sin la "Z"
          effectiveStart = startDateValue.toISOString().split(".")[0].replace("Z", "");
          effectiveEnd = endDateValue.toISOString().split(".")[0].replace("Z", "");
        } else {
          setError("Por favor selecciona fechas de inicio y fin");
          setLoading(false);
          return;
        }
      } else {
        // Para filtros predefinidos ("1D", "7D", "30D")
        const now = new Date();
        const daysBack = currentFilter === "1D" ? 1 : currentFilter === "7D" ? 7 : 30;
        // Tomamos el inicio del día para el día calculado
        const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        effectiveStart = start.toISOString().split(".")[0].replace("Z", "");
        effectiveEnd = now.toISOString().split(".")[0].replace("Z", "");
      }
  
      console.log("Fechas enviadas a fetchHistoricalData:", {
        filter: currentFilter,
        effectiveStart,
        effectiveEnd,
        startTime,
        endTime
      });
  
      // Llamada a la función que obtiene los datos históricos
      const data = await fetchHistoricalData(
        userId,
        variables,
        currentFilter,
        effectiveStart,
        effectiveEnd
      );
  
      if (!data || data.length === 0) {
        setError("No se encontraron datos para el período seleccionado. Por favor, intente con otro rango de fechas.");
        setLoading(false);
        return;
      }
  
      // Formateo de los datos para ChartJS
      const formattedData = {
        labels: data.map((item) => {
          const date = new Date(item.timestamp);
          return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          });
        }),
        datasets: variables.map((variable) => ({
          label: variable.value,
          data: data.map((item) => item.values[variable.value] || 0),
          backgroundColor: variable.color || "rgba(54, 162, 235, 1)",
          borderColor: variable.color ? darkenColor(variable.color, 0.2) : "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        })),
      };
  
      setChartData(formattedData);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setError(`Error al cargar los datos: ${error.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleFilterClick = (newFilter) => {
    if (newFilter !== "custom") {
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    }
    setFilter(newFilter);
    setShowDatePicker(newFilter === "custom"); 
    setError(null); 
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      let startDateTime, endDateTime;
      
      try {
        // Combinar fecha y hora para inicio
        if (startTime) {
          const [startHour, startMinute] = startTime.split(':');
          const startDateObj = new Date(startDate);
          startDateObj.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
          startDateTime = startDateObj;
        } else {
          // Si no hay hora, usar 00:00
          const startDateObj = new Date(startDate);
          startDateObj.setHours(0, 0, 0, 0);
          startDateTime = startDateObj;
        }
        
        // Combinar fecha y hora para fin
        if (endTime) {
          const [endHour, endMinute] = endTime.split(':');
          const endDateObj = new Date(endDate);
          endDateObj.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 59, 999);
          endDateTime = endDateObj;
        } else {
          // Si no hay hora, usar 23:59:59.999
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          endDateTime = endDateObj;
        }
        
        // Formatear fechas para depuración
        console.log("Fechas personalizadas creadas:", {
          startDateTime: startDateTime.toLocaleString(),
          endDateTime: endDateTime.toLocaleString(),
          startISO: startDateTime.toISOString(),
          endISO: endDateTime.toISOString()
        });
        
        setFilter("custom");
        setError(null);
        // Forzar la actualización de los datos inmediatamente
        fetchData("custom", startDateTime, endDateTime);
      } catch (error) {
        console.error("Error al procesar fechas personalizadas:", error);
        setError("Error al procesar las fechas. Por favor verifica el formato.");
      }
    } else {
      setError("Por favor selecciona fechas de inicio y fin");
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
            size: 8, 
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          },
          color: "#666",
          maxRotation: 45, 
          minRotation: 45,
          autoSkip: false, 
          maxTicksLimit: 100, 
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            if (!label) return "";

            try {
              const parts = label.split(" ");
              if (parts.length >= 2) {
                const datePart = parts[0];
                const timePart = parts[1];
                return `${datePart}\n${timePart}`;
              }
              return label;
            } catch (e) {
              return label;
            }
          },
        },
        afterFit: function(scale) {
          scale.height = 120;
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
        maxHeight: "700px", 
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

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center", 
            mt: 4,
            p: 3,
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fafafa"
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: "#d32f2f", mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              No hay datos disponibles
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => fetchData(filter)}
            >
              Reintentar
            </Button>
          </Box>
        )}

        {!loading && chartData && (
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
            <Bar data={chartData} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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

const darkenColor = (hex, factor) => {
  try {
    if (!hex) return "rgba(0, 0, 0, 1)";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${Math.round(r * (1 - factor))}, ${Math.round(g * (1 - factor))}, ${Math.round(b * (1 - factor))}, 1)`;
  } catch (e) {
    console.error("Error al oscurecer color:", e);
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