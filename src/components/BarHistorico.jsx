import React, { useState, useEffect, useRef } from "react";
import { Button, TextField, Typography, Grid, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const fetchHistoricalData = async (userId, filter, startDate, endDate) => {
  try {
    const url = `https://refiss445e.execute-api.us-east-1.amazonaws.com/filtromqtt?userId=${userId}&filter=${filter}${
      startDate ? `&startDate=${startDate}` : ""
    }${endDate ? `&endDate=${endDate}` : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error al obtener los datos históricos.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return [];
  }
};

const BarHistorico = ({ userId, title, variables = [] }) => {
  const [filter, setFilter] = useState("1D");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  // Función para convertir colores hexadecimales a RGBA
  const hexToRgba = (hex, alpha = 1) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalData(userId, filter, startDate, endDate);

      // Convertir fechas a formato válido y ordenar los datos por fecha
      const processedData = data
        .map((item) => {
          const fecha = new Date(item.fecha);
          return {
            ...item,
            fecha: fecha.toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            fechaOrdenada: fecha, // Guardar la fecha en formato Date para ordenar
          };
        })
        .sort((a, b) => a.fechaOrdenada - b.fechaOrdenada); // Ordenar por fecha

      setHistoricalData(processedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setError("Error al cargar los datos históricos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter !== "custom") {
      fetchData();
    }
  }, [filter]);

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      setFilter("custom");
      fetchData();
    } else {
      alert("Por favor, selecciona ambas fechas.");
    }
  };

  // Preparar los datos para el gráfico
  const chartData = {
    labels: historicalData.map((item) => item.fecha),
    datasets: variables.map((variable, index) => ({
      label: variable.value || `Variable ${index + 1}`,
      data: historicalData.map((item) => item.valores[variable.value] || 0),
      backgroundColor: hexToRgba(variable.color, 0.6), // Usa el color guardado con transparencia
      borderColor: variable.color, // Usa el color guardado sin transparencia
      borderWidth: 1,
    })),
  };

  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title || "Gráfico Histórico",
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return `Fecha: ${context[0].label}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9,
  };

  // Limpiar el gráfico anterior antes de renderizar uno nuevo
  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box
      sx={{
        padding: "5px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1rem" }}>
        {title || "Gráfico Histórico"}
      </Typography>

      <Grid container spacing={1} sx={{ justifyContent: "center" }}>
        <Grid item>
          <Button
            variant={filter === "1D" ? "contained" : "outlined"}
            onClick={() => setFilter("1D")}
            size="small"
          >
            1D
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={filter === "7D" ? "contained" : "outlined"}
            onClick={() => setFilter("7D")}
            size="small"
          >
            7D
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={filter === "30D" ? "contained" : "outlined"}
            onClick={() => setFilter("30D")}
            size="small"
          >
            30D
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={1} sx={{ justifyContent: "center" }}>
        <Grid item>
          <TextField
            label="Fecha Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: "200px", fontSize: "1rem" }} // Aumentar el ancho y el tamaño de la fuente
          />
        </Grid>
        <Grid item>
          <TextField
            label="Fecha Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: "200px", fontSize: "1rem" }} // Aumentar el ancho y el tamaño de la fuente
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCustomFilter}
            disabled={!startDate || !endDate}
            size="small"
          >
            Filtrar
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ flex: 1, minHeight: "250px", position: "relative" }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default BarHistorico;