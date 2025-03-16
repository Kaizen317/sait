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
  Divider,
  Chip,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import { MqttContext } from "./MqttContext";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, ChartTooltip, Legend, ChartDataLabels);

// Componente para la leyenda personalizada
const CustomLegendItem = ({ color, label, value, percentage }) => {
  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Grid item>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "3px",
            backgroundColor: color,
            boxShadow: `0 2px 4px ${alpha(color, 0.5)}`,
          }}
        />
      </Grid>
      <Grid item xs>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.8rem",
            color: (theme) => alpha(color, 0.9),
            fontFamily: '"Inter", system-ui, sans-serif',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid item>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 700, 
            color: (theme) => alpha(color, 0.9),
            fontSize: "0.8rem",
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </Typography>
      </Grid>
      <Grid item>
        <Chip 
          label={`${percentage}%`} 
          size="small" 
          sx={{ 
            fontSize: "0.65rem", 
            height: "18px", 
            fontWeight: "bold",
            backgroundColor: alpha(color, 0.15),
            color: color,
            border: `1px solid ${alpha(color, 0.3)}`,
            '& .MuiChip-label': {
              px: 0.8
            }
          }} 
        />
      </Grid>
    </Grid>
  );
};

const PieHistorico = ({ userId, title, variables = [], fetchHistoricalData, height }) => {
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const [filter, setFilter] = useState("1D");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const topicsRef = useRef([]);
  const isRealTimeEnabled = useRef(false);
  const lastMqttDataRef = useRef({});

  // Función para procesar los datos MQTT y actualizar el gráfico
  const processMqttData = () => {
    if (!isRealTimeEnabled.current || !variables || variables.length === 0) return;
    
    let hasNewData = false;
    const topicsToCheck = topicsRef.current;
    
    // Verificar si hay datos nuevos en los tópicos que nos interesan
    for (const topic of topicsToCheck) {
      const topicData = mqttData[topic];
      if (!topicData) continue;
      
      const lastProcessedTime = lastMqttDataRef.current[topic];
      const currentTime = topicData.time[topicData.time.length - 1];
      
      if (lastProcessedTime !== currentTime) {
        hasNewData = true;
        lastMqttDataRef.current[topic] = currentTime;
      }
    }
    
    if (!hasNewData) return;
    
    console.log("Actualizando gráfico con nuevos datos MQTT");
    
    // Actualizar el gráfico con los nuevos datos
    const aggregatedData = {};
    let total = 0;

    // Inicializar con 0 para cada variable
    variables.forEach((variable) => {
      aggregatedData[variable.value] = 0;
    });

    // Procesar los datos de MQTT para cada variable
    variables.forEach((variable) => {
      topicsToCheck.forEach(topic => {
        const topicData = mqttData[topic];
        if (!topicData || !topicData.values[variable.value]) return;
        
        const value = topicData.values[variable.value][topicData.values[variable.value].length - 1] || 0;
        aggregatedData[variable.value] += value;
        total += value;
      });
    });

    setTotalValue(total);

    // Preparar datos para el gráfico de pie
    const pieData = {
      labels: variables.map((variable) => variable.value),
      datasets: [
        {
          data: variables.map((variable) => aggregatedData[variable.value]),
          backgroundColor: variables.map((variable) => hexToRgba(variable.color, 0.7)),
          borderColor: variables.map((variable) => variable.color),
          borderWidth: 2,
        },
      ],
    };

    setData(aggregatedData);
    setChartData(pieData);
  };

  // Efecto para suscribirse a los tópicos MQTT cuando estamos en modo 1D
  useEffect(() => {
    if (filter === "1D" && variables && variables.length > 0) {
      isRealTimeEnabled.current = true;
      
      // Suscribirse a los tópicos relevantes para cada variable
      const topics = variables.map(variable => `${variable.variable}/${userId}`);
      topicsRef.current = topics;
      
      // Suscribirse a cada tópico
      topics.forEach(topic => {
        console.log(`Suscribiendo a tópico MQTT: ${topic}`);
        subscribeToTopic(topic);
        lastMqttDataRef.current[topic] = null;
      });
    } else {
      isRealTimeEnabled.current = false;
    }
    
    return () => {
      // Limpiar al desmontar
      isRealTimeEnabled.current = false;
    };
  }, [filter, variables, userId, subscribeToTopic]);

  // Efecto para procesar los datos MQTT cuando cambian
  useEffect(() => {
    processMqttData();
  }, [mqttData]);

  const fetchData = async (currentFilter = filter) => {
    setLoading(true);
    setError(null);
    setData(null);
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

      if (!historicalData || historicalData.length === 0) {
        setData(null);
        setChartData(null);
        setError("No hay datos disponibles para el período seleccionado");
        return;
      }

      // Para gráfico de pie, necesitamos agregar los valores por variable
      const aggregatedData = {};
      let total = 0;

      // Inicializar con 0 para cada variable
      variables.forEach((variable) => {
        aggregatedData[variable.value] = 0;
      });

      // Sumar todos los valores para cada variable
      historicalData.forEach((item) => {
        variables.forEach((variable) => {
          const value = item.values[variable.value] || 0;
          aggregatedData[variable.value] += value;
          total += value;
        });
      });

      setTotalValue(total);

      // Preparar datos para el gráfico de pie
      const pieData = {
        labels: variables.map((variable) => variable.value),
        datasets: [
          {
            data: variables.map((variable) => aggregatedData[variable.value]),
            backgroundColor: variables.map((variable) => hexToRgba(variable.color, 0.7)),
            borderColor: variables.map((variable) => variable.color),
            borderWidth: 2,
          },
        ],
      };

      setData(aggregatedData);
      setChartData(pieData);
      
      // Si estamos en modo 1D, activamos la actualización en tiempo real
      isRealTimeEnabled.current = currentFilter === "1D";
      
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
    
    // Limpiar el error y los datos al cambiar de filtro
    setError(null);
    setData(null);
    setChartData(null);
    setFilter(newFilter);
    setShowDatePicker(false);
    // No llamamos a fetchData aquí, ya que el useEffect lo hará automáticamente
  };

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      // Limpiar el error y los datos al aplicar filtro personalizado
      setError(null);
      setData(null);
      setChartData(null);
      setFilter("custom");
      setShowDatePicker(false);
      // Forzar la actualización de los datos inmediatamente en lugar de esperar al useEffect
      // ya que el cambio de estado de setFilter puede no reflejarse inmediatamente
      fetchData("custom");
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: 0, // Cambiado a 0 para que sea una torta completa sin hueco
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
            return `${label}: ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12
        },
        textAlign: 'center',
        textStrokeColor: '#000',
        textStrokeWidth: 1,
        formatter: (value, context) => {
          const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
          return [
            `${context.chart.data.labels[context.dataIndex]}`,
            `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
            `(${percentage}%)`
          ];
        },
        anchor: 'center',
        align: 'center',
        offset: 0,
        padding: 0
      },
    },
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
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            height: height ? `${height}px` : "400px",
            minHeight: "300px",
          }}
        >
          {loading ? (
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: 2,
              }}
            >
              <CircularProgress size={40} thickness={4} />
              <Typography sx={{ color: "#666", fontSize: "0.875rem" }}>Cargando datos...</Typography>
            </Box>
          ) : !chartData || !data ? (
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
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
            <Box
              sx={{
                flex: "1 1 100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                bgcolor: "#fafbfc",
                p: 2,
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <Pie data={chartData} options={options} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Función auxiliar para convertir colores hex a rgba
const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return "rgba(0, 0, 0, 0.1)";
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

PieHistorico.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string,
  variables: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ),
  fetchHistoricalData: PropTypes.func.isRequired,
  height: PropTypes.number,
};

export default PieHistorico;
