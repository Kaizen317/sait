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
  Alert
} from "@mui/material";
import { 
  Edit, 
  Delete, 
  Add, 
  Save, 
  DashboardCustomize, 
  Menu as MenuIcon,
  Close as CloseIcon
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
import "chartjs-adapter-date-fns";

const DashboardConfig = () => {
  const { mqttData, subscribeToTopic, userId } = useContext(MqttContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

  const columnSizeMap = {
    col2: {
      xs: 12, 
      sm: 6, 
      md: 4, 
      lg: 2
    },
    col3: {
      xs: 12, 
      sm: 6, 
      md: 4, 
      lg: 3
    },
    col4: {
      xs: 12, 
      sm: 6, 
      md: 4
    },
    col6: {
      xs: 12, 
      sm: 6
    },
    col12: {
      xs: 12
    },
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
    // Close sidebar on mobile when component mounts
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        return;
      }

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

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddComponent = (newComponent) => {
    if (!activeSubdashboard) {
      showSnackbar("Por favor, selecciona un subdashboard antes de agregar un componente.", "warning");
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
      showSnackbar("Nuevo componente añadido correctamente", "success");
    }

    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleEditComponent = (index) => {
    if (!activeSubdashboard) {
      showSnackbar("Por favor, selecciona un subdashboard antes de editar un componente.", "warning");
      return;
    }

    // Filtrar los componentes del subdashboard activo
    const filteredComponents = components.filter(
      (component) => component.subdashboardId === activeSubdashboard.id
    );

    if (index < 0 || index >= filteredComponents.length) {
      console.error("Índice de edición inválido:", index);
      return;
    }

    // Obtener el componente correcto del estado global usando el índice filtrado
    const componentToEdit = filteredComponents[index];
    const globalIndex = components.findIndex(
      (comp) => comp.subdashboardId === activeSubdashboard.id && comp === componentToEdit
    );

    if (globalIndex === -1) {
      console.error("No se encontró el componente en el estado global.");
      return;
    }

    setEditingIndex(globalIndex); // Usar el índice global para editar
    setModalOpen(true);
  };

  const handleDeleteComponent = (index) => {
    // Filtrar los componentes del subdashboard activo
    const filteredComponents = components.filter(
      (component) => component.subdashboardId === activeSubdashboard?.id
    );
  
    // Verificar si el índice está dentro del rango de los componentes filtrados
    if (index < 0 || index >= filteredComponents.length) {
      console.error("Índice de eliminación inválido:", index);
      return;
    }
  
    // Obtener el componente a eliminar del subdashboard activo
    const componentToDelete = filteredComponents[index];
  
    // Encontrar el índice global del componente en la lista completa de componentes
    const globalIndex = components.findIndex(
      (comp) => comp.subdashboardId === activeSubdashboard?.id && comp === componentToDelete
    );
  
    if (globalIndex === -1) {
      console.error("No se encontró el componente en el estado global.");
      return;
    }
  
    // Eliminar el componente usando el índice global
    const deletedComponent = components[globalIndex];
  
    if (!deletedComponent?.subdashboardId) {
      console.error("El componente no tiene un ID válido para eliminar:", deletedComponent);
      showSnackbar("Error: Este componente no puede eliminarse porque no tiene un identificador válido.", "error");
      return;
    }
  
    // Agregar a la cola de eliminación
    setDeletionQueue((prev) => [
      ...prev,
      { type: "component", id: deletedComponent.subdashboardId },
    ]);
  
    // Eliminar el componente del estado
    setComponents((prev) => prev.filter((_, i) => i !== globalIndex));
    showSnackbar("Componente eliminado correctamente", "success");
  };

  const handleDeleteSubdashboard = (index) => {
    const deletedSubdashboard = subdashboards[index];

    if (!deletedSubdashboard?.id) {
      console.error("El subdashboard no tiene un ID válido para eliminar:", deletedSubdashboard);
      showSnackbar("Error: Este subdashboard no puede eliminarse porque no tiene un identificador válido.", "error");
      return;
    }

    setDeletionQueue((prev) => [
      ...prev,
      { type: "subdashboard", id: deletedSubdashboard.id },
    ]);

    setSubdashboards((prev) => prev.filter((_, i) => i !== index));
    setComponents((prev) =>
      prev.filter((comp) => comp.subdashboardId !== deletedSubdashboard.id)
    );

    // Si el subdashboard eliminado era el activo, selecciona otro
    if (activeSubdashboard?.id === deletedSubdashboard.id) {
      setActiveSubdashboard(subdashboards[0] || null);
    }

    showSnackbar("Subdashboard eliminado con éxito", "success");
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
      showSnackbar("Subdashboard actualizado correctamente", "success");
    } else {
      const newSubdashboard = { id: Date.now(), ...subdashboard };
      setSubdashboards((prev) => [...prev, newSubdashboard]);
      setActiveSubdashboard(newSubdashboard);
      showSnackbar("Nuevo subdashboard añadido correctamente", "success");
    }
    setSubdashboardModalOpen(false);
  };

  const handleEditSubdashboard = (index) => {
    setEditingSubdashboardIndex(index);
    setSubdashboardModalOpen(true);
  };

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

  const handleSaveDashboard = async () => {
    if (!userId) {
      showSnackbar("El usuario no está logueado.", "error");
      return;
    }

    if (!subdashboards.length && !deletionQueue.length) {
      showSnackbar("No hay subdashboards creados ni eliminaciones pendientes para guardar.", "warning");
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
          showSnackbar(`Error al eliminar: ${errorData.error || "No se pudo eliminar el elemento."}`, "error");
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
        components: components.map((comp) => ({
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
            };
          }),
          colSize: comp.colSize || "col6",
          height: typeof comp.height === "number" ? comp.height : 400,
        })),
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

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
        console.error("Error al guardar el panel de control:", errorData);
        showSnackbar(`Error: ${errorData.error || "No se pudo guardar el panel de control."}`, "error");
        return;
      }

      showSnackbar("Panel de control guardado exitosamente.", "success");
    } catch (error) {
      console.error("Error en la solicitud:", error);
      showSnackbar("Hubo un error al conectar con el servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChart = (component) => {
    // Si no hay variables, retornar datos vacíos
    if (!component.variables || component.variables.length === 0) {
      return { labels: [], datasets: [] };
    }
  
    // Preparar datos para PieChart
    if (component.chartType === "PieChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
  
      component.variables.forEach((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];
  
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          // Obtener el último valor
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
  
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || '#fff');
            borderColors.push(variable.borderColor || variable.color || '#fff');
          }
        }
      });
  
      return {
        labels: labels,
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
  
    // Preparar datos para DoughnutChart
    if (component.chartType === "DoughnutChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
  
      component.variables.forEach((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];
  
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          // Obtener el último valor
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
  
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || '#fff');
            borderColors.push(variable.borderColor || variable.color || '#fff');
          }
        }
      });
  
      return {
        labels: labels,
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
  
    // Preparar datos para gráficos de líneas, barras, área, etc.
    if (
      component.chartType === "LineChart" ||
      component.chartType === "BarChart" ||
      component.chartType === "AreaChart"
    ) {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
  
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
  
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
  
        if (labels.length === 0) {
          labels = alignedTimes;
        }
  
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 2,
          fill: component.chartType === "AreaChart", // Solo llenar para gráficos de área
        };
      });
  
      return { labels, datasets };
    }
  
    // Preparar datos para GaugeChart
    if (component.chartType === "GaugeChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];
  
      component.variables.forEach((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];
  
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          // Obtener el último valor
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];
  
          if (lastValue !== undefined) {
            labels.push(valueKey);
            values.push(parseFloat(lastValue));
            colors.push(variable.backgroundColor || variable.color || '#fff');
            borderColors.push(variable.borderColor || variable.color || '#fff');
          }
        }
      });
  
      return {
        labels: labels,
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
      const variablesData = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];
  
        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          // Obtener los valores de la variable
          const values = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey]
            : [topicData.values[valueKey]];
  
          return {
            value: valueKey, // Nombre de la variable (por ejemplo, "potencia")
            data: values, // Valores de la variable
            backgroundColor: variable.backgroundColor || variable.color || "#fff",
          };
        }
  
        return null; // Si no hay datos para la variable
      }).filter(Boolean); // Filtrar variables sin datos
  
      return variablesData; // Retornar todas las variables con datos
    }
    if (component.chartType === "MixedChart") {
      let labels = []; // Cambiar `const` por `let`
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        if (labels.length === 0) {
          labels = alignedTimes; // Ahora esto es válido
        }
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 2,
          type: variable.type || "bar",
        };
      });
    
      return { labels, datasets };
    }
    if (component.chartType === "StackedBarChart") {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedTimes = timesArray.slice(-10);
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        if (labels.length === 0) {
          labels = alignedTimes;
        }
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 1,
        };
      });
    
      // Ordenar los datasets de menor a mayor según la suma de sus valores
      datasets.sort((a, b) => {
        const sumA = a.data.reduce((acc, val) => acc + val, 0);
        const sumB = b.data.reduce((acc, val) => acc + val, 0);
        return sumA - sumB; // Orden ascendente (menor a mayor)
      });
    
      return { labels, datasets };
    }
    if (component.chartType === "BubbleChart") {
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues.map((value, index) => ({
            x: index, // Eje X: índice del dato
            y: value, // Eje Y: valor del dato
            r: Math.abs(value) / 10, // Tamaño de la burbuja
          })),
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
        };
      });
    
      return { datasets };
    }
    if (component.chartType === "RadarChart") {
      const labels = [];
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        if (labels.length === 0) {
          labels.push(...timesArray.slice(-10).map((time) => time.toString()));
        }
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 1,
        };
      });
     
      return { labels, datasets };
    }
    if (component.chartType === "ScatterChart") {
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues.map((value, index) => ({
            x: index, // Eje X: índice del dato
            y: value, // Eje Y: valor del dato
          })),
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
        };
      });
    
      return { datasets };
    }
    if (component.chartType === "BarHistorico") {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedTimes = timesArray.slice(-10); // Últimos 10 tiempos
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        if (labels.length === 0) {
          labels = alignedTimes;
        }
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 2,
        };
      });
    
      return { labels, datasets };
    }
    if (component.chartType === "LineHistorico") {
      let labels = [];
      const datasets = component.variables.map((variable) => {
        const topic = variable.variable;
    
        const valueKey = variable.value;
        const topicData = mqttData[topic] || { time: [], values: {} };
    
        const timesArray = topicData.time || [];
        const valuesArray = topicData.values?.[valueKey] || [];
    
        const alignedTimes = timesArray.slice(-10); // Últimos 10 tiempos
        const alignedValues = Array.isArray(valuesArray) ? valuesArray.slice(-10) : [];
    
        if (labels.length === 0) {
          labels = alignedTimes;
        }
    
        return {
          label: valueKey || "Sin Nombre",
          data: alignedValues,
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
          borderWidth: 2,
          fill: false, // No rellenar el área bajo la línea
        };
      });
    
      // Si no hay datos, devolver un objeto vacío
      if (labels.length === 0 || datasets.length === 0) {
        return { labels: [], datasets: [] };
      }
    
      return { labels, datasets };
    }
    // Si no coincide con ningún tipo de gráfico, retornar datos vacíos
    return { labels: [], datasets: [] };
  };

  const renderComponent = (component, index) => {
    const colSize = columnSizeMap[component.colSize] || { xs: 12, sm: 12, md: 6, lg: 6 };
    const height = component.height || 300;
    const chartData = prepareChart(component);
  
    return (
      <Grid item {...colSize} key={index}>
        <Paper
          elevation={3}
          sx={{
            height: `${height + 70}px`,
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
            },
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              padding: { xs: '12px 16px', md: '16px 20px' },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '70%'
              }}
            >
              {component.componentName || "Componente sin nombre"}
            </Typography>
            <Box sx={{ display: 'flex', gap: '4px' }}>
              <IconButton
                size="small"
                onClick={() => handleEditComponent(index)}
                sx={{
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                  },
                  padding: { xs: '4px', md: '8px' }
                }}
              >
                <Edit fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteComponent(index)}
                sx={{
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                  },
                  padding: { xs: '4px', md: '8px' }
                }}
              >
                <Delete fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>
          </Box>
          
          {/* Chart Content */}
          <Box 
            sx={{
              padding: { xs: '12px', sm: '16px', md: '20px' },
              height: `calc(${height}px)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ width: "100%", height: "100%" }}>
              {component.chartType === "LineChart" && (
                <LineChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "BarChart" && (
                <BarChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "PieChart" && (
                <PieChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "DoughnutChart" && (
                <DoughnutChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "GaugeChart" && (
                <GaugeChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "ValueCard" && (
                <ValueCardComponent
                  variables={chartData}
                  title={component.componentName}
                />
              )}
              {component.chartType === "AreaChart" && (
                <AreaChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "MixedChart" && (
                <MixedChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "StackedBarChart" && (
                <StackedBarChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "BubbleChart" && (
                <BubbleChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "RadarChart" && (
                <RadarChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "ScatterChart" && (
                <ScatterChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "BarHistorico" && (
                <BarHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables}
                />
              )}
              {component.chartType === "LineHistorico" && (
                <LineHistorico
                  userId={userId}
                  title={component.componentName}
                  fetchHistoricalData={fetchHistoricalData}
                  variables={component.variables || []}
                />
              )}
            </Box>
          </Box>
        </Paper>
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

  // Content width based on sidebar state
  const contentWidth = isMobile 
    ? '100%' 
    : sidebarOpen 
      ? 'calc(100% - 250px)' 
      : '100%';
  
  const contentMarginLeft = isMobile 
    ? '0px' 
    : sidebarOpen 
      ? '250px' 
      : '0px';

  return (
    <div style={{ padding: "0px 8px" }}>
      <Grid container spacing={1} style={{ marginTop: "-8px" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "8px", marginLeft: contentMarginLeft, maxWidth: contentWidth, overflow: "hidden" }}>
          {/* Dashboard Header */}
          <Box 
            sx={{ 
              mb: 4, 
              textAlign: 'center',
              py: 2
            }}
          >
            <Typography 
              variant="h4" 
              className="dashboard-title"
              sx={{
                fontSize: '2rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              Configurar Panel de Control
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Personaliza tu panel añadiendo subdashboards y componentes para visualizar tus datos en tiempo real.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Paper 
            elevation={2} 
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 4,
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box 
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Button
                variant="contained"
                onClick={() => setSubdashboardModalOpen(true)}
                startIcon={<DashboardCustomize />}
                fullWidth={isMobile}
                sx={{
                  background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                    boxShadow: '0 4px 8px rgba(26, 35, 126, 0.3)',
                    transform: 'translateY(-2px)'
                  }
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
                  background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  boxShadow: '0 3px 5px 2px rgba(46, 125, 50, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #2e7d32 90%)',
                    boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)',
                    boxShadow: 'none'
                  }
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
                  background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  boxShadow: '0 3px 5px 2px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                    transform: 'translateY(-2px)'
                  }
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
              p: { xs: 2, sm: 3 },
              mb: 4,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{
                color: '#fff',
                mb: 2,
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              Subdashboards Disponibles
            </Typography>
            
            {subdashboards.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  color: 'rgba(255,255,255,0.7)',
                  py: 3
                }}
              >
                <Typography>
                  No hay subdashboards creados. Crea tu primer subdashboard para comenzar.
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                {subdashboards.map((subdashboard, index) => (
                  <Card
                    key={subdashboard.id}
                    onClick={() => setActiveSubdashboard(subdashboard)}
                    sx={{
                      background: activeSubdashboard?.id === subdashboard.id 
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                      backdropFilter: 'blur(12px)',
                      border: activeSubdashboard?.id === subdashboard.id 
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      minWidth: { xs: '100%', sm: '220px', md: '250px' },
                      maxWidth: { xs: '100%', sm: 'auto' },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        background: activeSubdashboard?.id === subdashboard.id 
                          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                          : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            mb: 1
                          }}
                        >
                          {subdashboard.name}
                        </Typography>
                        <Chip 
                          label={`${components.filter(comp => comp.subdashboardId === subdashboard.id).length} componentes`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            fontSize: '0.75rem',
                            '& .MuiChip-label': { fontWeight: 500 }
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubdashboard(index);
                          }}
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            },
                            padding: '6px'
                          }}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubdashboard(index);
                          }}
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            },
                            padding: '6px'
                          }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* Components Grid */}
          {activeSubdashboard ? (
            <Box sx={{ my: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: '#0f172a',
                  textAlign: 'center'
                }}
              >
                Componentes en "{activeSubdashboard.name}"
              </Typography>
              
              {filteredComponents.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    borderRadius: '16px',
                    border: '1px dashed #cbd5e1',
                    background: 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No hay componentes en este subdashboard.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setModalOpen(true)}
                    startIcon={<Add />}
                    sx={{ 
                      borderRadius: '8px',
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#047857',
                        background: 'rgba(16, 185, 129, 0.05)'
                      }
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
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                background: 'rgba(255, 255, 255, 0.5)',
                my: 4
              }}
            >
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Selecciona un subdashboard para ver sus componentes o crea uno nuevo.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setSubdashboardModalOpen(true)}
                startIcon={<DashboardCustomize />}
                sx={{ 
                  borderRadius: '8px',
                  borderColor: '#1a237e',
                  color: '#1a237e',
                  '&:hover': {
                    borderColor: '#283593',
                    background: 'rgba(26, 35, 126, 0.05)'
                  }
                }}
              >
                Crear primer subdashboard
              </Button>
            </Paper>
          )}

          {/* Modals and Snackbars */}
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
            autoHideDuration={5000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbarOpen(false)} 
              severity={snackbarSeverity} 
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </div>
      </Grid>
    </div>
  );
};

export default DashboardConfig;