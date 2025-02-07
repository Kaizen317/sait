import React, { useState, useEffect, useContext } from "react";
import { Grid, Typography, Card, CardContent, Button } from "@mui/material";
import LineChartComponent from "./LineChartComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
import DoughnutChartComponent from "./DoughnutChartComponent";
import GaugeChartComponent from "./GaugeChartComponent";
import ValueCardComponent from "./ValueCardComponent";
import AreaChartComponent from "./AreaChartComponent";
import MixedChartComponent from "./MixedChartComponent";
import BubbleChartComponent from "./BubbleChartComponent";
import RadarChartComponent from "./RadarChartComponent";
import ScatterChartComponent from "./ScatterChartComponent";
import StackedBarChartComponent from "./StackedBarChartComponent";
import Sidebar from "./Navbar";
import { MqttContext } from "./MqttContext";
import { motion } from "framer-motion";

const Dashboard1 = () => {
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const [components, setComponents] = useState([]);
  const [subdashboards, setSubdashboards] = useState([]);
  const [activeSubdashboard, setActiveSubdashboard] = useState(null);
  const userId = localStorage.getItem("userId");
  const subaccountId = localStorage.getItem("subaccountId");

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
    const fetchDashboardData = async () => {
      if (!userId || !subaccountId) {
        alert("El usuario no está logueado o no tiene una subcuenta asignada.");
        return;
      }

      try {
        const response = await fetch(
          `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los datos:", errorData);
          alert(`Error: ${errorData.error || "No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde."}`);
          return;
        }

        const data = await response.json();
        console.log("Payload recibido:", JSON.stringify(data, null, 2));

        const { dashboards } = data;

        // Filtrar subdashboards por subaccountId
        const subdashboardsFromDB = dashboards
          .filter((d) => d.subaccountId === subaccountId)
          .map((d) => ({
            id: d.subdashboardId,
            name: d.subdashboardName,
            color: d.subdashboardColor,
          }));

        // Filtrar componentes por subaccountId
        const componentsFromDB = dashboards
          .filter((d) => d.subaccountId === subaccountId)
          .flatMap((d) =>
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
        alert("Hubo un error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.");
      }
    };

    fetchDashboardData();
  }, [userId, subaccountId]);

  const prepareChart = (component) => {
    if (!component.variables || component.variables.length === 0) {
      return { labels: [], datasets: [] };
    }

    if (component.chartType === "PieChart" || component.chartType === "DoughnutChart") {
      const labels = [];
      const values = [];
      const colors = [];
      const borderColors = [];

      component.variables.forEach((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];

        if (topicData?.values && topicData.values[valueKey] !== undefined) {
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
          fill: component.chartType === "AreaChart",
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
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];

        if (topicData?.values && topicData.values[valueKey] !== undefined) {
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
      }).filter(Boolean);

      return variablesData;
    }

    if (component.chartType === "MixedChart") {
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

      datasets.sort((a, b) => {
        const sumA = a.data.reduce((acc, val) => acc + val, 0);
        const sumB = b.data.reduce((acc, val) => acc + val, 0);
        return sumA - sumB;
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
            x: index,
            y: value,
            r: Math.abs(value) / 10,
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
            x: index,
            y: value,
          })),
          backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
          borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
        };
      });

      return { datasets };
    }

    return { labels: [], datasets: [] };
  };

  const renderComponent = (component, index) => {
    const colSize = columnSizeMap[component.colSize] || 12;
    const height = component.height || "600px";
    const chartData = prepareChart(component);

    return (
      <Grid item xs={12} sm={colSize} md={colSize} lg={colSize} key={index}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            style={{
              padding: "20px",
              height: `${parseInt(height, 10) + 100}px`,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "100%",
              overflow: "visible",
              marginBottom: "20px"
            }}
          >
            <CardContent style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" style={{ textAlign: "center", marginBottom: "20px" }}>
                {component.componentName || "Componente sin nombre"}
              </Typography>
              <div style={{ 
                flex: 1,
                width: "100%", 
                minHeight: "calc(100% - 60px)",
                position: "relative",
                overflow: "visible"
              }}>
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
                  <ValueCardComponent variables={chartData} title={component.componentName} />
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
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

export default Dashboard1;