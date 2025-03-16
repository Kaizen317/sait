import React, { useState, useEffect, useContext } from "react";
import { Button, Grid, Typography, IconButton, Card, CardContent, Snackbar } from "@mui/material";
import { Edit, Delete, Add, Save, DashboardCustomize } from "@mui/icons-material";
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
import MixedChartComponent from "./MixedChartComponent"; // Importación del nuevo componente
 import BubbleChartComponent from "./BubbleChartComponent";
import RadarChartComponent from "./RadarChartComponent";
import ScatterChartComponent from "./ScatterChartComponent";
import StackedBarChartComponent from "./StackedBarChartComponent";
import BarHistorico from "./BarHistorico";
import LineHistorico from "./LineHistorico";
 import "chartjs-adapter-date-fns";
const DashboardConfig = () => {
  const { mqttData, subscribeToTopic, userId } = useContext(MqttContext);

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
  console.log("User ID from MqttContext:", userId);

  const columnSizeMap = {
    col2: 2,
    col3: 3,
    col4: 4,
    col6: 6,
    col12: 12,
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
    const fetchDashboardData = async () => {
      if (!userId) {
        //alert("El usuario no está logueado.");
        return;
      }

      try {
        const response = await fetch(
          `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los datos:", errorData);
          alert(`Error: ${errorData.error || "No se pudieron cargar los datos."}`);
          return;
        }

        const data = await response.json();
       /* console.log("Payload recibido:", JSON.stringify(data, null, 2));
        console.log("Payload Details:", {
          totalDashboards: data.dashboards.length,
          dashboardInfo: data.dashboards.map(d => ({
            id: d.subdashboardId,
            name: d.subdashboardName,
            color: d.subdashboardColor,
            totalComponents: d.components.length,
            componentTypes: [...new Set(d.components.map(c => c.chartType))],
            componentNames: d.components.map(c => c.componentName),
            variableTypes: [...new Set(d.components.flatMap(c => c.variables.map(v => v.value)))],
          }))
        });*/

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
      } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un error al conectar con el servidor.");
      }
    };

    fetchDashboardData();
  }, [userId]);

  const handleAddComponent = (newComponent) => {
    if (!activeSubdashboard) {
      alert("Por favor, selecciona un subdashboard antes de agregar un componente.");
      return;
    }

    newComponent.subdashboardId = activeSubdashboard.id;

    if (editingIndex !== null) {
      const updatedComponents = [...components];
      updatedComponents[editingIndex] = newComponent;
      setComponents(updatedComponents);
    } else {
      setComponents([...components, newComponent]);
    }

    setModalOpen(false);
    setEditingIndex(null); // Resetear el índice de edición
  };

  const handleEditComponent = (index) => {
    if (!activeSubdashboard) {
      alert("Por favor, selecciona un subdashboard antes de editar un componente.");
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
      alert("Error: Este componente no puede eliminarse porque no tiene un identificador válido.");
      return;
    }
  
    // Agregar a la cola de eliminación
    setDeletionQueue((prev) => [
      ...prev,
      { type: "component", id: deletedComponent.subdashboardId },
    ]);
  
    // Eliminar el componente del estado
    setComponents((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  const handleDeleteSubdashboard = (index) => {
    const deletedSubdashboard = subdashboards[index];

    if (!deletedSubdashboard?.id) {
      console.error("El subdashboard no tiene un ID válido para eliminar:", deletedSubdashboard);
      alert("Error: Este subdashboard no puede eliminarse porque no tiene un identificador válido.");
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
    } else {
      const newSubdashboard = { id: Date.now(), ...subdashboard };
      setSubdashboards((prev) => [...prev, newSubdashboard]);
      setActiveSubdashboard(newSubdashboard);
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
      alert("El usuario no está logueado.");
      return;
    }

    if (!subdashboards.length && !deletionQueue.length) {
      alert("No hay subdashboards creados ni eliminaciones pendientes para guardar.");
      return;
    }

    try {
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
          alert(`Error al eliminar: ${errorData.error || "No se pudo eliminar el elemento."}`);
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
        alert(`Error: ${errorData.error || "No se pudo guardar el panel de control."}`);
        return;
      }

      setSnackbarMessage("Panel de control guardado exitosamente.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Hubo un error al conectar con el servidor.");
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
    const colSize = columnSizeMap[component.colSize] || 12;
    const height = component.height || "300px";
    const chartData = prepareChart(component);
  
    return (
      <Grid item xs={12} sm={colSize} md={colSize} lg={colSize} key={index}>
        <Card
          style={{
            padding: "20px",
            height: `${parseInt(height, 10) + 50}px`,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              padding: "8px",
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              zIndex: 1,
            }}
          >
            <Typography variant="h6">
              {component.componentName || "Componente sin nombre"}
            </Typography>
            <div style={{ display: "flex", gap: "5px" }}>
              <IconButton
                color="primary"
                size="small"
                style={{ padding: "4px" }}
                onClick={() => handleEditComponent(index)}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
  color="error"
  size="small"
  style={{ padding: "4px" }}
  onClick={() => handleDeleteComponent(index)} // Pasar el índice correcto
>
  <Delete fontSize="small" />
</IconButton>
            </div>
          </div>
          <CardContent style={{ marginTop: "40px" }}>
            <div style={{ width: "100%", height: height, overflow: "hidden" }}>
              {component.chartType === "LineChart" && (
                <LineChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "BarChart" && (
                <BarChartComponent data={chartData} title={component.componentName} />
              )}
              {component.chartType === "PieChart" && ( // Nuevo caso para PieChart
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
                variables={chartData} // Pasar todas las variables
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
    variables={component.variables} // Pasar el arreglo de variables
  />
)}
{component.chartType === "LineHistorico" && (
  <LineHistorico
    userId={userId}
    title={component.componentName}
    fetchHistoricalData={fetchHistoricalData}
    variables={component.variables || []} // Pasar el arreglo de variables (o un array vacío si no está definido)
  />
)}
             </div>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIndex(null); // Resetear el índice de edición
  };

  const filteredComponents = components.filter(
    (component) => component.subdashboardId === activeSubdashboard?.id
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", marginLeft: "250px", maxWidth: "calc(100% - 250px)", overflow: "hidden" }}>
        <Typography
          variant="h4"
          style={{ marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          Configurar el panel de control
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!activeSubdashboard) {
                alert("Por favor, selecciona un subdashboard antes de agregar un componente.");
                return;
              }
              setModalOpen(true);
              setEditingIndex(null);
            }}
            startIcon={<Add />}
            disabled={!activeSubdashboard}
            style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
          >
            Agregar Componente
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#9C27B0", color: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
            onClick={() => setSubdashboardModalOpen(true)}
            startIcon={<DashboardCustomize />}
          >
            Añadir Navegación
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#4CAF50", color: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}
            onClick={handleSaveDashboard}
            startIcon={<Save />}
          >
            Guardar Panel de Control
          </Button>
        </div>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {activeSubdashboard ? (
            <Typography variant="h6" style={{ color: activeSubdashboard.color, fontWeight: "bold" }}>
              Subdashboard activo: {activeSubdashboard.name}
            </Typography>
          ) : (
            <Typography variant="h6" style={{ color: "#888" }}>
              Selecciona un subdashboard para comenzar
            </Typography>
          )}
        </div>
        <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {subdashboards.map((subdashboard, index) => (
            <div key={subdashboard.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button
                variant="contained"
                style={{
                  backgroundColor: subdashboard.color,
                  color: "white",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => setActiveSubdashboard(subdashboard)}
              >
                {subdashboard.name}
              </Button>
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleEditSubdashboard(index)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="secondary"
                size="small"
                onClick={() => handleDeleteSubdashboard(index)}
              >
                <Delete />
              </IconButton>
            </div>
          ))}
        </div>
        <Grid container spacing={4}> 
          {filteredComponents.map((component, index) => renderComponent(component, index))}
        </Grid>
        <ChartConfigModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleAddComponent}
          initialData={editingIndex !== null ? components[editingIndex] : null}
        />
        <AddSubdashboardModal
          open={subdashboardModalOpen}
          onClose={() => setSubdashboardModalOpen(false)}
          onSave={handleAddSubdashboard}
          initialData={editingSubdashboardIndex !== null ? subdashboards[editingSubdashboardIndex] : null}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </div>
    </div>
  );
};

export default DashboardConfig;