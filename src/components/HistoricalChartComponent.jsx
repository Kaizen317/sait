import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2"; // Importa los tipos de gráficos que necesites
import PropTypes from "prop-types";
import {
  Button,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "chart.js/auto";
import axios from "axios"; // Asegúrate de importar axios correctamente

const HistoricalChartComponent = ({ title, selectedTopics, variablesConfig, chartType }) => {
  const [filter, setFilter] = useState("7d");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [filteredData, setFilteredData] = useState({ labels: [], datasets: [] });
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const processChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Crear un mapa de datos para cada tiempo
    const dataByTime = {};
    data.forEach((item) => {
      const timeLabel = new Date(item.timestamp).toLocaleString();
      if (!dataByTime[timeLabel]) {
        dataByTime[timeLabel] = {};
      }
      dataByTime[timeLabel][item.topic] = parseFloat(item.value);
    });

    // Obtener etiquetas de tiempo solo donde hay datos
    const labels = Object.keys(dataByTime);

    // Crear un dataset para cada variable en variablesConfig
    const datasets = variablesConfig.map((config) => {
      const data = labels.map((label) => dataByTime[label][config.topic] || null); // Null si no hay datos para ese tiempo
      return {
        label: config.variable || config.topic.split("/").pop(), // Etiqueta para la variable
        data,
        backgroundColor: config.color || "rgba(75, 192, 192, 0.6)",
        borderColor: config.color || "rgba(75, 192, 192, 0.6)",
        borderWidth: 1,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const fetchFilteredData = async (filter) => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        filter,
        topics: JSON.stringify(selectedTopics),
      };

      if (filter === "custom-date-range" && startDateTime && endDateTime) {
        params.startDateTime = new Date(startDateTime).toISOString();
        params.endDateTime = new Date(endDateTime).toISOString();
      }

      const response = await axios.get("/mqttmessages/filtered", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setFilteredData(processChartData(response.data));
    } catch (error) {
      console.error("Error al obtener los datos filtrados:", error);
    }
  };

  // Actualizar los datos filtrados al cambiar el filtro o los tópicos seleccionados
  useEffect(() => {
    fetchFilteredData(filter);
  }, [filter, selectedTopics]);

  // Actualizar datos cada vez que variablesConfig cambia
  useEffect(() => {
    fetchFilteredData(filter);
  }, [variablesConfig]);

  return (
    <div style={{ width: "95%", height: "auto", padding: "20px", marginBottom: "30px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h3 style={{ textAlign: "center", fontSize: "22px", marginBottom: "20px", fontWeight: "bold", color: "#333" }}>{title}</h3>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <ButtonGroup variant="contained" color="primary">
          <Button onClick={() => fetchFilteredData("Hoy")}>Hoy</Button>
          <Button onClick={() => fetchFilteredData("1d")}>1 Día</Button>
          <Button onClick={() => fetchFilteredData("7d")}>7 Días</Button>
          <Button onClick={() => fetchFilteredData("1m")}>1 Mes</Button>
          <IconButton onClick={() => setOpenDatePicker(true)} color="primary">
            <CalendarTodayIcon />
          </IconButton>
        </ButtonGroup>
      </div>

      <Dialog open={openDatePicker} onClose={() => setOpenDatePicker(false)}>
        <DialogTitle>Selecciona un rango de fechas y horas</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Fecha y hora de inicio:</label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              style={{ marginBottom: "16px", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <label>Fecha y hora de fin:</label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDatePicker(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={() => fetchFilteredData("custom-date-range")} color="primary">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ height: "400px" }}>
        {chartType === "BarChart" && (
          <Bar
            data={filteredData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { color: "#444" } },
                y: { beginAtZero: true, grid: { color: "#ddd" }, ticks: { color: "#444" } },
              },
            }}
          />
        )}
        {chartType === "LineChart" && (
          <Line
            data={filteredData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { grid: { display: false }, ticks: { color: "#444" } },
                y: { beginAtZero: true, grid: { color: "#ddd" }, ticks: { color: "#444" } },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

HistoricalChartComponent.propTypes = {
  title: PropTypes.string.isRequired,
  selectedTopics: PropTypes.array.isRequired,
  variablesConfig: PropTypes.array.isRequired,
  chartType: PropTypes.oneOf(["BarChart", "LineChart"]).isRequired, // Añade más tipos si es necesario
};

export default HistoricalChartComponent;