import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Navbar";
import {
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Modal,
  TextField,
  List,
  ListItem,
  IconButton,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { PDFDownloadLink, Page as PdfPage, Text, View, Document as PdfDocument, StyleSheet, Image } from "@react-pdf/renderer";
import LineChartComponent from "./reportescomponent/LineChartComponent";
import BarChartComponent from "./reportescomponent/BarChartComponent"; // Importar el componente de barras
import html2canvas from "html2canvas";
import { pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    fontFamily: "Helvetica",
    position: "relative",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: "2px solid #4CAF50",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)",
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2C3E50",
  },
  chartImage: {
    width: "100%",
    height: "300px",
    marginTop: "10px",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  column: (width) => ({
    width: `${(width / 12) * 100}%`,
  }),
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    borderTop: "1px solid #ddd",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
});

const PDFReport = ({ components, deviceName, pdfTitle, pdfSubtitle }) => {
  const groupComponentsIntoRows = (components) => {
    const rows = [];
    let currentRow = [];
    let currentRowWidth = 0;

    components.forEach((comp) => {
      const width = comp.width === "col2" ? 2 :
                   comp.width === "col3" ? 3 :
                   comp.width === "col4" ? 4 :
                   comp.width === "col6" ? 6 : 12;

      if (currentRowWidth + width <= 12) {
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
    const maxRowsPerPage = 2;

    for (let i = 0; i < rows.length; i += maxRowsPerPage) {
      pages.push(rows.slice(i, i + maxRowsPerPage));
    }

    return pages;
  };

  const rows = groupComponentsIntoRows(components);
  const pages = groupRowsIntoPages(rows);

  return (
    <PdfDocument>
      {pages.map((pageRows, pageIndex) => (
        <PdfPage key={pageIndex} size="A3" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{pdfTitle}</Text>
            {pdfSubtitle && <Text style={styles.subtitle}>{pdfSubtitle}</Text>}
            <Text style={{ fontSize: 12, color: "#999", marginTop: 10 }}>
              Generado el: {new Date().toLocaleDateString()} | Dispositivo: {deviceName}
            </Text>
          </View>

          {pageRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((comp, index) => (
                <View key={index} style={styles.column(comp.width)}>
                  <View style={styles.section}>
                    <Text style={styles.chartTitle}>{comp.title}</Text>
                    {comp.chartImage && (
                      <Image src={comp.chartImage} style={styles.chartImage} />
                    )}
                    <Text style={{ fontSize: 12, color: "#777", marginTop: 10 }}>
                      Datos desde {comp.startDate || "N/A"} hasta {comp.endDate || "N/A"}
                    </Text>
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

const ReportGenerator = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [variables, setVariables] = useState([]);
  const [components, setComponents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [pdfComponents, setPdfComponents] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfTitle, setPdfTitle] = useState("Informe del dato");
  const [pdfSubtitle, setPdfSubtitle] = useState("");
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [chartType, setChartType] = useState("line"); // Estado para el tipo de gráfico

  const [newComponent, setNewComponent] = useState({
    title: "",
    variables: [],
    width: "col6",
    startDate: "",
    endDate: "",
    chartType: "line", // Tipo de gráfico por defecto
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
          alert("Token o ID de usuario no encontrados.");
          return;
        }
        const response = await axios.get(
          `https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDevices(response.data.devices || []);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
      }
    };
    fetchDevices();
  }, []);

  const fetchSubtopics = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedDevice) {
        alert("Selecciona un dispositivo.");
        return;
      }
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
      if (!device) {
        alert("Dispositivo no encontrado.");
        return;
      }
      const response = await axios.get(
        `https://d5n72hag43.execute-api.us-east-1.amazonaws.com/report`,
        {
          params: { userId, device_id: device.name },
        }
      );
      setSubtopics(response.data);
    } catch (error) {
      console.error("Error al obtener subtopics:", error);
    }
  };

  const fetchVariables = async (subtopic) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedDevice || !subtopic) {
        alert("Selecciona un subtopic.");
        return;
      }
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
      if (!device) {
        alert("Dispositivo no encontrado.");
        return;
      }
      const response = await axios.get(
        `https://d5n72hag43.execute-api.us-east-1.amazonaws.com/report`,
        {
          params: { userId, device_id: device.name, subtopic },
        }
      );
      if (response.data && response.data[0]) {
        const variableKeys = Object.keys(response.data[0]);
        setVariables(variableKeys);
      }
    } catch (error) {
      console.error("Error al obtener variables:", error);
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
      variables: prev.variables.map((v, i) =>
        i === index ? { ...v, [key]: value } : v
      ),
    }));
  };

  const handleAddComponent = async () => {
    if (!newComponent.title || newComponent.variables.length === 0) {
      alert("Debes añadir un título y al menos una variable.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("Usuario no logueado.");
        return;
      }

      const selectedDeviceObj = devices.find((device) => device.deviceId === selectedDevice);
      if (!selectedDeviceObj) {
        alert("Dispositivo no encontrado.");
        return;
      }

      const device_id = selectedDeviceObj.name;
      const subtopic = selectedSubtopic;
      const values = newComponent.variables.map((v) => v.variable);

      // Ajustar la fecha final para que sea inclusiva
      const startDate = newComponent.startDate;
      const endDate = new Date(new Date(newComponent.endDate).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // Agregar un día a la fecha final

      const response = await axios.post(
        "https://uown6aglg5.execute-api.us-east-1.amazonaws.com/mqttreport",
        {
          device_id,
          subtopic,
          user_id: userId,
          values,
          startDate,
          endDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || response.data.length === 0) {
        alert("No se encontraron datos para los parámetros proporcionados.");
        return;
      }

      // Ordenar los datos por fecha (propiedad `time`)
      const sortedData = response.data.sort((a, b) => new Date(a.time) - new Date(b.time));

      const firstItem = sortedData[0];
      if (!firstItem.time || !firstItem.values) {
        alert("La estructura de la respuesta no es la esperada.");
        return;
      }

      const labels = sortedData.map((item) => item.time);
      const datasets = newComponent.variables.map((variable) => ({
        label: variable.variable,
        data: sortedData.map((item) => item.values[variable.variable]),
        borderColor: variable.color,
        backgroundColor: `${variable.color}33`,
      }));

      const chartData = {
        labels,
        datasets,
      };

      if (isEditing) {
        const updatedComponents = [...components];
        updatedComponents[editIndex] = { ...newComponent, chartData };
        setComponents(updatedComponents);
        setIsEditing(false);
        setEditIndex(null);
      } else {
        setComponents([...components, { ...newComponent, chartData }]);
      }

      setNewComponent({
        title: "",
        variables: [],
        width: "col6",
        height: 400,
        startDate: "",
        endDate: "",
        chartType: "line", // Restablecer el tipo de gráfico por defecto
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al obtener datos de la API:", error);
      alert("Hubo un error al obtener los datos. Por favor, inténtalo de nuevo.");
    }
  };

  const handleEditComponent = (index) => {
    setNewComponent(components[index]);
    setIsEditing(true);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const captureChart = async (chartId) => {
    const chartElement = document.getElementById(chartId);
    if (chartElement) {
      const buttons = chartElement.querySelectorAll("button");
      buttons.forEach((button) => (button.style.display = "none"));

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
      });

      buttons.forEach((button) => (button.style.display = "inline-flex"));

      return canvas.toDataURL("image/png", 1.0);
    }
    return null;
  };

  const handleGeneratePDF = async () => {
    if (components.length === 0) {
      alert("No hay componentes para generar el PDF.");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const updatedComponents = await Promise.all(
        components.map(async (comp, index) => {
          const chartId = `chart-${index}`;
          const chartImage = await captureChart(chartId);
          if (!chartImage) {
            throw new Error(`No se pudo capturar el gráfico ${index + 1}`);
          }
          return { ...comp, chartImage };
        })
      );
      setPdfComponents(updatedComponents);

      const selectedDeviceName = devices.find(
        (device) => device.deviceId === selectedDevice
      )?.name;

      setShowSuccessAlert(true); // Mostrar alerta de éxito
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Generador de Reportes
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsTitleModalOpen(true)}
          style={{ marginBottom: "20px" }}
        >
          Añadir Título del PDF
        </Button>

        <Modal open={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)}>
          <div
            style={{
              backgroundColor: "white",
              margin: "50px auto",
              padding: "20px",
              width: "600px",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6">Configurar Título y Subtítulo del PDF</Typography>

            <TextField
              fullWidth
              label="Título del PDF"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              style={{ marginTop: "20px" }}
            />
            <TextField
              fullWidth
              label="Subtítulo del PDF"
              value={pdfSubtitle}
              onChange={(e) => setPdfSubtitle(e.target.value)}
              style={{ marginTop: "20px" }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsTitleModalOpen(false)}
              style={{ marginTop: "20px" }}
            >
              Guardar
            </Button>
          </div>
        </Modal>

        <FormControl fullWidth style={{ marginBottom: "20px" }}>
          <InputLabel>Seleccionar Dispositivo</InputLabel>
          <Select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {devices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchSubtopics}
          style={{ marginBottom: "20px" }}
        >
          Buscar Temas
        </Button>

        {subtopics.length > 0 && (
          <>
            <Typography variant="h6">Subtopics</Typography>
            <List>
              {subtopics.map((subtopic, index) => (
                <ListItem key={index}>
                  <Button
                    variant={selectedSubtopic === subtopic ? "contained" : "outlined"}
                    onClick={() => {
                      setSelectedSubtopic(subtopic);
                      fetchVariables(subtopic);
                    }}
                  >
                    {subtopic}
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {variables.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: "20px" }}
          >
            Añadir Componente
          </Button>
        )}

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div
            style={{
              backgroundColor: "white",
              margin: "50px auto",
              padding: "20px",
              width: "600px",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6">Configurar Componente</Typography>

            <TextField
              fullWidth
              label="Título del Componente"
              value={newComponent.title}
              onChange={(e) =>
                setNewComponent({ ...newComponent, title: e.target.value })
              }
              style={{ marginTop: "20px" }}
            />

            <FormControl fullWidth style={{ marginTop: "20px" }}>
              <InputLabel>Tipo de Gráfico</InputLabel>
              <Select
                value={newComponent.chartType}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, chartType: e.target.value })
                }
              >
                <MenuItem value="line">Línea</MenuItem>
                <MenuItem value="bar">Barras</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth style={{ marginTop: "20px" }}>
              <InputLabel>Tamaño (Columnas)</InputLabel>
              <Select
                value={newComponent.width}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, width: e.target.value })
                }
              >
                <MenuItem value="col2">Columna 2</MenuItem>
                <MenuItem value="col3">Columna 3</MenuItem>
                <MenuItem value="col4">Columna 4</MenuItem>
                <MenuItem value="col6">Columna 6</MenuItem>
                <MenuItem value="col12">Columna 12</MenuItem>
              </Select>
            </FormControl>

            {newComponent.variables.map((variable, index) => (
              <Grid container spacing={2} alignItems="center" key={index}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Variable</InputLabel>
                    <Select
                      value={variable.variable}
                      onChange={(e) => handleVariableChange(index, "variable", e.target.value)}
                    >
                      {variables.map((v, i) => (
                        <MenuItem key={i} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Color</InputLabel>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginTop: '16px',
                      gap: '10px' 
                    }}>
                      <input
                        type="color"
                        value={variable.color}
                        onChange={(e) => handleVariableChange(index, "color", e.target.value)}
                        style={{
                          width: '50px',
                          height: '50px',
                          padding: '0',
                          border: 'none'
                        }}
                      />
                      <span>{variable.color}</span>
                    </div>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => handleRemoveVariable(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddVariable}
              style={{ marginTop: "10px" }}
            >
              Añadir Variable
            </Button>

            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Filtrar por Fecha
            </Typography>
            <TextField
              label="Fecha de Inicio"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={newComponent.startDate}
              onChange={(e) => {
                console.log("Nueva startDate:", e.target.value);
                setNewComponent({ ...newComponent, startDate: e.target.value });
              }}
              style={{ marginTop: "10px" }}
            />
            <TextField
              label="Fecha de Fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={newComponent.endDate}
              onChange={(e) => {
                console.log("Nueva endDate:", e.target.value);
                setNewComponent({ ...newComponent, endDate: e.target.value });
              }}
              style={{ marginTop: "10px" }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComponent}
              style={{ marginTop: "20px" }}
            >
              {isEditing ? "Guardar Cambios" : "Guardar Componente"}
            </Button>
          </div>
        </Modal>

        {components.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <Typography variant="h6">Componentes Añadidos</Typography>
            <Grid container spacing={2}>
              {components.map((comp, index) => (
                <Grid
                  item
                  xs={
                    comp.width === "col2"
                      ? 2
                      : comp.width === "col3"
                      ? 3
                      : comp.width === "col4"
                      ? 4
                      : comp.width === "col6"
                      ? 6
                      : 12
                  }
                  key={index}
                >
                  <div style={{ height: `${comp.height}px` }} id={`chart-${index}`}>
                    {comp.chartType === "line" ? (
                      <LineChartComponent data={comp.chartData} title={comp.title} />
                    ) : (
                      <BarChartComponent data={comp.chartData} title={comp.title} />
                    )}
                    <Grid container justifyContent="flex-end" spacing={1}>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditComponent(index)}
                        >
                          Editar
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteComponent(index)}
                        >
                          Eliminar
                        </Button>
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
              ))}
            </Grid>

            <Divider style={{ margin: "20px 0" }} />

            {isGeneratingPDF && (
              <Alert severity="info" style={{ marginBottom: "20px" }}>
                Generando PDF...
              </Alert>
            )}

            {showSuccessAlert && (
              <Alert severity="success" style={{ marginBottom: "20px" }}>
                PDF generado correctamente. ¡Ya puedes descargarlo!
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generando PDF..." : "Generar Informe PDF"}
            </Button>

            {pdfComponents.length > 0 && (
              <PDFDownloadLink
                document={
                  <PDFReport
                    components={pdfComponents}
                    deviceName={devices.find((device) => device.deviceId === selectedDevice)?.name}
                    pdfTitle={pdfTitle}
                    pdfSubtitle={pdfSubtitle}
                  />
                }
                fileName="reporte.pdf"
              >
                {({ loading }) =>
                  loading ? (
                    <Button variant="contained" color="primary" disabled>
                      Descargando PDF...
                    </Button>
                  ) : (
                    <Button variant="contained" color="primary">
                      Descargar PDF
                    </Button>
                  )
                }
              </PDFDownloadLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;