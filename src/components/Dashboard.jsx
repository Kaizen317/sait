import React, { useState, useEffect, useContext } from "react";
import { Button, Grid, Typography, IconButton, Card, CardContent, Snackbar } from "@mui/material";
import { Edit, Delete, Add, Save, DashboardCustomize } from "@mui/icons-material";
import LineChartComponent from "./LineChartComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
import DoughnutChartComponent from "./DoughnutChartComponent";
import GaugeChartComponent from "./GaugeChartComponent";
import ValueCardComponent from "./ValueCardComponent";
import AreaChartComponent from "./AreaChartComponent";
 import Sidebar from "./Navbar";
import { MqttContext } from "./MqttContext";
import MixedChartComponent from "./MixedChartComponent"; // Importación del nuevo componente
 import BubbleChartComponent from "./BubbleChartComponent";
import RadarChartComponent from "./RadarChartComponent";
import ScatterChartComponent from "./ScatterChartComponent";
import StackedBarChartComponent from "./StackedBarChartComponent";
import BarHistorico from "./BarHistorico";
import LineHistorico from "./LineHistorico";
  import { motion } from "framer-motion";

const Dashboard = () => {
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const [components, setComponents] = useState([]);
  const [subdashboards, setSubdashboards] = useState([]);
  const [activeSubdashboard, setActiveSubdashboard] = useState(null);
  const userId = localStorage.getItem("userId");
  const subaccountId = localStorage.getItem("subaccountId");
  const subdashboardId = localStorage.getItem("subdashboardId");
  // console.log("Subdashboard ID from localStorage:", subaccountId);
  const userType = localStorage.getItem("userType") || "root";
  const columnSizeMap = {
    col2: 2,
    col3: 3,
    col4: 4,
    col6: 6,
    col12: 12,
  };

  useEffect(() => {
    // console.log("Datos MQTT recibidos:", mqttData);
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
    const fetchDashboardData = async () => {
      if (!userId) {
        alert("El usuario no está logueado.");
        return;
      }
  
      try {
        const allowedSubdashboards = JSON.parse(localStorage.getItem("subdashboards")) || [];
        // console.log("Allowed Subdashboards:", allowedSubdashboards);
  
        let apiUrl;
        if (userType === "root") {
          apiUrl = `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}&userType=${userType}`;
        } else {
          apiUrl = `https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getsubdashboarid?userId=${userId}&allowedSubdashboards=${allowedSubdashboards.join(",")}&userType=${userType}`;
        }
  
        // console.log("URL de la API:", apiUrl);
        const response = await fetch(apiUrl);
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los datos:", errorData);
          alert(`Error: ${errorData.message || "No se pudieron cargar los datos."}`);
          return;
        }
  
        const data = await response.json();
        // console.log("Respuesta de la API:", data);
        // console.log("Dashboards recibidos:", data.dashboards);
  
        const { dashboards } = data;
  
        if (!dashboards || !Array.isArray(dashboards)) {
          console.error("Estructura de respuesta inesperada:", dashboards);
          return;
        }
  
        const filteredDashboards = dashboards;
  
        // console.log("Dashboards filtrados:", filteredDashboards);
  
        const subdashboardsFromDB = filteredDashboards.map((d) => ({
          id: d.subdashboardId,
          name: d.subdashboardName,
          color: d.subdashboardColor,
        }));
  
        const componentsFromDB = filteredDashboards.flatMap((d) =>
          d.components.map((comp) => ({
            ...comp,
            subdashboardId: d.subdashboardId,
          }))
        );
  
        // console.log("Subdashboards mapeados:", subdashboardsFromDB);
        // console.log("Componentes mapeados:", componentsFromDB);
  
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
  }, [userId, subaccountId, userType]);
  // Copia EXACTA de tu función en DashboardConfig:
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
            {/* Removed edit and delete icons */}
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
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", marginLeft: "250px", maxWidth: "calc(100% - 250px)", overflow: "hidden" }}>
        <Typography
          variant="h4"
          style={{ marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          Panel de Control
        </Typography>
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
          {subdashboards.map((subdashboard) => (
            <motion.div key={subdashboard.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            </motion.div>
          ))}
        </div>
        <Grid container spacing={4}>
          {components
            .filter((component) => component.subdashboardId === activeSubdashboard?.id)
            .map((component, index) => renderComponent(component, index))}
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;