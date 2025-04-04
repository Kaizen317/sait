import React, { useState, useEffect, useContext } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion"; // Importar motion desde framer-motion
import { alpha } from "@mui/system"; // Importar alpha desde @mui/system
import LineChartComponent from "./LineChartComponent";
import BarChartComponent from "./BarChartComponent";
import PieChartComponent from "./PieChartComponent";
import DoughnutChartComponent from "./DoughnutChartComponent";
import GaugeChartComponent from "./GaugeChartComponent";
import ValueCardComponent from "./ValueCardComponent";
import AreaChartComponent from "./AreaChartComponent";
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
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

// Paleta de colores profesional y sobria (tomada de DashboardConfig)
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

const Dashboard = () => {
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [components, setComponents] = useState([]);
  const [subdashboards, setSubdashboards] = useState([]);
  const [activeSubdashboard, setActiveSubdashboard] = useState(null);
  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType") || "root";
  const [isLoading, setIsLoading] = useState(true);

  // Estado para almacenar datos históricos
  const [historicalData, setHistoricalData] = useState({});
  // Estado para controlar la carga de datos históricos
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  // Estado para controlar componentes específicos en carga
  const [loadingComponents, setLoadingComponents] = useState({});

  const columnSizeMap = {
    col2: { xs: 12, sm: 6, md: 4, lg: 2 },
    col3: { xs: 12, sm: 6, md: 4, lg: 3 },
    col4: { xs: 12, sm: 6, md: 4 },
    col6: { xs: 12, sm: 6 },
    col12: { xs: 12 },
  };

  // Helper para obtener datos de un tópico: usa MQTT o los históricos si están disponibles
  const getTopicData = (variable) => {
    const topic = variable.variable;
    const parts = topic.split("/");
    const historicalKey = `${parts[3]}:${parts[parts.length - 1]}`;
    return mqttData[topic] || historicalData[historicalKey] || { time: [], values: {} };
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
    if (userId) {
      const storedHistorical = localStorage.getItem("mqttHistoricalData");
      if (storedHistorical) {
        setHistoricalData(JSON.parse(storedHistorical));
      } else if (components.length > 0) {
        // Extraer tópicos únicos a partir de los componentes
        const topicsSet = new Set();

        // Marcar todos los componentes como "cargando"
        const loadingState = {};
        components.forEach((comp) => {
          loadingState[comp.id] = true;
        });
        setLoadingComponents(loadingState);
        setIsLoadingHistorical(true);

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

              // Procesar datos históricos
              for (const [key, arr] of Object.entries(rawData)) {
                // 1. Ordenar por fecha ascendente
                arr.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                const times = [];
                const values = {};

                // 2. Recorrer en orden ascendente y llenar arrays
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

              // Marcar todos los componentes como "no cargando"
              const newLoadingState = {};
              components.forEach((comp) => {
                newLoadingState[comp.id] = false;
              });
              setLoadingComponents(newLoadingState);
              setIsLoadingHistorical(false);
            })
            .catch((err) => {
              // console.error("Error fetching historical data:", err);
              setIsLoadingHistorical(false);
              // Marcar todos los componentes como "no cargando" en caso de error
              const newLoadingState = {};
              components.forEach((comp) => {
                newLoadingState[comp.id] = false;
              });
              setLoadingComponents(newLoadingState);
            });
        } else {
          setIsLoadingHistorical(false);
        }
      }
    }
  }, [userId, components]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        // console.warn("El usuario no está logueado.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const allowedSubdashboards = JSON.parse(localStorage.getItem("subdashboards")) || [];
        let apiUrl;
        if (userType === "root") {
          apiUrl = `https://5kkoyuzfrf.execute-api.us-east-1.amazonaws.com/dashboard?userId=${userId}&userType=${userType}`;
        } else {
          apiUrl = `https://7yk7p0l3d9.execute-api.us-east-1.amazonaws.com/getsubdashboarid?userId=${userId}&allowedSubdashboards=${allowedSubdashboards.join(
            ","
          )}&userType=${userType}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          // console.error("Error al cargar los datos:", errorData);
          return;
        }

        const data = await response.json();
        const { dashboards } = data;

        if (!dashboards || !Array.isArray(dashboards)) {
          // console.error("Estructura de respuesta inesperada:", dashboards);
          return;
        }

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
        // console.error("Error en la solicitud:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, userType]);

  const fetchHistoricalData = async (userId, variables, filter, startDate, endDate) => {
    try {
      const variable = variables[0];
      const topicParts = variable.variable.split("/");
      const device_id = topicParts[3];
      const subtopic = topicParts[topicParts.length - 1];

      let calculatedStartDate = startDate;
      let calculatedEndDate = endDate;
      const now = new Date();

      if (!startDate || !endDate) {
        switch (filter) {
          case "1D":
            calculatedStartDate = new Date(now.setDate(now.getDate() - 1));
            calculatedEndDate = new Date();
            break;
          case "7D":
            calculatedStartDate = new Date(now.setDate(now.getDate() - 7));
            calculatedEndDate = new Date();
            break;
          case "30D":
            calculatedStartDate = new Date(now.setDate(now.getDate() - 30));
            calculatedEndDate = new Date();
            break;
          case "custom":
            throw new Error("Las fechas personalizadas (startDate y endDate) son requeridas para el filtro 'custom'.");
          default:
            throw new Error("Filtro no válido. Usa '1D', '7D', '30D' o 'custom'.");
        }
        calculatedStartDate = calculatedStartDate.toISOString();
        calculatedEndDate = calculatedEndDate.toISOString();
      }

      const queryParams = new URLSearchParams({
        userId,
        device_id,
        subtopic,
        filter,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
      });

      const url = `https://refiss445e.execute-api.us-east-1.amazonaws.com/filtromqtt?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos históricos.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // console.error("Error al obtener datos históricos:", error.message);
      return [];
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

        const numericValues = alignedValues.map((val) => parseFloat(val)).filter((val) => !isNaN(val));
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
        })
        .filter(Boolean);
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

    // Procesamiento específico para el FormulaComponent
    if (component.chartType === "FormulaComponent") {
      // Extraer los valores actuales de las variables para la fórmula
      const variableValues = {};

      component.variables.forEach((variable) => {
        const topic = variable.variable;
        const valueKey = variable.value;
        const topicData = mqttData[topic];

        if (topicData?.values && topicData.values[valueKey] !== undefined) {
          const lastValue = Array.isArray(topicData.values[valueKey])
            ? topicData.values[valueKey][topicData.values[valueKey].length - 1]
            : topicData.values[valueKey];

          if (lastValue !== undefined) {
            // Usamos el nombre de la variable como clave para el objeto de valores
            variableValues[variable.name || valueKey] = parseFloat(lastValue);
          }
        }
      });

      // Devolvemos los valores de las variables para que el FormulaComponent los use
      return variableValues;
    }

    if (
      component.chartType === "StackedBarChart" ||
      component.chartType === "BubbleChart" ||
      component.chartType === "RadarChart" ||
      component.chartType === "ScatterChart" ||
      component.chartType === "BarHistorico" ||
      component.chartType === "LineHistorico" ||
      component.chartType === "PieHistorico" ||
      component.chartType === "AreaHistorico" ||
      component.chartType === "StackedBarHistorico"
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
        if (component.chartType === "BubbleChart" || component.chartType === "ScatterChart") {
          return {
            label: valueKey || "Sin Nombre",
            data: alignedValues.map((value, index) => ({
              x: index,
              y: value,
              r: component.chartType === "BubbleChart" ? Math.abs(value) / 10 : undefined,
            })),
            backgroundColor: variable.backgroundColor || variable.color || "rgba(75,192,192,0.4)",
            borderColor: variable.borderColor || variable.color || "rgba(75,192,192,1)",
            borderWidth: 2,
          };
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
    return { labels: [], datasets: [] };
  };

  // Función para verificar si un componente tiene datos para mostrar
  const hasData = (component) => {
    if (!component.variables || component.variables.length === 0) return false;

    return component.variables.some((variable) => {
      const topicData = getTopicData(variable);
      const valueKey = variable.value;
      return (
        topicData?.values &&
        topicData.values[valueKey] !== undefined &&
        ((Array.isArray(topicData.values[valueKey]) && topicData.values[valueKey].length > 0) ||
          topicData.values[valueKey] !== null)
      );
    });
  };

  // Componente de carga con mensaje personalizado
  const LoadingComponent = ({ message = "Cargando datos..." }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "200px",
        p: 2,
      }}
    >
      <CircularProgress size={40} sx={{ mb: 2, color: themeColors.primary.main }} />
      <Typography variant="body2" color="textSecondary" align="center">
        {message}
      </Typography>
    </Box>
  );

  // Componente para mostrar cuando no hay datos
  const NoDataComponent = ({ message = "No hay datos disponibles" }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        minHeight: "200px",
        p: 2,
      }}
    >
      <Typography variant="body2" color="textSecondary" align="center">
        {message}
      </Typography>
    </Box>
  );

  const renderComponent = (component, index) => {
    // Si el componente está cargando, mostrar indicador de carga
    if (isLoadingHistorical || loadingComponents[component.id]) {
      return <LoadingComponent message="Cargando datos históricos..." />;
    }

    // Verificar si hay datos para mostrar
    const dataAvailable = hasData(component);
    if (!dataAvailable) {
      return <NoDataComponent message="No hay datos disponibles para mostrar" />;
    }

    const colSize = columnSizeMap[component.colSize] || { xs: 12, sm: 6, md: 6, lg: 6 };
    const height = component.height || 300;
    const chartData = prepareChart(component);

    return (
      <Grid item {...colSize} key={index} sx={{ marginBottom: "16px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            elevation={3}
            sx={{
              p: 2,
              background: themeColors.background.paper,
              border: `1px solid ${alpha(themeColors.primary.main, 0.1)}`,
              borderRadius: "15px",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
              },
              height: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                background: "#006875",
                color: "white",
                padding: { xs: "8px 12px", md: "10px 14px" },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                margin: "-16px -16px 16px -16px",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  fontWeight: 500,
                  color: "#fff",
                }}
              >
                {component.componentName || "Componente sin nombre"}
              </Typography>
            </Box>
            <CardContent
              sx={{
                padding: { xs: "12px", sm: "14px", md: "16px" },
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
                    variables={component.variables}
                    height={height}
                  />
                )}
                {component.chartType === "AreaHistorico" && (
                  <AreaHistorico
                    userId={userId}
                    title={component.componentName}
                    fetchHistoricalData={fetchHistoricalData}
                    variables={component.variables}
                    height={height}
                  />
                )}
                {component.chartType === "StackedBarHistorico" && (
                  <StackedBarHistorico
                    userId={userId}
                    title={component.componentName}
                    fetchHistoricalData={fetchHistoricalData}
                    variables={component.variables}
                    height={height}
                  />
                )}
                {component.chartType === "FormulaComponent" && (
                  <FormulaComponent
                    componentData={component}
                    userId={userId}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  };

  const filteredComponents = components.filter(
    (component) => component.subdashboardId === activeSubdashboard?.id
  );

  // Ajuste del ancho del contenido según el sidebar
  const contentWidth = isMobile ? "100%" : "calc(100% - 250px)";
  const contentMarginLeft = isMobile ? "0px" : "250px";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: themeColors.background.default,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Grid container spacing={isMobile ? 1 : 1.5}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: { xs: "12px", sm: "16px", md: "20px" },
            marginLeft: contentMarginLeft,
            maxWidth: contentWidth,
            transition: "all 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          {/* Dashboard Header */}
          <Box sx={{ mb: 2, textAlign: "center", py: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                fontWeight: 700,
                color: themeColors.text.primary,
                mb: { xs: 1, sm: 1.5 },
              }}
            >
              Panel de Control
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: themeColors.text.secondary,
                maxWidth: "600px",
                mx: "auto",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                lineHeight: 1.4,
              }}
            >
              Visualización de tus datos en tiempo real.
            </Typography>
          </Box>

          {/* Subdashboards Section */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 2,
              borderRadius: "12px",
              background: themeColors.background.paper,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: themeColors.primary.main,
                mb: 2,
                textAlign: "center",
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Subdashboards Disponibles
            </Typography>
            {subdashboards.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  color: themeColors.text.secondary,
                  py: 2,
                  px: 1,
                  background: alpha(themeColors.primary.main, 0.05),
                  borderRadius: "8px",
                }}
              >
                <Typography sx={{ mb: 1, fontSize: "0.95rem", fontWeight: 500 }}>
                  No hay subdashboards creados.
                </Typography>
              </Box>
            ) : (
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
                      {/* Encabezado sin iconos de edición/eliminación */}
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
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
                            textAlign: "center"
                          }}
                        >
                          {subdashboard.name}
                        </Typography>
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
            )}
          </Paper>

          {/* Components Grid */}
          {activeSubdashboard ? (
            <Box sx={{ my: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: themeColors.text.primary,
                    fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                  }}
                >
                  Componentes en "{activeSubdashboard.name}"
                </Typography>
                <Chip
                  label={`${filteredComponents.length} componentes`}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    px: 0.5,
                    background: themeColors.primary.main,
                    "& .MuiChip-label": { px: 0.5 },
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              </Box>
              {filteredComponents.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: "8px",
                    border: `1px dashed ${alpha(themeColors.primary.main, 0.3)}`,
                    background: alpha(themeColors.background.paper, 0.7),
                  }}
                >
                  <Typography color={themeColors.text.secondary} sx={{ mb: 1, fontSize: "0.95rem" }}>
                    No hay componentes en este subdashboard.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={isMobile ? 1 : 1.5}>
                  {filteredComponents.map((component, index) => renderComponent(component, index))}
                </Grid>
              )}
            </Box>
          ) : (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: "8px",
                border: `1px dashed ${alpha(themeColors.primary.main, 0.3)}`,
                background: themeColors.background.paper,
                my: 2,
              }}
            >
              <Typography
                color={themeColors.text.secondary}
                sx={{
                  mb: 2,
                  fontSize: "0.95rem",
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                Selecciona un subdashboard para visualizar sus componentes.
              </Typography>
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
                  padding: 3,
                  borderRadius: "8px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                  maxWidth: "300px",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: themeColors.primary.main, fontSize: "1.1rem" }}>
                  Cargando datos...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  Espere mientras configuramos su panel.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard;