import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "./Navbar";
import {
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Modal,
  List,
  ListItem,
  IconButton,
  TextField,
  Divider,
  Alert,
  Box,
  Paper,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Chip,
  Container,
  useMediaQuery,
  Avatar,
  Badge,
  LinearProgress,
  Backdrop,
  Snackbar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DevicesIcon from "@mui/icons-material/Devices";
import TopicIcon from "@mui/icons-material/Topic";
import HelpIcon from "@mui/icons-material/Help";
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GetAppIcon from '@mui/icons-material/GetApp';
import WidgetsIcon from '@mui/icons-material/Widgets';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import {
  PDFDownloadLink,
  PDFViewer,
  pdf,
  Font,
  Page as PdfPage,
  Text,
  View,
  Document as PdfDocument,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { saveAs } from 'file-saver';
import LineChartComponent from "./reportescomponent/LineChartComponent";
import BarChartComponent from "./reportescomponent/BarChartComponent";
import TableHistoricos from "./reportescomponent/TableHistoricos";
import AreaChartComponent from "./reportescomponent/AreaChartComponent";
import html2canvas from "html2canvas";

// Registrar la fuente Roboto
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#ffffff",
    fontFamily: "Roboto",
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    padding: 15,
    borderBottom: 2,
    borderBottomColor: "#1e40af",
    borderBottomStyle: "solid",
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    fontFamily: "Roboto",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 6,
    fontFamily: "Roboto",
  },
  section: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minHeight: 400,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
    color: "#1e40af",
    fontFamily: "Roboto",
  },
  chartImage: {
    width: "100%",
    height: 350,
    objectFit: "contain",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },
  column: (width) => ({
    width: width ? `${width - 1}%` : "99%",
    marginBottom: 8,
  }),
  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#64748b",
    fontFamily: "Roboto",
  },
  componentContainer: {
    marginBottom: 20,
  },
  tableContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
    color: "#1e40af",
    fontFamily: "Roboto",
  },
  deviceName: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
    fontFamily: "Roboto",
  },
});

const PDFReport = ({ components, deviceName, reportTitle, pdfSubtitle }) => {
  const groupComponentsIntoRows = (components) => {
    const rows = [];
    let currentRow = [];
    let currentRowWidth = 0;

    components.forEach((comp) => {
      // Ajustamos los anchos para dejar espacio para márgenes
      const width = comp.width === "col2" ? 49 :  // 2 por fila
                 comp.width === "col3" ? 32 :  // 3 por fila
                 comp.width === "col4" ? 24 :  // 4 por fila
                 comp.width === "col6" ? 49 :  // 2 por fila
                 99;  // 1 por fila

      if (currentRowWidth + width <= 100) {
        currentRow.push({ ...comp, width });
        currentRowWidth += width;
      } else {
        rows.push(currentRow);
        currentRow = [{ ...comp, width }];
        currentRowWidth = width;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const groupRowsIntoPages = (rows) => {
    const pages = [];
    let currentPage = [];
    let currentPageHeight = 0;
    const maxPageHeight = 1100; // Altura máxima aproximada para una página A3
    const headerHeight = 80;
    const rowHeight = 450; // Aumentado para dar más espacio a cada fila

    rows.forEach((row) => {
      if (currentPageHeight + rowHeight > maxPageHeight - headerHeight) {
        pages.push(currentPage);
        currentPage = [row];
        currentPageHeight = rowHeight;
      } else {
        currentPage.push(row);
        currentPageHeight += rowHeight;
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  const rows = groupComponentsIntoRows(components);
  const pages = groupRowsIntoPages(rows);

  return (
    <PdfDocument>
      {pages.map((pageRows, pageIndex) => (
        <PdfPage key={`page-${pageIndex}`} size="A3" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{reportTitle || "Informe de Datos"}</Text>
            {pdfSubtitle && <Text style={styles.subtitle}>{pdfSubtitle}</Text>}
            <Text style={styles.subtitle}>
              Generado el: {new Date().toLocaleDateString()} | Dispositivo: {deviceName || "N/A"}
            </Text>
          </View>
          {pageRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((comp, index) => (
                <View key={`comp-${index}`} style={styles.column(comp.width)}>
                  <View style={styles.section}>
                    <Text style={styles.chartTitle}>{comp.title}</Text>
                    {comp.chartImage && (
                      <Image src={comp.chartImage} style={styles.chartImage} />
                    )}
                    {comp.data && (
                      <View style={styles.tableContainer}>
                        <Text style={{ ...styles.componentTitle, fontSize: 14 }}>
                          Datos desde {comp.startDate || "N/A"} hasta {comp.endDate || "N/A"}
                        </Text>
                        <View style={{ display: "flex", flexDirection: "column" }}>
                          {comp.data.map((row, index) => (
                            <View key={index} style={{ display: "flex", justifyContent: "space-between", padding: 4, borderBottom: "1px solid #e5e7eb" }}>
                              <Text style={{ fontSize: 12 }}>{row.timestamp}</Text>
                              {Object.keys(row.values).map((key, index) => (
                                <Text key={index} style={{ fontSize: 12 }}>{row.values[key]}</Text>
                              ))}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} fixed />
        </PdfPage>
      ))}
    </PdfDocument>
  );
};

const CustomButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  color = "primary", 
  startIcon, 
  size = "medium",
  variant = "contained",
  sx = {},
  ...props 
}) => (
  <Button
    variant={variant}
    color={color}
    onClick={onClick}
    disabled={disabled || loading}
    startIcon={loading ? null : startIcon}
    size={size}
    sx={{
      borderRadius: 2,
      textTransform: "none",
      padding: size === "small" ? "6px 16px" : "10px 20px",
      fontWeight: 600,
      boxShadow: variant === "contained" ? "0 3px 10px rgba(0, 0, 0, 0.12)" : "none",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden",
      "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 70%)",
        transform: "translateX(-100%)",
      },
      "&:hover": {
        boxShadow: variant === "contained" ? "0 6px 15px rgba(0, 0, 0, 0.15)" : "none",
        transform: "translateY(-2px)",
        "&:before": {
          transform: "translateX(100%)",
          transition: "transform 0.7s ease",
        },
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: variant === "contained" ? "0 2px 5px rgba(0, 0, 0, 0.1)" : "none",
      },
      "&:disabled": {
        backgroundColor: color === "primary" ? "rgba(59, 130, 246, 0.5)" : "rgba(156, 163, 175, 0.5)",
        color: "#ffffff",
        boxShadow: "none",
      },
      ...sx
    }}
    {...props}
  >
    {loading ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} color="inherit" thickness={5} />
        <span>Procesando...</span>
      </Box>
    ) : children}
  </Button>
);

const steps = [
  { 
    label: "Seleccionar Dispositivo", 
    icon: <DevicesIcon />,
    description: "Elige el dispositivo del que deseas generar un informe"
  },
  { 
    label: "Elegir Subtopic", 
    icon: <TopicIcon />,
    description: "Selecciona el tema de datos que quieres visualizar"
  },
  { 
    label: "Añadir Componentes", 
    icon: <WidgetsIcon />,
    description: "Crea visualizaciones personalizadas para tu informe"
  },
  { 
    label: "Generar PDF", 
    icon: <PictureAsPdfIcon />,
    description: "Genera y descarga tu informe en formato PDF"
  }
];

const ReportGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [variables, setVariables] = useState([]);
  const [components, setComponents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [pdfComponents, setPdfComponents] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportTitle, setReportTitle] = useState("Informe de Datos");
  const [pdfSubtitle, setPdfSubtitle] = useState("");
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [chartType, setChartType] = useState("line");
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const [newComponent, setNewComponent] = useState({
    title: "",
    description: "",
    chartType: "line",
    variables: [{ variable: "", color: "#1976d2" }],
    width: "col6",
    startDate: "",
    endDate: "",
    chartData: null
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
          alert("Por favor, inicia sesión para continuar.");
          return;
        }
        const response = await axios.get(
          `https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDevices(response.data.devices || []);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
        alert("Error al cargar dispositivos. Intenta de nuevo.");
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    setActiveStep(getActiveStep());
  }, [selectedDevice, selectedSubtopic, components]);

  useEffect(() => {
    // Actualizar los componentes existentes para asegurarse de que no haya componentes de tipo "pie"
    const updatedComponents = components.filter(comp => 
      ["line", "bar", "area", "table"].includes(comp.chartType)
    );
    
    // Solo actualizar si hay cambios
    if (updatedComponents.length !== components.length) {
      setComponents(updatedComponents);
    }
  }, []);

  const fetchSubtopics = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedDevice) {
        alert("Selecciona un dispositivo para buscar temas.");
        return;
      }
  
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
      console.log("Dispositivo seleccionado:", device);
  
      setLoading(true);
      setError(null);
      setSubtopics([]);
  
      // Definir rango de tiempo por defecto (últimas 24 horas)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // hace 24h
  
      const formattedStart = oneDayAgo.toISOString();
      const formattedEnd = now.toISOString();
  
      const response = await axios.get(
        `https://d5n72hag43.execute-api.us-east-1.amazonaws.com/report`,
        {
          params: {
            userId,
            device_id: device.name,
            startDate: formattedStart,
            endDate: formattedEnd
          }
        }
      );
  
      console.log("Respuesta de la API (subtopics):", response.data);
  
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSubtopics(response.data);
        setSnackbarMessage(`Se encontraron ${response.data.length} temas disponibles`);
        setSnackbarOpen(true);
      } else {
        setError("No se encontraron temas para este dispositivo");
      }
    } catch (error) {
      console.error("Error al obtener subtopics:", error);
      setError(`Error al cargar subtopics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVariables = async (subtopic) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedDevice || !subtopic) {
        alert("Selecciona un subtopic para cargar variables.");
        return;
      }
  
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
  
      // Rango de tiempo por defecto (últimas 24 horas)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const formattedStart = oneDayAgo.toISOString();
      const formattedEnd = now.toISOString();
  
      const response = await axios.get(
        `https://d5n72hag43.execute-api.us-east-1.amazonaws.com/report`,
        {
          params: {
            userId,
            device_id: device.name,
            subtopic,
            startDate: formattedStart,
            endDate: formattedEnd
          }
        }
      );
  
      if (response.data && response.data[0]) {
        const variableKeys = Object.keys(response.data[0]);
        setVariables(variableKeys);
      }
    } catch (error) {
      console.error("Error al obtener variables:", error);
      alert("Error al cargar variables. Intenta de nuevo.");
    }
  };
  

  const handleAddVariable = () => {
    setNewComponent((prev) => ({
      ...prev,
      variables: [...prev.variables, { variable: "", color: "#36a2eb" }],
    }));
  };

  const handleRemoveVariable = (index) => {
    setNewComponent((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleVariableChange = (index, key, value) => {
    setNewComponent((prev) => ({
      ...prev,
      variables: prev.variables.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    }));
  };

  const fetchHistoricalData = async (deviceId, subtopic, variables, startDate, endDate) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId || !deviceId || !subtopic || !variables || variables.length === 0) {
        throw new Error("Faltan parámetros para obtener datos históricos");
      }
      
      const device = devices.find(dev => dev.deviceId === deviceId);
      if (!device) {
        throw new Error("Dispositivo no encontrado");
      }
      
      // Formatear fechas para la API
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      
      // Llamada a la API para obtener datos históricos
      const response = await axios.get(
        `https://d5n72hag43.execute-api.us-east-1.amazonaws.com/historical`,
        { 
          params: { 
            userId, 
            device_id: device.name, 
            subtopic,
            variables: variables.join(','),
            start_date: formattedStartDate,
            end_date: formattedEndDate
          } 
        }
      );
      
      // Procesar los datos recibidos para el formato de Chart.js
      if (response.data && response.data.length > 0) {
        // Extraer las fechas únicas para las etiquetas
        const allTimestamps = response.data.map(item => item.timestamp);
        const uniqueTimestamps = [...new Set(allTimestamps)].sort();
        
        // Crear datasets para cada variable
        const datasets = [];
        const colors = [
          '#3b82f6', // Azul
          '#10b981', // Verde
          '#f59e0b', // Naranja
          '#8b5cf6', // Púrpura
          '#ef4444'  // Rojo
        ];
        
        variables.forEach((variable, index) => {
          const dataPoints = [];
          
          // Para cada timestamp, buscar el valor de esta variable
          uniqueTimestamps.forEach(timestamp => {
            const dataPoint = response.data.find(item => 
              item.timestamp === timestamp && item[variable] !== undefined
            );
            
            if (dataPoint) {
              dataPoints.push({
                x: timestamp,
                y: dataPoint[variable]
              });
            }
          });
          
          datasets.push({
            label: variable,
            data: dataPoints.map(point => point.y),
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}33`,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          });
        });
        
        return {
          labels: uniqueTimestamps,
          datasets
        };
      }
      
      throw new Error("No se encontraron datos para los parámetros seleccionados");
    } catch (error) {
      console.error("Error al obtener datos históricos:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async () => {
    // Validaciones básicas
    if (!newComponent.title) {
      setSnackbarMessage("Por favor, ingresa un título para el componente");
      setSnackbarOpen(true);
      return;
    }

    if (!newComponent.variables || newComponent.variables.length === 0) {
      setSnackbarMessage("Selecciona al menos una variable");
      setSnackbarOpen(true);
      return;
    }

    if (!newComponent.startDate || !newComponent.endDate) {
      setSnackbarMessage("Selecciona un rango de fechas");
      setSnackbarOpen(true);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const selectedDeviceObj = devices.find((device) => device.deviceId === selectedDevice);
      const device_id = selectedDeviceObj.name;
      const subtopic = selectedSubtopic;
      const values = newComponent.variables.map((v) => v.variable);
  
      // Use the full datetime string from datetime-local
      const startDate = newComponent.startDate; // e.g., "2025-03-09T14:30"
      const endDate = newComponent.endDate; // e.g., "2025-03-09T16:30"
  
      const response = await axios.post(
        "https://uown6aglg5.execute-api.us-east-1.amazonaws.com/mqttreport",
        { device_id, subtopic, user_id: userId, values, startDate, endDate },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (!response.data || response.data.length === 0) {
        setSnackbarMessage("No se encontraron datos para los parámetros seleccionados");
        setSnackbarOpen(true);
        return;
      }
  
      console.log("Datos recibidos de la API:", response.data);
      
      // Asegurarse de que los datos estén ordenados cronológicamente
      const sortedData = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Convertir timestamps a objetos Date para el eje X
      const labels = sortedData.map((item) => new Date(item.timestamp).toISOString());
      
      // Crear datasets para cada variable
      const datasets = newComponent.variables.map((variable) => {
        // Color base para todos los tipos de gráficos
        let backgroundColor = `${variable.color}33`; // Opacidad baja por defecto (20%)
        
        // Si es un gráfico de área, usar una opacidad mayor
        if (newComponent.chartType === "area") {
          backgroundColor = `${variable.color}99`; // Opacidad media (60%)
        }
        
        return {
          label: variable.variable,
          data: sortedData.map((item) => item.values[variable.variable] || 0),
          borderColor: variable.color,
          backgroundColor: backgroundColor,
        };
      });
      
      // Formato estándar para otros tipos de gráficos
      const chartData = { labels, datasets };
  
      const newComponentWithId = {
        ...newComponent,
        id: `component-${Date.now()}`,
        chartData,
      };

      if (editingIndex !== null) {
        const updatedComponents = [...components];
        updatedComponents[editingIndex] = newComponentWithId;
        setComponents(updatedComponents);
        setEditingIndex(null);
      } else {
        setComponents([...components, newComponentWithId]);
      }
  
      setNewComponent({
        title: "",
        variables: [{ variable: "", color: "#1976d2" }],
        width: "col6",
        startDate: "",
        endDate: "",
        chartType: "line",
        chartData: null
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setSnackbarMessage(`Error al cargar los datos: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleRemoveComponent = (index) => {
    const updatedComponents = [...components];
    updatedComponents.splice(index, 1);
    setComponents(updatedComponents);
    
    // Si estamos editando el componente que se está eliminando, cerramos el modal
    if (editingIndex === index) {
      setEditingIndex(null);
      setIsModalOpen(false);
      setNewComponent({
        title: "",
        chartType: "line",
        variables: [{ variable: "", color: "#1976d2" }],
        startDate: "",
        endDate: "",
        width: "col6",
        chartData: null
      });
    }
  };

  const handleEditComponent = (index) => {
    const component = components[index];
    setNewComponent({
      ...component,
      width: component.chartType === "table" ? "col12" : component.width
    });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const captureChart = async (chartId) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Elemento con ID ${chartId} no encontrado`);
      return null;
    }
    const buttons = chartElement.querySelectorAll("button");
    buttons.forEach((button) => (button.style.display = "none"));
    const canvas = await html2canvas(chartElement, { scale: 2, useCORS: true, logging: true });
    buttons.forEach((button) => (button.style.display = "inline-flex"));
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    console.log(`Imagen capturada para ${chartId}:`, dataUrl.slice(0, 50) + "..."); // Depuración
    return dataUrl;
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    setProgress(0);
    setShowProgress(true);

    try {
      const componentsWithImages = [];
      let totalComponents = components.length;
      
      // Reducir el tiempo de espera inicial
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capturar cada componente
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const componentId = component.id || i;
        const componentContainer = document.getElementById(`component-container-${componentId}`);
        
        if (!componentContainer) {
          console.error(`No se encontró el contenedor para el componente ${componentId}`);
          continue;
        }
        
        try {
          // Ocultar temporalmente los botones de acción y los iconos de editar/eliminar
          const actionButtons = componentContainer.querySelectorAll('.action-button');
          const editButtons = componentContainer.querySelectorAll('.edit-button, .delete-button');
          
          // Ocultar todos los botones
          [...actionButtons, ...editButtons].forEach(button => {
            button.style.display = 'none';
          });
          
          // Asegurarse de que el componente sea visible
          componentContainer.style.display = 'block';
          componentContainer.style.visibility = 'visible';
          
          // Optimizar la configuración de html2canvas para mayor velocidad
          const canvas = await html2canvas(componentContainer, {
            scale: 2, // Reducir la escala para mayor velocidad
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: true,
            logging: false, // Desactivar logging para mayor velocidad
            imageTimeout: 0 // Sin timeout para imágenes
          });
          
          // Restaurar la visibilidad de los botones
          [...actionButtons, ...editButtons].forEach(button => {
            button.style.display = '';
          });
          
          // Convertir a imagen con menor calidad para mayor velocidad
          let chartImage = canvas.toDataURL('image/png', 0.8);
          
          if (chartImage && chartImage.length > 1000) {
            componentsWithImages.push({
              ...component,
              chartImage
            });
          }
          
          // Actualizar progreso inmediatamente
          setProgress(Math.round(((i + 1) / totalComponents) * 100));
        } catch (error) {
          console.error(`Error al procesar el componente ${componentId}:`, error);
        }
      }
      
      if (componentsWithImages.length === 0) {
        throw new Error('No se pudo capturar ninguna imagen de los componentes');
      }
      
      // Almacenar los componentes capturados
      setPdfComponents(componentsWithImages);
      
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setErrorMessage('Error al generar el PDF: ' + error.message);
      setShowErrorAlert(true);
    } finally {
      setIsGeneratingPDF(false);
      setShowProgress(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      
      if (!selectedDevice || components.length === 0) {
        throw new Error("Selecciona un dispositivo y asegúrate de tener componentes para exportar");
      }

      const workbook = XLSX.utils.book_new();
      let hasData = false;
      
      for (const [index, component] of components.entries()) {
        try {
          if (!component.chartData || !component.chartData.labels || !component.chartData.datasets) {
            continue;
          }

          const sheetData = [
            [component.title || `Componente ${index + 1}`],
            [`Tipo: ${component.chartType === "line" ? "Gráfico de Líneas" : 
                     component.chartType === "bar" ? "Gráfico de Barras" : 
                     component.chartType === "formula" ? "Fórmula Personalizada" : 
                     "Tabla de Datos"}`],
            [`Período: ${new Date(component.startDate).toLocaleDateString()} - ${new Date(component.endDate).toLocaleDateString()}`],
            [],
            ['Fecha', ...component.chartData.datasets.map(ds => ds.label)]
          ];

          component.chartData.labels.forEach((timestamp, idx) => {
            sheetData.push([
              new Date(timestamp).toLocaleString(),
              ...component.chartData.datasets.map(ds => ds.data[idx] || '')
            ]);
          });

          if (sheetData.length > 5) {
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            worksheet['!cols'] = Array(sheetData[0].length).fill({ wch: 20 });
            XLSX.utils.book_append_sheet(workbook, worksheet, `Componente ${index + 1}`);
            hasData = true;
          }
        } catch (error) {
          console.error(`Error en componente ${index + 1}:`, error);
        }
      }

      if (!hasData) {
        throw new Error("No se encontraron datos para exportar en ningún componente");
      }

      const fileName = `${(reportTitle || 'reporte').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      setSnackbarMessage("Datos exportados exitosamente a Excel");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al exportar:", error);
      setSnackbarMessage(`Error al exportar a Excel: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const getActiveStep = () => {
    if (!selectedDevice) return 0;
    if (!selectedSubtopic) return 1;
    if (components.length === 0) return 2;
    return 3;
  };

  const chartContainerStyle = {
    height: '700px',
    width: '100%',
    minHeight: '700px',
    maxHeight: '700px',
    padding: '5px',
    boxSizing: 'border-box'
  };

  const renderComponent = (component, index) => {
    // Verificar si el componente tiene un tipo de gráfico válido
    if (!["line", "bar", "area", "table"].includes(component.chartType)) {
      return null; // No renderizar componentes con tipos no válidos
    }
    
    const commonProps = {
      id: component.id,
      data: component.chartData,
      title: component.title,
      variables: component.variables,
      startDate: component.startDate,
      endDate: component.endDate,
      deviceId: selectedDevice,
      subtopic: selectedSubtopic
    };

    return (
      <Box 
        id={`component-container-${component.id || index}`}
        sx={{ 
          position: 'relative',
          width: '100%',
          '& > *': { width: '100%' },
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          padding: component.chartType === "line" ? '16px 8px' : '16px', // Menos padding horizontal para líneas
          marginBottom: '20px'
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {component.title || `Componente ${index + 1}`}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: '#64748b' }}>
            {new Date(component.startDate).toLocaleDateString()} - {new Date(component.endDate).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Paper
          elevation={2}
          sx={{
            p: component.chartType === "line" ? 1 : 2, // Menos padding para gráficos de línea
            height: component.chartType === "line" || component.chartType === "bar" || component.chartType === "area" ? '700px' : 'auto',
            overflow: component.chartType === "table" ? 'visible' : 'auto',
            borderRadius: '8px',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            },
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            minHeight: component.chartType === "line" || component.chartType === "bar" || component.chartType === "area" ? '700px' : 'auto',
            maxHeight: component.chartType === "line" || component.chartType === "bar" || component.chartType === "area" ? '700px' : 'none',
            maxWidth: component.chartType === "line" ? '100%' : '100%' // Asegurar que use todo el ancho disponible
          }}
        >
          {component.chartType === "line" && (
            <div 
              id={`chart-${component.id || index}`} 
              style={chartContainerStyle}
            >
              <LineChartComponent {...commonProps} showTitle={false} />
            </div>
          )}
          {component.chartType === "bar" && (
            <div 
              id={`chart-${component.id || index}`} 
              style={chartContainerStyle}
            >
              <BarChartComponent {...commonProps} showTitle={false} />
            </div>
          )}
          {component.chartType === "area" && (
            <div 
              id={`chart-${component.id || index}`} 
              style={chartContainerStyle}
            >
              <AreaChartComponent {...commonProps} showTitle={false} />
            </div>
          )}
          {component.chartType === "table" && (
            <div id={`chart-${component.id || index}`} style={{ width: '100%' }}>
              <TableHistoricos {...commonProps} showTitle={false} />
            </div>
          )}
        </Paper>
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          <IconButton
            className="edit-button"
            size="small"
            onClick={() => handleEditComponent(index)}
            sx={{ 
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            className="delete-button"
            size="small"
            onClick={() => handleRemoveComponent(index)}
            sx={{ 
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <NavBar />
      <Box
        sx={{
          marginLeft: "250px",
          padding: "40px",
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ color: "#1e293b", fontWeight: 700, letterSpacing: "-0.5px" }}
          >
            Generador de Reportes
            <Tooltip
              title="Crea informes personalizados con datos de tus dispositivos. Sigue los pasos: 1) Selecciona un dispositivo, 2) Elige un subtopic, 3) Añade componentes con variables y fechas."
              placement="right"
            >
              <IconButton color="primary" sx={{ ml: 1 }}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  icon={step.icon}
                  sx={{ color: "#64748b", "& .MuiStepLabel-label": { fontWeight: 500 } }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {steps[getActiveStep()]?.description || "Sigue los pasos para generar tu informe personalizado"}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                backgroundColor: '#fefefe', 
                border: '1px solid #e2e8f0',
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
                  <DevicesIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                  Selección de Dispositivo
                </Typography>
              </Box>
              
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <InputLabel>Seleccionar Dispositivo</InputLabel>
                <Select
                  value={selectedDevice}
                  onChange={(e) => {
                    setSelectedDevice(e.target.value);
                    setSelectedSubtopic("");
                    setVariables([]);
                  }}
                  sx={{ color: "#1e293b" }}
                  startAdornment={selectedDevice ? <DevicesIcon sx={{ ml: 1, mr: 1, color: '#3b82f6' }} /> : null}
                >
                  {devices.map((device) => (
                    <MenuItem key={device.deviceId} value={device.deviceId}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
                <Tooltip title="Elige el dispositivo del que deseas generar el informe.">
                  <IconButton color="primary" sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </FormControl>
              
              <CustomButton
                onClick={fetchSubtopics}
                color="primary"
                disabled={!selectedDevice}
                startIcon={<TopicIcon />}
                variant="contained"
                fullWidth
              >
                Buscar Temas
              </CustomButton>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                backgroundColor: '#fefefe', 
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
                  <TopicIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                  Temas Disponibles
                </Typography>
                <Tooltip title="Selecciona un tema para cargar las variables asociadas.">
                  <IconButton color="primary" sx={{ ml: 1 }}>
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {subtopics.length > 0 ? (
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Grid container spacing={1}>
                    {subtopics.map((subtopic, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card 
                          sx={{ 
                            mb: 1, 
                            borderRadius: 2,
                            border: selectedSubtopic === subtopic ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            boxShadow: selectedSubtopic === subtopic ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => {
                            setSelectedSubtopic(subtopic);
                            fetchVariables(subtopic);
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TopicIcon 
                                sx={{ 
                                  color: selectedSubtopic === subtopic ? '#3b82f6' : '#94a3b8',
                                  mr: 1
                                }} 
                              />
                              <Typography 
                                sx={{ 
                                  color: selectedSubtopic === subtopic ? '#3b82f6' : '#1e293b',
                                  fontWeight: selectedSubtopic === subtopic ? 600 : 400
                                }}
                              >
                                {subtopic}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexGrow: 1,
                  color: '#94a3b8',
                  p: 3
                }}>
                  {loading ? (
                    <>
                      <CircularProgress size={48} color="primary" sx={{ mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                        Cargando temas...
                      </Typography>
                    </>
                  ) : error ? (
                    <>
                      <TopicIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#ef4444' }} />
                      <Typography variant="h6" sx={{ color: '#ef4444', mb: 1 }}>
                        Error al cargar temas
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
                        {error}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={fetchSubtopics}
                        startIcon={<TopicIcon />}
                      >
                        Reintentar
                      </Button>
                    </>
                  ) : (
                    <>
                      <TopicIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                        No hay temas disponibles
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Selecciona un dispositivo y haz clic en "Buscar Temas"
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <CustomButton
          onClick={() => setIsTitleModalOpen(true)}
          sx={{ mb: 4 }}
        >
          Configurar Título
        </CustomButton>

        <Modal
          open={isTitleModalOpen}
          onClose={() => setIsTitleModalOpen(false)}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Fade in={isTitleModalOpen}>
            <Box
              sx={{
                backgroundColor: "#ffffff",
                p: 4,
                width: "500px",
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                id="modal-modal-title"
                variant="h5"
                sx={{ mb: 3, color: "#1e293b", fontWeight: 700 }}
              >
                Configurar Título del Informe
                <Tooltip title="Define un título y subtítulo para personalizar tu informe PDF.">
                  <IconButton color="primary" sx={{ ml: 1 }}>
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <TextField
                fullWidth
                label="Título del PDF"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                variant="outlined"
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                placeholder="Ej: Informe de Temperatura 2025"
              />
              <TextField
                fullWidth
                label="Subtítulo del PDF"
                value={pdfSubtitle}
                onChange={(e) => setPdfSubtitle(e.target.value)}
                variant="outlined"
                sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                placeholder="Ej: Análisis Mensual"
              />
              <CustomButton onClick={() => setIsTitleModalOpen(false)}>
                Guardar
              </CustomButton>
            </Box>
          </Fade>
        </Modal>

        {variables.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <WidgetsIcon />
                </Avatar>
                <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                  Añadir Componentes
                </Typography>
                <Tooltip title="Selecciona el tipo de componente que deseas añadir a tu informe">
                  <IconButton color="primary" sx={{ ml: 1 }}>
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Selecciona el tipo de visualización para añadir al informe. Puedes configurar cada componente según tus necesidades.
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Card 
                  onClick={() => {
                    setNewComponent({ ...newComponent, chartType: "line" });
                    setIsModalOpen(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    width: 200,
                    backgroundColor: newComponent.chartType === "line" ? '#e0f2fe' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f0f9ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimelineIcon sx={{ color: '#3b82f6', mr: 1 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
                      Gráfico de Líneas
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Visualiza tendencias a lo largo del tiempo
                  </Typography>
                </Card>

                <Card 
                  onClick={() => {
                    setNewComponent({ ...newComponent, chartType: "bar" });
                    setIsModalOpen(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    width: 200,
                    backgroundColor: newComponent.chartType === "bar" ? '#e0f2fe' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f0fdf4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon sx={{ color: '#10b981', mr: 1 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
                      Gráfico de Barras
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Compara valores entre categorías
                  </Typography>
                </Card>
                
                <Card 
                  onClick={() => {
                    setNewComponent({ ...newComponent, chartType: "area" });
                    setIsModalOpen(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    width: 200,
                    backgroundColor: newComponent.chartType === "area" ? '#e0f2fe' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f0fdf4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon sx={{ color: '#10b981', mr: 1 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
                      Gráfico de Área
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Visualiza áreas bajo la curva
                  </Typography>
                </Card>
                
                {/* Opción de tabla temporalmente deshabilitada 
                <Card 
                  onClick={() => {
                    setNewComponent({ ...newComponent, chartType: "table" });
                    setIsModalOpen(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    width: 200,
                    backgroundColor: newComponent.chartType === "table" ? '#e0f2fe' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#fef3c7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TableChartIcon sx={{ color: '#f59e0b', mr: 1 }} />
                    <Typography sx={{ color: '#1e293b', fontWeight: 600 }}>
                      Tabla de Datos
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Visualiza datos en formato tabular
                  </Typography>
                </Card>
                */}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CustomButton
                  variant="contained"
                  color="primary"
                  onClick={() => setIsModalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  Configurar Componente
                </CustomButton>
              </Box>
            </Paper>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Título y botones de acción */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
              Componentes del Informe
              <Tooltip title="Lista de componentes que se incluirán en el PDF">
                <IconButton color="primary" sx={{ ml: 1 }}>
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Typography>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CustomButton
                onClick={handleGeneratePDF}
                disabled={components.length === 0 || isGeneratingPDF}
                startIcon={<PictureAsPdfIcon />}
                color="primary"
              >
                {isGeneratingPDF ? 'Generando PDF...' : 'Generar PDF'}
              </CustomButton>

              {showSuccessAlert && pdfComponents.length > 0 && (
                <PDFDownloadLink
                  document={
                    <PDFReport
                      components={pdfComponents}
                      deviceName={devices.find(dev => dev.deviceId === selectedDevice)?.name || ""}
                      reportTitle={reportTitle}
                      pdfSubtitle={pdfSubtitle}
                    />
                  }
                  fileName={`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
                >
                  {({ blob, url, loading, error }) => (
                    <CustomButton
                      disabled={loading || error}
                      startIcon={<DownloadIcon />}
                      color="success"
                      variant="contained"
                    >
                      {loading ? 'Preparando descarga...' : 'Descargar PDF'}
                    </CustomButton>
                  )}
                </PDFDownloadLink>
              )}

              <CustomButton
                onClick={handleExportToExcel}
                disabled={components.length === 0 || isExporting}
                startIcon={<FileDownloadIcon />}
                color="info"
              >
                {isExporting ? 'Exportando...' : 'Exportar a Excel'}
              </CustomButton>
            </Box>
          </Box>

          {/* Barra de progreso */}
          {isGeneratingPDF && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1, color: '#475569', textAlign: 'center' }}>
                Capturando componentes y generando PDF...
              </Typography>
            </Box>
          )}

          {/* Lista de componentes */}
          {components.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: 2
              }}
            >
              <WidgetsIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
                No hay componentes
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Añade componentes para generar tu informe PDF
              </Typography>
              <CustomButton
                onClick={() => setIsModalOpen(true)}
                startIcon={<AddIcon />}
                size="small"
              >
                Añadir Componente
              </CustomButton>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {components.map((component, index) => (
                <Grid 
                  item 
                  key={index} 
                  xs={12} 
                  md={component.width === "col12" ? 12 : 6}
                  sx={{
                    width: '100%',
                    '& .MuiPaper-root': {
                      height: 'auto',
                      minHeight: 'auto',
                      width: '100%'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'relative',
                      width: '100%',
                      '& > *': {
                        width: '100%'
                      }
                    }}
                  >
                    {renderComponent(component, index)}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                      <IconButton
                        className="edit-button"
                        size="small"
                        onClick={() => handleEditComponent(index)}
                        sx={{ 
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        className="delete-button"
                        size="small"
                        onClick={() => handleRemoveComponent(index)}
                        sx={{ 
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        {/* Diálogo de progreso para la generación de PDF */}
        <Dialog
          open={showProgress}
          aria-labelledby="progress-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: 2,
              maxWidth: '400px',
              width: '100%'
            }
          }}
        >
          <DialogTitle id="progress-dialog-title">Generando PDF</DialogTitle>
          <DialogContent>
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
            <Typography variant="body2">
              Por favor espera mientras se capturan los componentes y se genera el PDF...
            </Typography>
          </DialogContent>
        </Dialog>
        
        {/* Alerta de éxito */}
        <Snackbar
          open={showSuccessAlert}
          autoHideDuration={3000}
          onClose={() => setShowSuccessAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSuccessAlert(false)} severity="success" sx={{ width: '100%' }}>
            PDF generado con éxito. Puedes descargarlo desde el panel de visualización.
          </Alert>
        </Snackbar>
        
        {/* Alerta de error */}
        <Snackbar
          open={showErrorAlert}
          autoHideDuration={5000}
          onClose={() => setShowErrorAlert(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowErrorAlert(false)} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
        
        {/* Vista previa del PDF */}
        {pdfComponents.length > 0 && (
          <Dialog
            open={true}
            fullWidth
            maxWidth="md"
            onClose={() => setPdfComponents([])}
            aria-labelledby="pdf-preview-dialog"
          >
            <DialogTitle id="pdf-preview-dialog">
              Vista previa del PDF
              <IconButton
                aria-label="close"
                onClick={() => setPdfComponents([])}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <PDFViewer width="100%" height="600px" style={{ border: 'none' }}>
                <PDFReport
                  components={pdfComponents}
                  deviceName={devices.find(dev => dev.deviceId === selectedDevice)?.name || ""}
                  reportTitle={reportTitle}
                  pdfSubtitle={pdfSubtitle}
                />
              </PDFViewer>
            </DialogContent>
            <DialogActions>
              <CustomButton onClick={() => setPdfComponents([])} color="primary">
                Cerrar
              </CustomButton>
              <CustomButton
                onClick={() => {
                  const blob = pdf(
                    <PDFReport
                      components={pdfComponents}
                      deviceName={devices.find(dev => dev.deviceId === selectedDevice)?.name || ""}
                      reportTitle={reportTitle}
                      pdfSubtitle={pdfSubtitle}
                    />
                  ).toBlob();
                  blob.then(blobData => {
                    saveAs(blobData, `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
                  });
                }}
                color="primary"
                variant="contained"
                startIcon={<GetAppIcon />}
              >
                Descargar PDF
              </CustomButton>
            </DialogActions>
          </Dialog>
        )}
        
        {/* Modal para añadir/editar componentes */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Fade in={isModalOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflow: "auto",
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography
                id="modal-modal-title"
                variant="h5"
                sx={{ mb: 3, color: "#1e293b", fontWeight: 700 }}
              >
                {editingIndex !== null ? "Editar Componente" : "Añadir Nuevo Componente"}
                {newComponent.chartType === "line" && <TimelineIcon sx={{ ml: 1, verticalAlign: "middle", color: "#3b82f6" }} />}
                {newComponent.chartType === "bar" && <BarChartIcon sx={{ ml: 1, verticalAlign: "middle", color: "#10b981" }} />}
                {newComponent.chartType === "area" && <BarChartIcon sx={{ ml: 1, verticalAlign: "middle", color: "#10b981" }} />}
                {newComponent.chartType === "table" && <TableChartIcon sx={{ ml: 1, verticalAlign: "middle", color: "#f59e0b" }} />}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <InputLabel>Tipo de Componente</InputLabel>
                <Select
                  value={newComponent.chartType}
                  onChange={(e) => {
                    const chartType = e.target.value;
                    setNewComponent({ 
                      ...newComponent, 
                      chartType,
                      width: chartType === "table" ? "col12" : newComponent.width 
                    });
                  }}
                  sx={{ color: "#1e293b" }}
                >
                  <MenuItem value="line">Gráfico de Líneas</MenuItem>
                  <MenuItem value="bar">Gráfico de Barras</MenuItem>
                  <MenuItem value="area">Gráfico de Área</MenuItem>
                  {/* Opción de tabla temporalmente deshabilitada 
                  <MenuItem value="table">Tabla de Datos</MenuItem>
                  */}
                </Select>
              </FormControl>
              
              <TextField
                label="Título del Componente"
                fullWidth
                variant="outlined"
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                value={newComponent.title}
                onChange={(e) => setNewComponent({ ...newComponent, title: e.target.value })}
              />
              
              {newComponent.variables.map((variable, index) => (
                <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                      <InputLabel>Variable</InputLabel>
                      <Select
                        value={variable.variable}
                        onChange={(e) => handleVariableChange(index, "variable", e.target.value)}
                        sx={{ color: "#1e293b" }}
                      >
                        {variables.map((v, i) => (
                          <MenuItem key={i} value={v}>{v}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel shrink>Color</InputLabel>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 2 }}>
                        <input
                          type="color"
                          value={variable.color}
                          onChange={(e) => handleVariableChange(index, "color", e.target.value)}
                          style={{ width: "50px", height: "40px", padding: 0, border: "none" }}
                        />
                        <Typography sx={{ color: "#4a5568" }}>{variable.color}</Typography>
                      </Box>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton color="error" onClick={() => handleRemoveVariable(index)} sx={{ p: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              
              <CustomButton
                variant="outlined"
                color="primary"
                onClick={handleAddVariable}
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
              >
                Añadir Variable
              </CustomButton>
              
              {newComponent.chartType !== "table" && (
                <FormControl fullWidth sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                  <InputLabel>Tamaño (Columnas)</InputLabel>
                  <Select
                    value={newComponent.width}
                    onChange={(e) => setNewComponent({ ...newComponent, width: e.target.value })}
                    sx={{ color: "#1e293b" }}
                  >
                    <MenuItem value="col2">2 Columnas</MenuItem>
                    <MenuItem value="col3">3 Columnas</MenuItem>
                    <MenuItem value="col4">4 Columnas</MenuItem>
                    <MenuItem value="col6">6 Columnas</MenuItem>
                    <MenuItem value="col12">12 Columnas</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <Typography variant="h6" sx={{ color: "#1e293b", mb: 2, fontWeight: 600 }}>
                Filtrar por Fechas y Horas
                <Tooltip title="Selecciona un rango de fechas y horas para filtrar los datos del gráfico.">
                  <IconButton color="primary" sx={{ ml: 1 }}>
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <TextField
                fullWidth
                label="Fecha y Hora de Inicio"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newComponent.startDate}
                onChange={(e) => setNewComponent({ ...newComponent, startDate: e.target.value })}
                variant="outlined"
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              
              <TextField
                fullWidth
                label="Fecha y Hora de Fin"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newComponent.endDate}
                onChange={(e) => setNewComponent({ ...newComponent, endDate: e.target.value })}
                variant="outlined"
                sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <CustomButton 
                  onClick={() => setIsModalOpen(false)}
                  variant="outlined"
                  color="primary"
                >
                  Cancelar
                </CustomButton>
                <CustomButton 
                  onClick={handleAddComponent}
                  variant="contained"
                  color="primary"
                  startIcon={editingIndex !== null ? <EditIcon /> : <AddIcon />}
                >
                  {editingIndex !== null ? "Guardar Cambios" : "Añadir Componente"}
                </CustomButton>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default ReportGenerator;