import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  Fade,
  Backdrop,
  Avatar,
  Card,
  CardContent,
  Zoom,
  Slide,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import PieChartIcon from "@mui/icons-material/PieChart";
import SpeedIcon from "@mui/icons-material/Speed";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaletteIcon from "@mui/icons-material/Palette";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";
import FunctionsIcon from "@mui/icons-material/Functions";
import CalculateIcon from "@mui/icons-material/Calculate";

// Initial states
const initialVariableState = {
  variable: "",
  value: "",
  color: "#6366f1",
  backgroundColor: "rgba(99, 102, 241, 0.7)",
  borderColor: "#6366f1",
  type: "bar", // Campo para especificar el tipo (bar o line) en gráficos mixtos
};

const initialState = {
  chartType: "LineChart",
  componentName: "",
  variables: [initialVariableState],
  colSize: "col12",
  height: 375,
  formula: "", // Para el componente de fórmula
  formulaDisplayType: "number", // Tipo de visualización para la fórmula
  formulaMin: 0, // Valor mínimo para medidores
  formulaMax: 100, // Valor máximo para medidores
  formulaUnit: "", // Unidad para mostrar (%, °C, etc.)
};

const ChartConfigModal = ({ open, onClose, onSave, initialData, userId: propUserId }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  
  // Restaurar la obtención del userId
  const userId = propUserId || localStorage.getItem("userId");
  
  const [formState, setFormState] = useState(initialData || initialState);
  const [availableTopics, setAvailableTopics] = useState([]);
  
  // Cambiar a un objeto que almacena valores por topic
  const [topicValuesMap, setTopicValuesMap] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTip, setShowTip] = useState(false);

  // Enhanced color palette with gradients
  const chartColors = [
    { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1, #4f46e5)" },
    { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
    { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6, #0d9488)" },
    { color: "#f97316", gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
    { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  ];

  const chartTips = [
    "Gráficas de Línea: Perfectas para tendencias temporales.",
    "Barras Apiladas: Muestra cómo se descompone un total.",
    "Torta: Ideal para proporciones simples y claras.",
    "Medidor: Visualiza metas o KPIs con estilo.",
    "Tarjetas: Resalta valores clave al instante.",
    "Mixto: Combina métricas para análisis avanzados.",
  ];

  useEffect(() => {
    if (open) {
      // Inicializar el estado del formulario con los datos iniciales o el estado inicial
      setFormState(initialData || initialState);
      
      // Cargar los topics disponibles
      fetchTopics();
      
      // Inicializar el mapa de valores si hay datos iniciales
      if (initialData && initialData.variables && initialData.variables.length > 0) {
        // Para cada variable en los datos iniciales, cargar sus valores
        initialData.variables.forEach(variable => {
          if (variable.variable) {
            console.log(`Cargando valores iniciales para topic: ${variable.variable}`);
            fetchValuesForTopic(variable.variable);
          }
        });
      }
      
      const timer = setTimeout(() => setShowTip(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowTip(false);
      setActiveStep(0);
      // Limpiar el mapa de valores al cerrar
      setTopicValuesMap({});
    }
  }, [open, initialData, userId]);

  const fetchTopics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://uown6aglg5.execute-api.us-east-1.amazonaws.com/getmqttmessages?userId=${userId}`
      );
      const topics = [...new Set(response.data.map((record) => record.topic))];
      setAvailableTopics(topics);
    } catch (error) {
      setError("Error al cargar los topics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchValuesForTopic = async (topic) => {
    if (!topic) {
      console.log("No se puede cargar valores para un topic vacío");
      return;
    }
    
    console.log(`Iniciando carga de valores para topic: ${topic}`);
    setLoading(true);
    
    try {
      const response = await axios.get(
        `https://uown6aglg5.execute-api.us-east-1.amazonaws.com/getmqttmessages?userId=${userId}`
      );
      
      console.log(`Respuesta recibida para userId: ${userId}, total de registros: ${response.data.length}`);
      
      const recordsForTopic = response.data.filter((record) => record.topic === topic);
      console.log(`Registros encontrados para topic ${topic}: ${recordsForTopic.length}`);
      
      // Verificar si hay registros para este topic
      if (recordsForTopic.length > 0) {
        // Combinar todas las variables de todos los mensajes para este topic
        const allValues = new Set();
        
        // Recorrer todos los registros para este topic y recopilar todas las variables
        recordsForTopic.forEach(record => {
          if (record?.values) {
            Object.keys(record.values).forEach(key => {
              allValues.add(key);
            });
          }
        });
        
        // Convertir el Set a un array y ordenarlo alfabéticamente
        const values = Array.from(allValues).sort((a, b) => a.localeCompare(b));
        console.log(`Valores combinados y ordenados para ${topic}:`, values);
        
        // Actualizar el mapa de valores por topic
        setTopicValuesMap(prevMap => {
          const newMap = {
            ...prevMap,
            [topic]: values
          };
          console.log("Mapa de valores actualizado:", newMap);
          return newMap;
        });
      } else {
        console.log(`No se encontraron registros para el topic: ${topic}`);
        setTopicValuesMap(prevMap => ({
          ...prevMap,
          [topic]: []
        }));
      }
    } catch (error) {
      console.error("Error al cargar los valores:", error);
      setError(`Error al cargar los valores para ${topic}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariableChange = (index, field, value) => {
    const updatedVariables = formState.variables.map((variable, i) => {
      if (i === index) {
        const updatedVariable = { ...variable, [field]: value };
        
        // Si se cambia el topic, resetear el valor seleccionado
        if (field === "variable") {
          updatedVariable.value = "";
        }
        
        // Actualizar color y colores derivados si se cambia el color
        if (field === "color") {
          const rgbaColor = hexToRgba(value, 0.7);
          updatedVariable.backgroundColor = rgbaColor;
          updatedVariable.borderColor = value;
        }
        
        return updatedVariable;
      }
      return variable;
    });
    
    setFormState((prev) => ({ ...prev, variables: updatedVariables }));
    
    // Si se cambió el topic, cargar los valores disponibles para ese topic
    if (field === "variable" && value) {
      console.log(`Cargando valores para el topic: ${value}`);
      fetchValuesForTopic(value);
    }
  };

  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleAddVariable = () => {
    const colorIndex = formState.variables.length % chartColors.length;
    const newColor = chartColors[colorIndex].color;
    setFormState((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        { ...initialVariableState, color: newColor, backgroundColor: hexToRgba(newColor, 0.7), borderColor: newColor },
      ],
    }));
  };

  const handleRemoveVariable = (index) => {
    setFormState((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // Asegurarse de que se incluyan todos los campos específicos para el componente de fórmula
    if (formState.chartType === "FormulaComponent") {
      // Validar que haya una fórmula
      if (!formState.formula) {
        setError("Por favor, ingresa una fórmula válida.");
        return;
      }
      
      // Asegurarse de que los valores mínimo y máximo estén definidos para el tipo gauge
      if (formState.formulaDisplayType === "gauge") {
        if (formState.formulaMin === undefined || formState.formulaMax === undefined) {
          setError("Para el tipo de visualización 'Medidor', debes definir los valores mínimo y máximo.");
          return;
        }
      }
    }
    
    onSave(formState);
    setFormState(initialState);
  };

  const nextStep = () => setActiveStep((prev) => prev + 1);
  const prevStep = () => setActiveStep((prev) => prev - 1);

  const chartTypes = [
    { value: "LineChart", label: "Línea", icon: <TimelineIcon />, color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1, #4f46e5)", description: "Tendencias temporales" },
    { value: "AreaChart", label: "Área", icon: <TimelineIcon />, color: "#22c55e", gradient: "linear-gradient(135deg, #22c55e, #16a34a)", description: "Tendencias con áreas" },
    { value: "BarChart", label: "Barras", icon: <BarChartIcon />, color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6, #0d9488)", description: "Comparación de categorías" },
    { value: "PieChart", label: "Torta", icon: <PieChartIcon />, color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #db2777)", description: "Distribución proporcional" },
    { value: "StackedBarChart", label: "Barras Apiladas", icon: <BarChartIcon />, color: "#f97316", gradient: "linear-gradient(135deg, #f97316, #ea580c)", description: "Componentes apilados" },
    { value: "GaugeChart", label: "Medidor", icon: <SpeedIcon />, color: "#eab308", gradient: "linear-gradient(135deg, #eab308, #ca8a04)", description: "Progreso hacia un objetivo" },
    { value: "ValueCard", label: "Tarjeta", icon: <ViewModuleIcon />, color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #059669)", description: "Valores clave" },
    { value: "MixedChart", label: "Mixto", icon: <BarChartIcon />, color: "#f43f5e", gradient: "linear-gradient(135deg, #f43f5e, #e11d48)", description: "Barras y líneas combinadas" },
    { value: "BarHistorico", label: "Barras Histórico", icon: <BarChartIcon />, color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)", description: "Historial en barras" },
    { value: "LineHistorico", label: "Línea Histórico", icon: <TimelineIcon />, color: "#a855f7", gradient: "linear-gradient(135deg, #a855f7, #9333ea)", description: "Historial en líneas" },
    { value: "PieHistorico", label: "Torta Histórico", icon: <PieChartIcon />, color: "#d946ef", gradient: "linear-gradient(135deg, #d946ef, #c026d3)", description: "Historial en gráfico de torta" },
    { value: "AreaHistorico", label: "Área Histórico", icon: <TimelineIcon />, color: "#0ea5e9", gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)", description: "Historial con áreas" },
    { value: "StackedBarHistorico", label: "Barras Apiladas Histórico", icon: <BarChartIcon />, color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", description: "Historial en barras apiladas" },
    { value: "FormulaComponent", label: "Fórmula", icon: <FunctionsIcon />, color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", description: "Cálculos personalizados" },
  ];

  const columnSizes = [
    { value: "col2", label: "col2" },
    { value: "col3", label: "col3" },
    { value: "col4", label: "col4" },
    { value: "col6", label: "col6" },
    { value: "col12", label: "col12" },
  ];

  // Opciones para el tipo de representación (bar o line) en MixedChart
  const mixedChartTypes = [
    { value: "bar", label: "Barras", icon: <BarChartIcon /> },
    { value: "line", label: "Línea", icon: <TimelineIcon /> },
  ];

  // Operadores matemáticos para el componente de fórmula
  const mathOperators = [
    { value: "+", label: "Suma", description: "Suma dos valores" },
    { value: "-", label: "Resta", description: "Resta dos valores" },
    { value: "*", label: "Multiplicación", description: "Multiplica dos valores" },
    { value: "/", label: "División", description: "Divide dos valores" },
    { value: "^", label: "Potencia", description: "Eleva un valor a una potencia" },
    { value: "(", label: "Paréntesis Izquierdo", description: "Agrupa operaciones" },
    { value: ")", label: "Paréntesis Derecho", description: "Cierra agrupación" },
  ];

  // Opciones de visualización para el componente de fórmula
  const formulaDisplayOptions = [
    { value: "number", label: "Número", icon: <CalculateIcon />, description: "Muestra solo el valor numérico" },
    { value: "gauge", label: "Medidor", icon: <SpeedIcon />, description: "Visualiza como medidor" },
    { value: "card", label: "Tarjeta", icon: <ViewModuleIcon />, description: "Muestra en una tarjeta destacada" },
  ];

  const steps = [
    {
      title: "Elige tu Gráfico",
      icon: <DashboardIcon />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
            Selecciona un tipo de gráfico
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 4 }}>
            Escoge la visualización que mejor represente tus datos.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVariable}
              sx={{
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
                borderRadius: 3,
                px: 3,
                py: 1.5,
                textTransform: "none",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
              }}
            >
              Nueva Variable
            </Button>
          </Box>

          {showTip && (
            <Slide direction="up" in={showTip}>
              <Paper
                sx={{
                  p: 2,
                  mb: 4,
                  borderRadius: 3,
                  bgcolor: "rgba(254, 243, 199, 0.8)",
                  border: "1px solid #fcd34d",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Avatar sx={{ bgcolor: "#fbbf24", color: "white" }}>
                  <LightbulbIcon />
                </Avatar>
                <Typography variant="body2" sx={{ color: "#92400e" }}>
                  {chartTips[Math.floor(Math.random() * chartTips.length)]}
                </Typography>
                <IconButton size="small" onClick={() => setShowTip(false)} sx={{ ml: "auto", color: "#92400e" }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Slide>
          )}

          <Grid container spacing={2}>
            {chartTypes.map((type, index) => (
              <Grid item xs={6} sm={4} md={3} key={type.value}>
                <Zoom in timeout={index * 100}>
                  <Card
                    onClick={() => handleInputChange({ target: { name: "chartType", value: type.value } })}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 4,
                      background: formState.chartType === type.value ? type.gradient : "white",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 12px 30px ${alpha(type.color, 0.3)}`,
                      },
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {formState.chartType === type.value && (
                      <CheckCircleIcon sx={{ position: "absolute", top: 8, right: 8, color: "white" }} />
                    )}
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: formState.chartType === type.value ? "white" : type.color,
                          color: formState.chartType === type.value ? type.color : "white",
                          mb: 2,
                          width: 50,
                          height: 50,
                          mx: "auto",
                        }}
                      >
                        {type.icon}
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: formState.chartType === type.value ? "white" : "#1f2937" }}
                      >
                        {type.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: formState.chartType === type.value ? "rgba(255, 255, 255, 0.9)" : "#6b7280" }}
                      >
                        {type.description}
                      </Typography>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>
      ),
    },
    {
      title: "Detalles Básicos",
      icon: <SettingsIcon />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
            Configura los detalles
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 4 }}>
            Define el nombre, tamaño y altura de tu visualización.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Gráfico"
                name="componentName"
                value={formState.componentName}
                onChange={handleInputChange}
                placeholder="Ej: Temperatura del Ambiente"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "white",
                    "&:hover fieldset": { borderColor: "#6366f1" },
                    "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#6366f1" },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#4b5563", mb: 1 }}>
                Tamaño en pantalla
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {columnSizes.map((size, index) => (
                  <Zoom in timeout={index * 100} key={size.value}>
                    <Chip
                      label={size.label}
                      onClick={() => handleInputChange({ target: { name: "colSize", value: size.value } })}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        bgcolor: formState.colSize === size.value ? "#6366f1" : "#f3f4f6",
                        color: formState.colSize === size.value ? "white" : "#4b5563",
                        "&:hover": {
                          bgcolor: formState.colSize === size.value ? "#4f46e5" : "#e5e7eb",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.3s",
                        px: 2,
                        py: 2.5,
                      }}
                    />
                  </Zoom>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#4b5563", mb: 1 }}>
                Altura del gráfico
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  name="height"
                  value={formState.height}
                  onChange={handleInputChange}
                  inputProps={{ min: 200, step: 25 }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "white",
                      "&:hover fieldset": { borderColor: "#6366f1" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: 2 },
                    },
                  }}
                  InputProps={{ endAdornment: <Typography sx={{ color: "#6b7280" }}>px</Typography> }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[300, 375, 450].map((height) => (
                    <Chip
                      key={height}
                      label={`${height}px`}
                      onClick={() => handleInputChange({ target: { name: "height", value: height } })}
                      sx={{
                        borderRadius: 2,
                        bgcolor: formState.height === height ? "#6366f1" : "#f3f4f6",
                        color: formState.height === height ? "white" : "#4b5563",
                        "&:hover": { bgcolor: formState.height === height ? "#4f46e5" : "#e5e7eb" },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4b5563", mb: 2 }}>
              Vista previa
            </Typography>
            <Zoom in>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: alpha("#6366f1", 0.05),
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Avatar sx={{ bgcolor: "#6366f1", color: "white", width: 60, height: 60, mb: 2, mx: "auto" }}>
                    {chartTypes.find((type) => type.value === formState.chartType)?.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ color: "#6366f1", fontWeight: 600 }}>
                    {chartTypes.find((type) => type.value === formState.chartType)?.label || "Selecciona un tipo"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {formState.componentName || "Sin nombre aún"}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Box>
        </Box>
      ),
    },
    {
      title: "Variables y Datos",
      icon: <PaletteIcon />,
      content: (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mb: 1 }}>
            Configura tus variables
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 4 }}>
            Selecciona los datos que deseas visualizar.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVariable}
              sx={{
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
                borderRadius: 3,
                px: 3,
                py: 1.5,
                textTransform: "none",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
              }}
            >
              Nueva Variable
            </Button>
          </Box>

          {formState.variables.map((variable, index) => (
            <Slide direction="right" in key={index} timeout={index * 150}>
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  bgcolor: "white",
                  borderLeft: `6px solid ${variable.color}`,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s",
                  "&:hover": { boxShadow: `0 12px 35px ${alpha(variable.color, 0.2)}`, transform: "translateY(-5px)" },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={formState.chartType === "MixedChart" ? 4 : 5}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ "&.Mui-focused": { color: variable.color } }}>Topic</InputLabel>
                      <Select
                        value={variable.variable || ""}
                        onChange={(e) => handleVariableChange(index, "variable", e.target.value)}
                        sx={{
                          borderRadius: 3,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: variable.color, borderWidth: 2 },
                        }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Selecciona un topic</em>
                        </MenuItem>
                        {availableTopics.map((topic) => (
                          <MenuItem key={topic} value={topic}>
                            {topic}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={formState.chartType === "MixedChart" ? 3 : 4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ "&.Mui-focused": { color: variable.color } }}>Valor</InputLabel>
                      <Select
                        value={variable.value || ""}
                        onChange={(e) => handleVariableChange(index, "value", e.target.value)}
                        disabled={!variable.variable}
                        sx={{
                          borderRadius: 3,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: variable.color, borderWidth: 2 },
                        }}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Selecciona un valor</em>
                        </MenuItem>
                        {/* Usar los valores del topic específico del mapa */}
                        {variable.variable && topicValuesMap[variable.variable] && 
                          topicValuesMap[variable.variable].map((value) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                  {formState.chartType === "MixedChart" && (
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ "&.Mui-focused": { color: variable.color } }}>Tipo</InputLabel>
                        <Select
                          value={variable.type}
                          onChange={(e) => handleVariableChange(index, "type", e.target.value)}
                          sx={{
                            borderRadius: 3,
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: variable.color, borderWidth: 2 },
                          }}
                        >
                          {mixedChartTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {type.icon}
                                <Typography>{type.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={6} md={2}>
                    <TextField
                      type="color"
                      value={variable.color}
                      onChange={(e) => handleVariableChange(index, "color", e.target.value)}
                      sx={{ 
                        width: "100%",
                        "& .MuiOutlinedInput-root": { 
                          border: "none" 
                        },
                        "& .MuiOutlinedInput-input": {
                          padding: "10px",
                          height: "40px",
                          cursor: "pointer"
                        },
                        "& .MuiOutlinedInput-notchedOutline": { 
                          border: "none" 
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <Tooltip title={formState.variables.length === 1 ? "Mínimo una variable" : "Eliminar"}>
                      <IconButton
                        onClick={() => handleRemoveVariable(index)}
                        disabled={formState.variables.length === 1}
                        sx={{
                          bgcolor: "#ef4444",
                          color: "white",
                          "&:hover": { bgcolor: "#dc2626", transform: "rotate(90deg)" },
                          transition: "all 0.3s",
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            </Slide>
          ))}

          {/* Sección específica para el componente de fórmula */}
          {formState.chartType === "FormulaComponent" && (
            <Fade in timeout={500}>
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  bgcolor: alpha("#8b5cf6", 0.05),
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4b5563", mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FunctionsIcon sx={{ mr: 1, color: "#8b5cf6" }} />
                  Editor de Fórmula
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
                    Construye tu fórmula utilizando las variables seleccionadas y operadores matemáticos
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Fórmula"
                    name="formula"
                    value={formState.formula}
                    onChange={handleInputChange}
                    placeholder="Ej: (var1 + var2) / 2"
                    variant="outlined"
                    sx={{
                      mt: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "white",
                        fontFamily: "monospace",
                        "&:hover fieldset": { borderColor: "#8b5cf6" },
                        "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: 2 },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
                    Operadores disponibles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {mathOperators.map((op) => (
                      <Tooltip key={op.value} title={op.description}>
                        <Button
                          variant="outlined"
                          onClick={() => setFormState(prev => ({ ...prev, formula: prev.formula + op.value }))}
                          sx={{
                            minWidth: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            borderColor: alpha("#8b5cf6", 0.3),
                            color: "#8b5cf6",
                            '&:hover': {
                              backgroundColor: alpha("#8b5cf6", 0.1),
                              borderColor: "#8b5cf6",
                            }
                          }}
                        >
                          {op.value}
                        </Button>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
                    Variables disponibles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formState.variables.map((v, i) => (
                      v.variable && v.value && (
                        <Chip
                          key={i}
                          label={`${v.value}`}
                          onClick={() => setFormState(prev => ({ ...prev, formula: prev.formula + `var${i+1}` }))}
                          sx={{ 
                            bgcolor: alpha(v.color, 0.1), 
                            color: v.color, 
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: alpha(v.color, 0.2),
                            }
                          }}
                        />
                      )
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", mt: 1, display: 'block' }}>
                    * Haz clic en una variable para añadirla a la fórmula. Las variables se representan como var1, var2, etc.
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4b5563", mb: 2, display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: 1, color: "#8b5cf6" }} />
                  Opciones de visualización
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de visualización</InputLabel>
                      <Select
                        value={formState.formulaDisplayType}
                        name="formulaDisplayType"
                        onChange={handleInputChange}
                        sx={{
                          borderRadius: 3,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6", borderWidth: 2 },
                        }}
                      >
                        {formulaDisplayOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {option.icon}
                              <Typography>{option.label}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Unidad"
                      name="formulaUnit"
                      value={formState.formulaUnit}
                      onChange={handleInputChange}
                      placeholder="Ej: %, °C, kWh"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          bgcolor: "white",
                          "&:hover fieldset": { borderColor: "#8b5cf6" },
                          "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: 2 },
                        },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                      }}
                    />
                  </Grid>
                  
                  {formState.formulaDisplayType === "gauge" && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Valor mínimo"
                          name="formulaMin"
                          value={formState.formulaMin}
                          onChange={handleInputChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              bgcolor: "white",
                              "&:hover fieldset": { borderColor: "#8b5cf6" },
                              "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: 2 },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Valor máximo"
                          name="formulaMax"
                          value={formState.formulaMax}
                          onChange={handleInputChange}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                              bgcolor: "white",
                              "&:hover fieldset": { borderColor: "#8b5cf6" },
                              "&.Mui-focused fieldset": { borderColor: "#8b5cf6", borderWidth: 2 },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#8b5cf6" },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Fade>
          )}

          <Paper
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              bgcolor: alpha("#6366f1", 0.05),
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4b5563", mb: 2 }}>
              Resumen
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>Tipo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                  {chartTypes.find((type) => type.value === formState.chartType)?.label || "No seleccionado"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>Nombre</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                  {formState.componentName || "Sin nombre"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>Tamaño</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                  {formState.colSize}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>Altura</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>{formState.height}px</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>Variables</Typography>
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formState.variables.map((v, i) => (
                    v.variable && (
                      <Chip
                        key={i}
                        label={
                          formState.chartType === "MixedChart"
                            ? `${v.variable} → ${v.value || "No seleccionado"} (${v.type})`
                            : `${v.variable} → ${v.value || "No seleccionado"}`
                        }
                        sx={{ bgcolor: alpha(v.color, 0.1), color: v.color, fontWeight: 600 }}
                      />
                    )
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      ),
    },
  ];

  const renderFooter = () => (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={prevStep}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              color: "#4b5563",
              borderColor: "#d1d5db",
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            Atrás
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            textTransform: "none",
            color: "#4b5563",
            borderColor: "#d1d5db",
            "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
          }}
        >
          Cancelar
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={nextStep}
            disabled={
              (activeStep === 0 && !formState.chartType) ||
              (activeStep === 1 && !formState.componentName)
            }
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!formState.componentName || formState.variables.some((v) => !v.variable || !v.value)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: "none",
              bgcolor: "#6366f1",
              "&:hover": { bgcolor: "#4f46e5" },
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
            }}
          >
            Guardar
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ 
        backdrop: { 
          timeout: 500, 
          sx: { backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.6)" } 
        } 
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fade in={open}>
        <Paper
          sx={{
            width: "95%",
            maxWidth: 960,
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 6,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #006875, #004a54)",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "white", color: "#006875", width: 48, height: 48 }}>
                <DataUsageIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                  Diseñador de Visualizaciones
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Paso {activeStep + 1} de {steps.length}: {steps[activeStep].title}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ color: "white", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ px: 4, py: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              {steps.map((step, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: activeStep >= index ? "#006875" : "#e5e7eb",
                      color: activeStep >= index ? "white" : "#9ca3af",
                      mr: index < steps.length - 1 ? 1 : 0,
                      transition: "all 0.3s",
                    }}
                  >
                    {activeStep > index ? <CheckCircleIcon /> : step.icon}
                  </Avatar>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: 50,
                        height: 2,
                        bgcolor: activeStep > index ? "#006875" : "#e5e7eb",
                        transition: "all 0.3s",
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>

            <Box sx={{ minHeight: 400 }}>{steps[activeStep].content}</Box>

            {renderFooter()}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default ChartConfigModal;