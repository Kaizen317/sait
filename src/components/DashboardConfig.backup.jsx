import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Chip,
  Paper,
  Alert,
  alpha,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Save,
  DashboardCustomize,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ChartConfigModal from "./ChartConfigModal";
import LineChartComponent from "./LineChartComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
import DoughnutChartComponent from "./DoughnutChartComponent";
import GaugeChartComponent from "./GaugeChartComponent";
import ValueCardComponent from "./ValueCardComponent";
import AreaChartComponent from "./AreaChartComponent";
import AddSubdashboardModal from "./AddSubdashboardModal";
import Sidebar from "./Navbar";
import { MqttContext } from "./MqttContext";
import MixedChartComponent from "./MixedChartComponent";
import BubbleChartComponent from "./BubbleChartComponent";
import RadarChartComponent from "./RadarChartComponent";
import ScatterChartComponent from "./ScatterChartComponent";
import StackedBarChartComponent from "./StackedBarChartComponent";
import BarHistorico from "./BarHistorico";
import LineHistorico from "./LineHistorico";
import PieHistorico from "./PieHistorico";
import AreaHistorico from "./AreaHistorico";
import StackedBarHistorico from "./StackedBarHistorico";
import FormulaComponent from "./FormulaComponent";
import "chartjs-adapter-date-fns";

// Paleta de colores profesional y sobria
const themeColors = {
  primary: {
    main: "#70bc7e",
    light: "#a1d8ab",
    dark: "#5ea66b",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#6C757D",
    light: "#8A9AA1",
    dark: "#495057",
    contrastText: "#ffffff",
  },
  success: {
    main: "#28a745",
    light: "#5cd65c",
    dark: "#1e7e34",
    contrastText: "#ffffff",
  },
  error: {
    main: "#dc3545",
    light: "#e4606d",
    dark: "#a71d2a",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ffc107",
    light: "#ffd454",
    dark: "#c69500",
    contrastText: "#212529",
  },
  info: {
    main: "#17a2b8",
    light: "#4dc3d9",
    dark: "#117a8b",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f4f6f8",
    paper: "#ffffff",
  },
  text: {
    primary: "#212529",
    secondary: "#495057",
    disabled: "#6c757d",
  },
};

const DashboardConfig = () => {
  const { mqttData, subscribeToTopic, userId } = useContext(MqttContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  
  // Estado para almacenar datos históricos
  const [historicalData, setHistoricalData] = useState({});

  const [components, setComponents] = useState([]);
  const [subdashboards, setSubdashboards] = useState([]);
  const [activeSubdashboard, setActiveSubdashboard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [subdashboardModalOpen, setSubdashboardModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingSubdashboardIndex, setEditingSubdashboardIndex] = useState(null);
  const [deletionQueue, setDeletionQueue] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isLoading, setIsLoading] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const columnSizeMap = {
    col2: { xs: 12, sm: 6, md: 4, lg: 2 },
    col3: { xs: 12, sm: 6, md: 4, lg: 3 },
    col4: { xs: 12, sm: 6, md: 4 },
    col6: { xs: 12, sm: 6 },
    col12: { xs: 12 },
  };

  // Ajustar tamaños de columna en vista compacta
  const getColumnSize = (colSize) => {
    if (compactView) {
      const sizes = { ...columnSizeMap[colSize] };
      if (sizes.lg) sizes.lg = Math.max(1, sizes.lg - 1);
      if (sizes.md) sizes.md = Math.max(1, sizes.md - 1);
      return sizes;
    }
    return columnSizeMap[colSize] || { xs: 12, sm: 6, md: 6, lg: 6 };
  };

  // Helper para obtener datos de un tópico: usa MQTT o los históricos si están disponibles
  const getTopicData = (variable) => {
    const topic = variable.variable;
    const parts = topic.split("/");
    const historicalKey = `${parts[3]}:${parts[parts.length - 1]}`;
    return mqttData[topic] || historicalData[historicalKey] || { time: [], values: {} };
  };

  useEffect(() => {
    console.log("Datos MQTT recibidos:", mqttData);
  }, [mqttData]);

  useEffect(() => {
    components.forEach((component) => {
      component.variables.forEach((variable) => {
        const topicParts = variable.variable.split("/");
        const generalTopic = topicParts.slice(0, topicParts.length - 1).join("/") + "/#";
        subscribeToTopic(generalTopic);
      });
    });
  }, [components, subscribeToTopic]);

  useEffect(() => {
    if (!userId) {
      console.warn("[DashConfig] userId no disponible => no suscribimos nada");
      return;
    }
    components.forEach((component) => {
      component.variables.forEach((variable) => {
        const topicParts = variable.variable.split("/");
        const generalTopic = topicParts.slice(0, -1).join("/") + "/#";
        subscribeToTopic(generalTopic);
      });
    });
  }, [components, userId, subscribeToTopic]);

  useEffect(() => {
    // Cerrar sidebar en dispositivos móviles
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los datos:", errorData);
          showSnackbar(`Error: ${errorData.error || "No se pudieron cargar los datos."}`, "error");
          return;
        }
        const data = await response.json();
        const { dashboards } = data;
        const subdashboardsFromDB = dashboards.map((d) => ({
          id: d.subdashboardId,
          name: d.subdashboardName,
          color: d.subdashboardColor,
        }));
        const componentsFromDB = dashboards.flatMap((d) =>
          d.components.map((comp) => ({
            ...comp,
            subdashboardId: d.subdashboardId,
          }))
        );
        setSubdashboards(subdashboardsFromDB);
        setComponents(componentsFromDB);
        if (subdashboardsFromDB.length > 0) {
          setActiveSubdashboard(subdashboardsFromDB[0]);
        }
        showSnackbar("Datos cargados correctamente", "success");
      } catch (error) {
        console.error("Error en la solicitud:", error);
        showSnackbar("Hubo un error al conectar con el servidor.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const storedHistorical = localStorage.getItem("mqttHistoricalData");
      if (storedHistorical) {
        setHistoricalData(JSON.parse(storedHistorical));
      } else if (components.length > 0) {
        // Extraer tópicos únicos a partir de los componentes
        const topicsSet = new Set();
        components.forEach((comp) => {
          comp.variables?.forEach((variable) => {
            const parts = variable.variable.split("/");
            const device_id = parts[3];
            const subtopic = parts[parts.length - 1];
            topicsSet.add(JSON.stringify({ device_id, subtopic }));
          });
        });
        const topics = Array.from(topicsSet).map((t) => JSON.parse(t));
        if (topics.length > 0) {
          fetch("https://a85yvzzn8e.execute-api.us-east-1.amazonaws.com/mqtthistorico", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId, topics }),
          })
            .then((res) => res.json())
            .then((rawData) => {
              const structuredData = {};
            
              // rawData es algo como:
              // {
              //   "medidor1:medidorsiemens": [
              //     { timestamp: "...", value: { corrientel1: 2, ... } },
              //     { timestamp: "...", value: { corrientel1: 3, ... } },
              //     ...
              //   ],
              //   "medidor1:Potencias": [...],
              //   ...
              // }
            
              for (const [key, arr] of Object.entries(rawData)) {
                // 1. Ordenar por fecha ascendente
                arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
                const times = [];
                const values = {};
            
                // 2. Recorrer en orden ascendente y llenar tus arrays
                arr.forEach((entry) => {
                  times.push(entry.timestamp);
                  for (const [valKey, valValue] of Object.entries(entry.value)) {
                    if (!values[valKey]) values[valKey] = [];
                    values[valKey].push(valValue);
                  }
                });
            
                structuredData[key] = {
                  time: times,
                  values,
                };
              }
            
              localStorage.setItem("mqttHistoricalData", JSON.stringify(structuredData));
              setHistoricalData(structuredData);
            })
            .catch((err) => console.error("Error fetching historical data:", err));
        }
      }
    }
  }, [userId, components]);
  

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddComponent = (newComponent) => {
    if (!activeSubdashboard) {
      showSnackbar("Selecciona un subdashboard antes de agregar un componente.", "warning");
      return;
    }
    newComponent.subdashboardId = activeSubdashboard.id;
    if (editingIndex !== null) {
      const updatedComponents = [...components];
      updatedComponents[editingIndex] = newComponent;
      setComponents(updatedComponents);
      showSnackbar("Componente actualizado correctamente", "success");
    } else {
      setComponents([...components, newComponent]);
      showSnackbar("Nuevo componente añadido", "success");
    }
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleEditComponent = (index) => {
    if (!activeSubdashboard) {
      showSnackbar("Selecciona un subdashboard antes de editar un componente.", "warning");
      return;
    }
    const filteredComponents = components.filter(
      (component) => component.subdashboardId === activeSubdashboard.id
    );
    if (index < 0 || index >= filteredComponents.length) {
      console.error("Índice de edición inválido:", index);
      return;
    }
    const componentToEdit = filteredComponents[index];
    const globalIndex = components.findIndex(
      (comp) => comp.subdashboardId === activeSubdashboard.id && comp === componentToEdit
    );
    if (globalIndex === -1) {
      console.error("No se encontró el componente.");
      return;
    }
    setEditingIndex(globalIndex);
    setModalOpen(true);
  };

  const handleDeleteComponent = (index) => {
    const filteredComponents = components.filter(
      (component) => component.subdashboardId === activeSubdashboard?.id
    );
    if (index < 0 || index >= filteredComponents.length) {
      console.error("Índice de eliminación inválido:", index);
      return;
    }
    const componentToDelete = filteredComponents[index];
    const globalIndex = components.findIndex(
      (comp) => comp.subdashboardId === activeSubdashboard?.id && comp === componentToDelete
    );
    if (globalIndex === -1) {
      console.error("No se encontró el componente.");
      return;
    }
    const deletedComponent = components[globalIndex];
    if (!deletedComponent?.subdashboardId) {
      console.error("El componente no tiene un ID válido:", deletedComponent);
      showSnackbar("Este componente no puede eliminarse.", "error");
      return;
    }
    setDeletionQueue((prev) => [
      ...prev,
      { type: "component", id: deletedComponent.subdashboardId }
    ]);
    setComponents((prev) => prev.filter((_, i) => i !== globalIndex));
    showSnackbar("Componente eliminado", "success");
  };

  const handleDeleteSubdashboard = (index) => {
    const deletedSubdashboard = subdashboards[index];
    if (!deletedSubdashboard?.id) {
      console.error("Subdashboard sin ID válido:", deletedSubdashboard);
      showSnackbar("Este subdashboard no puede eliminarse.", "error");
      return;
    }
    setDeletionQueue((prev) => [
      ...prev,
      { type: "subdashboard", id: deletedSubdashboard.id }
    ]);
    setSubdashboards((prev) => prev.filter((_, i) => i !== index));
    setComponents((prev) =>
      prev.filter((comp) => comp.subdashboardId !== deletedSubdashboard.id)
    );
    if (activeSubdashboard?.id === deletedSubdashboard.id) {
      setActiveSubdashboard(subdashboards[0] || null);
    }
    showSnackbar("Subdashboard eliminado", "success");
  };

  const handleAddSubdashboard = (subdashboard) => {
    if (editingSubdashboardIndex !== null) {
      const updatedSubdashboards = [...subdashboards];
      updatedSubdashboards[editingSubdashboardIndex] = {
        ...updatedSubdashboards[editingSubdashboardIndex],
        ...subdashboard,
      };
      setSubdashboards(updatedSubdashboards);
      setEditingSubdashboardIndex(null);
      showSnackbar("Subdashboard actualizado", "success");
    } else {
      const newSubdashboard = { id: Date.now(), ...subdashboard };
      setSubdashboards((prev) => [...prev, newSubdashboard]);
      setActiveSubdashboard(newSubdashboard);
      showSnackbar("Subdashboard añadido", "success");
    }
    setSubdashboardModalOpen(false);
  };

  const handleEditSubdashboard = (index) => {
    setEditingSubdashboardIndex(index);
    setSubdashboardModalOpen(true);
  };
  const fetchHistoricalData = async (userId, variables, filter, startDate, endDate) => {
    try {
      const variable = variables[0];
      const topicParts = variable.variable.split("/");
      const device_id = topicParts[3];
      const subtopic = topicParts[topicParts.length - 1];
  
      // Aquí asumimos que startDate y endDate ya vienen correctos desde fetchData
      const calculatedStartDate = startDate; // ya formateado
      const calculatedEndDate = endDate;       // ya formateado
  
      console.log("Fechas recibidas en fetchHistoricalData:", { calculatedStartDate, calculatedEndDate, filter });
      console.log("Voy a armar queryParams con:", { userId, device_id, subtopic, filter, startDate, endDate });

      const queryParams = new URLSearchParams({
        userId: userId,
        device_id: device_id,
        subtopic: subtopic,
        filter: filter,
      });
  
      queryParams.append("startDate", calculatedStartDate);
      queryParams.append("endDate", calculatedEndDate);
  
      const url = `https://refiss445e.execute-api.us-east-1.amazonaws.com/filtromqtt?${queryParams.toString()}`;
      console.log("Solicitud enviada a:", url);
  
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("No se encontraron datos para los parámetros proporcionados");
          return [];
        }
        const errorData = await response.json();
        console.error("Error de la API:", errorData.message);
        throw new Error(errorData.message || "Error al obtener datos históricos");
      }
  
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);
  
      if (!data || data.length === 0) {
        console.warn("La API devolvió una respuesta exitosa pero sin datos");
        return [];
      }
  
      return data;
    } catch (error) {
      console.error("Error al obtener datos históricos:", error.message);
      throw error;
    }
  };
  
  const handleSaveDashboard = async () => {
    if (!userId) {
      showSnackbar("El usuario no está logueado.", "error");
      return;
    }
    if (!subdashboards.length && !deletionQueue.length) {
      showSnackbar("No hay subdashboards o eliminaciones pendientes.", "warning");
      return;
    }
    try {
      setIsLoading(true);
      for (const item of deletionQueue) {
        const deleteResponse = await fetch(
          `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}&type=${item.type}&id=${item.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          console.error("Error al eliminar:", errorData);
          showSnackbar(`Error: ${errorData.error || "No se pudo eliminar."}`, "error");
          return;
        }
      }
      setDeletionQueue([]);
      const payload = {
        userId,
        subdashboards: subdashboards.map((sub) => ({
          id: sub.id?.toString(),
          name: sub.name?.trim() || "Subdashboard sin nombre",
          color: sub.color || "#FFFFFF",
        })),
        components: components.map((comp) => {
          const componentData = {
            subdashboardId: comp.subdashboardId?.toString(),
            chartType: comp.chartType || "Sin tipo de gráfico",
            componentName: comp.componentName?.trim() || "Componente sin nombre",
            variables: (comp.variables || []).map((variable) => {
              const segments = variable.variable.split("/");
              const topic = segments.slice(0, segments.length - 1).join("/");
              const subtopic = segments[segments.length - 1];
              return {
                variable: variable.variable?.trim() || "Variable sin nombre",
                topic: topic || "Sin topic",
                subtopic: subtopic || "Sin subtopic",
                value: variable.value || "Sin value",
                color: variable.color || "#000000",
                type: variable.type || "bar",
              };
            }),
            colSize: comp.colSize || "col6",
            height: typeof comp.height === "number" ? comp.height : 400,
          };

          if (comp.chartType === "FormulaComponent") {
            componentData.formula = comp.formula || "";
            componentData.formulaDisplayType = comp.formulaDisplayType || "number";
            componentData.formulaUnit = comp.formulaUnit || "";
            if (comp.formulaDisplayType === "gauge") {
              componentData.formulaMin = comp.formulaMin !== undefined ? comp.formulaMin : 0;
              componentData.formulaMax = comp.formulaMax !== undefined ? comp.formulaMax : 100;
            }
          }

          return componentData;
        }),
      };
      const response = await fetch(
        "https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al guardar:", errorData);
        showSnackbar(`Error: ${errorData.error || "No se pudo guardar."}`, "error");
        return;
      }
      showSnackbar("Panel guardado exitosamente.", "success");
    } catch (error) {
      console.error("Error en la solicitud:", error);
      showSnackbar("Error al conectar con el servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChart = (component) => {
    if (!component.variables || component.variables.length === 0) {
      return { labels: [], datasets: [] };
    }
    if (component.chartType === "PieChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
      component.variables.forEach((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable);
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || "#fff");
            borderColors.push(variable.borderColor || variable.color || "#fff");
          }
        }
      });
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      };
    }
    if (component.chartType === "DoughnutChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
      component.variables.forEach((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable);
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || "#fff");
            borderColors.push(variable.borderColor || variable.color || "#fff");
          }
        }
      });
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      };
    }
    if (
      component.chartType === "LineChart" ||
      component.chartType === "BarChart" ||
      component.chartType === "AreaChart"
    ) {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable) || { time: [], values: {} };
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
        if (labels.length === 0) {
          labels = alignedTimes;
        }
        const numericValues = alignedValues.map(val => parseFloat(val)).filter(val => !isNaN(val));
        const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;
        const minValue = numericValues.length > 0 ? Math.min(...numericValues) : null;
        const avgValue = numericValues.length > 0 ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2) : null;
  
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(31,78,121,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(31,78,121,1)",
          borderWidth: 2,
          fill: component.chartType === "AreaChart",
          maxValue,
          minValue,
          avgValue,
        };
      });
      return { labels, datasets };
    }
    if (component.chartType === "GaugeChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
      component.variables.forEach((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable);
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || "#fff");
            borderColors.push(variable.borderColor || variable.color || "#fff");
          }
        }
      });
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      };
    }
    if (component.chartType === "ValueCard") {
      const variablesData = component.variables
        .map((variable) => {
          const valueKey = variable.value;
          const topicData = getTopicData(variable);
          if (topicData?.values && topicData.values[valueKey] !== undefined) {
            const values = Array.isArray(topicData.values[valueKey])
              ? topicData.values[valueKey]
              : [topicData.values[valueKey]];
            return {
              value: valueKey,
              data: values,
              backgroundColor: variable.backgroundColor || variable.color || "#fff",
            };
          }
          return null;
        })
        .filter(Boolean);
      return variablesData;
    }
    if (component.chartType === "MixedChart") {
      let labels = [];
      const datasets = component.variables.map((variable, index) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable) || { time: [], values: {} };
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
        if (labels.length === 0) {
          labels = alignedTimes;
        }
        const defaultType = index % 2 === 0 ? "line" : "bar";
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(31,78,121,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(31,78,121,1)",
          borderWidth: 2,
          type: variable.type || defaultType,
        };
      });
      return { labels, datasets };
    }
    if (
      component.chartType === "StackedBarChart" ||
      component.chartType === "BubbleChart" ||
      component.chartType === "RadarChart" ||
      component.chartType === "ScatterChart" ||
      component.chartType === "BarHistorico" ||
      component.chartType === "LineHistorico"
    ) {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable) || { time: [], values: {} };
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
        if (labels.length === 0) {
          labels = alignedTimes;
        }
        if (component.chartType === "BubbleChart" || component.chartType === "ScatterChart") {
          return {
            label: valueKey || "Sin Nombre",
            data: alignedValues.map((value, index) => ({
              x: index,
              y: value,
              r: component.chartType === "BubbleChart" ? Math.abs(value) / 10 : undefined,
            })),
            backgroundColor: variable.backgroundColor || variable.color || "rgba(31,78,121,0.4)",
            borderColor: variable.borderColor || variable.color || "rgba(31,78,121,1)",
            borderWidth: 2,
          };
        }
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(31,78,121,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(31,78,121,1)",
          borderWidth: 2,
          fill: component.chartType === "AreaChart",
        };
      });
      return { labels, datasets };
    }
    if (component.chartType === "PieHistorico") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
      component.variables.forEach((variable) => {
        const valueKey = variable.value;
        const topicData = getTopicData(variable);
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || "#fff");
            borderColors.push(variable.borderColor || variable.color || "#fff");
          }
        }
      });
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: borderColors,
            borderWidth: 2,
          },
        ],
      };
    }
    if (component.chartType === "AreaHistorico") {
      const labels = [];
      let datasets = [];
      if (component.variables && component.variables.length > 0) {
        datasets = component.variables.map((variable) => {
          return {
            label: variable.value || "Sin nombre",
            data: [],
            backgroundColor: `${variable.color}80`,
            borderColor: variable.color || "#3b82f6",
            borderWidth: 2,
            fill: true,
          };
        });
      }
      return {
        labels: [],
        datasets: datasets,
      };
    }
    if (component.chartType === "StackedBarHistorico") {
      const labels = [];
      let datasets = [];
      if (component.variables && component.variables.length > 0) {
        datasets = component.variables.map((variable) => {
          return {
            label: variable.value || "Sin nombre",
            data: [],
            backgroundColor: `${variable.color}80`,
            borderColor: variable.color || "#3b82f6",
            borderWidth: 2,
          };
        });
      }
      return {
        labels: [],
        datasets: datasets,
      };
    }
    if (component.chartType === "FormulaComponent") {
      const variablesData = component.variables
        .map((variable) => {
          const valueKey = variable.value;
          const topicData = getTopicData(variable);
          if (topicData?.values && topicData.values[valueKey] !== undefined) {
            const values = Array.isArray(topicData.values[valueKey])
              ? topicData.values[valueKey]
              : [topicData.values[valueKey]];
            return {
              value: valueKey,
              data: values,
              backgroundColor: variable.backgroundColor || variable.color || "#fff",
            };
          }
          return null;
        })
        .filter(Boolean);
      return variablesData;
    }
    return { labels: [], datasets: [] };
  };

  const renderComponent = (component, index) => {
    const colSize = getColumnSize(component.colSize);
    const height = component.height || 300;
    const chartData = prepareChart(component);

    return (
      <Grid item {...colSize} key={index} sx={{ marginBottom: "24px" }}>
        <Card
          elevation={3}
          sx={{
            p: 2,
            background: themeColors.background.paper,
            border: `1px solid ${alpha(themeColors.primary.main, 0.1)}`,
            borderRadius: "8px",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            },
            height: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Component Header */}
          <Box
            sx={{
              background: "#006875",
              color: "white",
              padding: { xs: "12px 16px", md: "14px 18px" },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              margin: "-16px -16px 16px -16px",
              "& .MuiIconButton-root": {
                color: "white",
                marginLeft: "8px",
                padding: "6px",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
              },
            }}
          >
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
              {component.componentName || "Componente sin nombre"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton size="small" onClick={() => handleEditComponent(index)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteComponent(index)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {/* Chart Content */}
          <CardContent
            sx={{
              padding: { xs: "16px", sm: "18px", md: "20px" },
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: themeColors.background.default,
              minHeight: `${height}px`,
            }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              {component.chartType === "LineChart" && (
                <LineChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "BarChart" && (
                <BarChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "PieChart" && (
                <PieChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "DoughnutChart" && (
                <DoughnutChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "GaugeChart" && (
                <GaugeChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "ValueCard" && (
                <ValueCardComponent variables={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "AreaChart" && (
                <AreaChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "MixedChart" && (
                <MixedChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "StackedBarChart" && (
                <StackedBarChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "BubbleChart" && (
                <BubbleChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "RadarChart" && (
                <RadarChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "ScatterChart" && (
                <ScatterChartComponent data={chartData} title={component.componentName} height={height} />
              )}
              {component.chartType === "BarHistorico" && (
                <BarHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables}
                  height={height}
                />
              )}
              {component.chartType === "LineHistorico" && (
                <LineHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables || []}
                  height={height}
                />
              )}
              {component.chartType === "PieHistorico" && (
                <PieHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables || []}
                  height={height}
                />
              )}
              {component.chartType === "AreaHistorico" && (
                <AreaHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables || []}
                  height={height}
                />
              )}
              {component.chartType === "StackedBarHistorico" && (
                <StackedBarHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables || []}
                  height={height}
                />
              )}
              {component.chartType === "FormulaComponent" && (
                <FormulaComponent userId={userId} componentData={component} height={height} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
  };

  const filteredComponents = components.filter(
    (component) => component.subdashboardId === activeSubdashboard?.id
  );

  // Ajuste del ancho del contenido según el sidebar
  const contentWidth = isMobile ? "100%" : sidebarOpen ? "calc(100% - 260px)" : "100%";
  const contentMarginLeft = isMobile ? "0px" : sidebarOpen ? "260px" : "0px";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: themeColors.background.default,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Grid container spacing={3}>
        <Sidebar setIsSidebarOpen={setSidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: { xs: "16px", sm: "24px", md: "32px" },
            marginLeft: contentMarginLeft,
            maxWidth: contentWidth,
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          {/* Dashboard Header */}
          <Box sx={{ mb: 4, textAlign: "center", py: 2 }}>
            <Typography
              variant="h3"
              className="dashboard-title"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                fontWeight: 700,
                color: themeColors.text.primary,
                marginBottom: "1rem",
              }}
            >
              Panel de Control
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: themeColors.text.secondary,
                maxWidth: "700px",
                mx: "auto",
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.6,
              }}
            >
              Personaliza tu experiencia añadiendo subdashboards y componentes para visualizar tus datos en tiempo real.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              borderRadius: "12px",
              background: themeColors.background.paper,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: themeColors.text.primary,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                }}
              >
                Acciones Rápidas
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => setSubdashboardModalOpen(true)}
                startIcon={<DashboardCustomize />}
                fullWidth={isMobile}
                sx={{
                  background: themeColors.secondary.main,
                  color: themeColors.secondary.contrastText,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  boxShadow: `0 4px 8px ${alpha(themeColors.secondary.main, 0.3)}`,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    background: themeColors.secondary.dark,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {isMobile ? "Añadir Dashboard" : "Añadir Subdashboard"}
              </Button>
              <Button
                variant="contained"
                onClick={() => setModalOpen(true)}
                startIcon={<Add />}
                disabled={!activeSubdashboard}
                fullWidth={isMobile}
                sx={{
                  background: themeColors.success.main,
                  color: themeColors.success.contrastText,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  boxShadow: `0 4px 8px ${alpha(themeColors.success.main, 0.3)}`,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    background: themeColors.success.dark,
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    background: "rgba(0, 0, 0, 0.12)",
                    color: "rgba(0, 0, 0, 0.26)",
                    boxShadow: "none",
                  },
                }}
              >
                Añadir Componente
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveDashboard}
                startIcon={<Save />}
                fullWidth={isMobile}
                sx={{
                  background: themeColors.primary.main,
                  color: themeColors.primary.contrastText,
                  padding: "12px 24px",
                  borderRadius: "8px",
                  boxShadow: `0 4px 8px ${alpha(themeColors.primary.main, 0.3)}`,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  "&:hover": {
                    background: themeColors.primary.dark,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Guardar Panel
              </Button>
            </Box>
          </Paper>

          {/* Subdashboards Section */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: "16px",
              background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: "linear-gradient(90deg, #70bc7e, #5ea66b)",
              }
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: themeColors.text.primary,
                mb: 4,
                textAlign: "center",
                fontWeight: 700,
                position: "relative",
                display: "inline-block",
                left: "50%",
                transform: "translateX(-50%)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80px",
                  height: "3px",
                  background: "linear-gradient(90deg, #70bc7e, #5ea66b)",
                  borderRadius: "3px",
                }
              }}
            >
              Subdashboards Disponibles
            </Typography>
            {subdashboards.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  color: themeColors.text.secondary,
                  py: 5,
                  px: 3,
                  background: "linear-gradient(145deg, #f8f9fa, #f1f3f5)",
                  borderRadius: "12px",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.03)",
                  border: "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                  <DashboardCustomize sx={{ fontSize: 60, color: alpha(themeColors.primary.main, 0.5), mb: 2 }} />
                </Box>
                <Typography sx={{ mb: 3, fontSize: "1.1rem", fontWeight: 500, color: themeColors.text.primary }}>
                  No hay subdashboards creados. Crea tu primer subdashboard.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setSubdashboardModalOpen(true)}
                  startIcon={<Add />}
                  sx={{
                    borderRadius: "8px",
                    background: themeColors.primary.main,
                    boxShadow: `0 4px 10px ${alpha(themeColors.primary.main, 0.4)}`,
                    "&:hover": {
                      background: themeColors.primary.dark,
                      transform: "translateY(-2px)",
                    },
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Crear primer subdashboard
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {subdashboards.map((subdashboard, index) => {
                    const isActive = activeSubdashboard?.id === subdashboard.id;

                    return (
                      <Card
                        key={subdashboard.id}
                        onClick={() => setActiveSubdashboard(subdashboard)}
                        sx={{
                          cursor: "pointer",
                          width: { xs: "100%", sm: "220px", md: "220px" }, // Ajusta el ancho
                          minHeight: "120px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          p: 2,
                          borderRadius: "16px",
                          transition: "all 0.3s ease",
                          // Gradiente distinto si está activo o no
                          background: isActive
                            ? "linear-gradient(135deg, #006875 0%, #00a6b4 100%)"
                            : "linear-gradient(135deg, #334155 0%, #475569 100%)",
                          boxShadow: isActive
                            ? "0 10px 25px rgba(0, 166, 180, 0.4)"
                            : "0 6px 12px rgba(0,0,0,0.15)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isActive
                              ? "0 12px 28px rgba(0, 166, 180, 0.45)"
                              : "0 10px 20px rgba(0,0,0,0.2)",
                          },
                        }}
                      >
                        {/* Encabezado e iconos de edición/eliminación */}
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              fontWeight: 600,
                              color: "#fff",
                            }}
                          >
                            {subdashboard.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSubdashboardIndex(index);
                                setSubdashboardModalOpen(true);
                              }}
                              size="small"
                              sx={{
                                color: "#fff",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubdashboard(index);
                              }}
                              size="small"
                              sx={{
                                color: "white",
                                backgroundColor: "rgba(255,255,255,0.15)",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Contador de componentes */}
                        <Chip
                          label={`${components.filter((comp) => comp.subdashboardId === subdashboard.id).length} componentes`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            border: "1px solid rgba(255,255,255,0.2)",
                            mt: "auto",
                          }}
                        />
                      </Card>
                    );
                  })}
                </Box>
              </Grid>
            )}
          </Paper>

          {/* Components Grid */}
          {activeSubdashboard ? (
            <Box sx={{ my: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: themeColors.text.primary,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  }}
                >
                  Componentes en "{activeSubdashboard.name}"
                </Typography>
                <Chip
                  label={`${filteredComponents.length} componentes`}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    px: 1,
                    background: themeColors.primary.main,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>
              {filteredComponents.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: "8px",
                    border: `1px dashed ${alpha(themeColors.primary.main, 0.3)}`,
                    background: alpha(themeColors.background.paper, 0.7),
                  }}
                >
                  <Typography color={themeColors.text.secondary} sx={{ mb: 2, fontSize: "1.1rem" }}>
                    No hay componentes en este subdashboard.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                    startIcon={<Add />}
                    sx={{
                      borderRadius: "8px",
                      background: themeColors.primary.main,
                      boxShadow: `0 4px 10px ${alpha(themeColors.primary.main, 0.4)}`,
                      "&:hover": {
                        background: themeColors.primary.dark,
                        transform: "translateY(-2px)",
                      },
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    Añadir primer componente
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredComponents.map((component, index) => renderComponent(component, index))}
                </Grid>
              )}
            </Box>
          ) : (
            <Paper
              elevation={2}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: "8px",
                border: `1px dashed ${alpha(themeColors.primary.main, 0.3)}`,
                background: themeColors.background.paper,
                my: 4,
              }}
            >
              <Typography
                color={themeColors.text.secondary}
                sx={{
                  mb: 3,
                  fontSize: "1.1rem",
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                Selecciona un subdashboard o crea uno nuevo para personalizar tu panel.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setSubdashboardModalOpen(true)}
                startIcon={<DashboardCustomize />}
                sx={{
                  borderRadius: "8px",
                  borderWidth: "2px",
                  borderColor: themeColors.secondary.main,
                  color: themeColors.secondary.main,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: themeColors.secondary.dark,
                    background: alpha(themeColors.secondary.main, 0.05),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Crear primer subdashboard
              </Button>
            </Paper>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  background: "#fff",
                  padding: 4,
                  borderRadius: "8px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                  maxWidth: "300px",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: themeColors.primary.main }}>
                  Cargando datos...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Espere mientras configuramos su panel.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Modales y Snackbars */}
          <ChartConfigModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSave={handleAddComponent}
            initialData={editingIndex !== null ? components[editingIndex] : null}
          />
          <AddSubdashboardModal
            open={subdashboardModalOpen}
            onClose={() => {
              setSubdashboardModalOpen(false);
              setEditingSubdashboardIndex(null);
            }}
            onSave={handleAddSubdashboard}
            initialData={editingSubdashboardIndex !== null ? subdashboards[editingSubdashboardIndex] : null}
          />
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: "8px",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                minWidth: "300px",
              },
            }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              variant="filled"
              sx={{
                width: "100%",
                alignItems: "center",
                "& .MuiAlert-icon": { fontSize: "1.5rem", opacity: 0.9 },
                "& .MuiAlert-message": { fontSize: "0.95rem", fontWeight: 500 },
              }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Grid>
    </Box>
  );
};

export { DashboardConfig };
