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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios"; // Importa axios para hacer las peticiones HTTP

// Valores iniciales predeterminados
const initialVariableState = {
  variable: "", // Para el topic
  value: "", // Para el value (potencia, corriente, etc.)
  color: "#36a2eb",
  backgroundColor: "rgba(54, 162, 235, 0.7)",
  borderColor: "#36a2eb",
};

const initialState = {
  chartType: "LineChart",
  componentName: "",
  variables: [initialVariableState], // Lista de variables
  colSize: "col12", // Cambiado a col12 por defecto para más espacio
  height: 600, // Altura aumentada para mejor visualización
};

const ChartConfigModal = ({ open, onClose, onSave, initialData, userId: propUserId }) => {
  const userId = propUserId || localStorage.getItem("userId"); // Obtener el userId desde props o localStorage
  const [formState, setFormState] = useState(initialState);
  const [availableTopics, setAvailableTopics] = useState([]); // Estado para almacenar los topics
  const [availableValues, setAvailableValues] = useState([]); // Estado para almacenar los values

  useEffect(() => {
    if (open) {
      console.log("UserId logueado:", userId); // Imprime el userId en la consola
      setFormState(initialData || initialState);

      const fetchTopics = async () => {
        try {
          const response = await axios.get(
            `https://uown6aglg5.execute-api.us-east-1.amazonaws.com/getmqttmessages?userId=${userId}`
          );
      
          console.log("API Response:", response.data); // Depuración: Verificar la respuesta de la API
      
          if (response.data.length === 0) {
            console.warn("No se encontraron topics para el userId proporcionado.");
            setAvailableTopics([]); // Limpiar los topics si no hay datos
            return;
          }
      
          // Extraer los temas de los registros y eliminar duplicados
          const topics = response.data.map((record) => record.topic);
          const uniqueTopics = [...new Set(topics)]; // Eliminar duplicados usando Set
          console.log("Extracted Topics (sin duplicados):", uniqueTopics); // Depuración: Verificar los temas únicos
      
          setAvailableTopics(uniqueTopics); // Almacenar los topics únicos en el estado
        } catch (error) {
          console.error("Error fetching topics:", error); // Depuración: Verificar errores en la petición
        }
      };
      fetchTopics();
    }
  }, [open, initialData, userId]);

  // Función para obtener los values de un topic seleccionado
  const fetchValuesForTopic = async (topic) => {
    try {
      const response = await axios.get(
        `https://uown6aglg5.execute-api.us-east-1.amazonaws.com/getmqttmessages?userId=${userId}`
      );

      console.log("API Response (Values):", response.data);

      if (!response.data || response.data.length === 0) {
        console.warn("No se encontraron values para el topic proporcionado.");
        setAvailableValues([]);
        return;
      }

      // Filtrar los registros por el topic seleccionado y obtener el último registro
      const recordsForTopic = response.data.filter((record) => record.topic === topic);
      const lastRecord = recordsForTopic[recordsForTopic.length - 1];

      if (!lastRecord || !lastRecord.values) {
        console.warn("No se encontraron valores en el último registro");
        setAvailableValues([]);
        return;
      }

      console.log("Último registro para el topic:", lastRecord);

      // Extraer las claves del objeto values
      const values = Object.keys(lastRecord.values);
      console.log("Values extraídos:", values);

      setAvailableValues(values);
    } catch (error) {
      console.error("Error fetching values:", error);
      setAvailableValues([]);
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
        // Si se está actualizando el color, actualizar también backgroundColor y borderColor
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

    // Si se cambia el topic, obtener los values asociados
    if (field === "variable") {
      fetchValuesForTopic(value);
    }
  };

  // Función para convertir color hex a rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleAddVariable = () => {
    setFormState((prev) => ({
      ...prev,
      variables: [...prev.variables, initialVariableState],
    }));
  };

  const handleRemoveVariable = (index) => {
    const updatedVariables = formState.variables.filter((_, i) => i !== index);
    setFormState((prev) => ({ ...prev, variables: updatedVariables }));
  };

  const handleSave = () => {
    onSave(formState); // Guardar los datos del formulario
    setFormState(initialState); // Reiniciar el formulario
  };

  const chartTypes = [
    { value: "LineChart", label: "Gráfico de Línea" },
    { value: "AreaChart", label: "Gráfico de Área" },
    { value: "BarChart", label: "Gráfico de Barras" },
    { value: "StackedBarChart", label: "Gráfico de Barras Apiladas" }, // Nueva opción
    { value: "PieChart", label: "Gráfico de Torta" },
    { value: "DoughnutChart", label: "Gráfico de Dona" },
    { value: "GaugeChart", label: "Medidor" },
    { value: "ValueCard", label: "Tarjeta de Valor" },
    { value: "MixedChart", label: "Gráfico Mixto (Barra y Línea)" },
     { value: "BubbleChart", label: "Gráfico de Burbujas" },
    { value: "RadarChart", label: "Gráfico de Radar" },
    { value: "ScatterChart", label: "Gráfico de Dispersión" },
    { value: "BarHistorico", label: "Gráfico de Barras Histórico" } ,
    { value: "LineHistorico", label: "Gráfico de Linea Histórico" } 

  ];
  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          margin: "auto",
          maxWidth: "800px", // Aumentar el ancho del modal
          borderRadius: "8px",
        }}
      >
        <h2>Configurar Componente</h2>
        <TextField
          label="Nombre del Componente"
          name="componentName"
          fullWidth
          margin="normal"
          value={formState.componentName}
          onChange={handleInputChange}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Gráfico</InputLabel>
          <Select
            value={formState.chartType}
            onChange={(e) => setFormState({ ...formState, chartType: e.target.value })}
            label="Tipo de Gráfico"
          >
            <MenuItem value="LineChart">Gráfico de Líneas</MenuItem>
            <MenuItem value="BarChart">Gráfico de Barras</MenuItem>
            <MenuItem value="BarHistorico">Gráfico de Barras Histórico</MenuItem>
             <MenuItem value="LineHistorico">Gráfico de Linea Histórico</MenuItem>
            <MenuItem value="PieChart">Gráfico Circular</MenuItem>
            <MenuItem value="DoughnutChart">Gráfico de Dona</MenuItem>
            <MenuItem value="GaugeChart">Medidor</MenuItem>
            <MenuItem value="ValueCard">Tarjeta de Valor</MenuItem>
            <MenuItem value="AreaChart">Gráfico de Área</MenuItem>
            <MenuItem value="MixedChart">Gráfico Mixto</MenuItem>
            <MenuItem value="StackedBarChart">Gráfico de Barras Apiladas</MenuItem>
          </Select>
        </FormControl>

        {formState.chartType === "BarHistorico" && (
          <FormControl fullWidth style={{ marginBottom: "20px" }}>
            <InputLabel>Altura del Gráfico</InputLabel>
            <Select
              value={formState.height}
              onChange={(e) => setFormState({ ...formState, height: e.target.value })}
              label="Altura del Gráfico"
            >
              <MenuItem value={400}>400px</MenuItem>
              <MenuItem value={500}>500px</MenuItem>
              <MenuItem value={600}>600px</MenuItem>
              <MenuItem value={700}>700px</MenuItem>
            </Select>
          </FormControl>
        )}

        {formState.variables.map((variable, index) => (
          <Grid container spacing={2} alignItems="center" key={index}>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Topic</InputLabel>
                <Select
                  value={variable.variable}
                  onChange={(e) =>
                    handleVariableChange(index, "variable", e.target.value)
                  }
                  disabled={availableTopics.length === 0}
                >
                  {availableTopics.length === 0 ? (
                    <MenuItem disabled>No hay topics disponibles</MenuItem>
                  ) : (
                    availableTopics.map((topic, topicIndex) => (
                      <MenuItem key={topicIndex} value={topic}>
                        {topic}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Value</InputLabel>
                <Select
                  value={variable.value}
                  onChange={(e) => handleVariableChange(index, "value", e.target.value)}
                  disabled={!variable.variable || availableValues.length === 0}
                >
                  {!variable.variable ? (
                    <MenuItem disabled>Seleccione primero un topic</MenuItem>
                  ) : availableValues.length === 0 ? (
                    <MenuItem disabled>No hay valores disponibles</MenuItem>
                  ) : (
                    availableValues.map((value, valueIndex) => (
                      <MenuItem key={valueIndex} value={value}>
                        {value}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <TextField
                type="color"
                label="Color"
                value={variable.color || "#36a2eb"}
                onChange={(e) => handleVariableChange(index, "color", e.target.value)}
                fullWidth
                style={{ marginTop: "16px" }}
              />
            </Grid>
            {/* Selector de tipo de gráfico (solo para gráficos mixtos) */}
            {formState.chartType === "MixedChart" && (
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={variable.type || "bar"}
                    onChange={(e) => handleVariableChange(index, "type", e.target.value)}
                  >
                    <MenuItem value="bar">Barra</MenuItem>
                    <MenuItem value="line">Línea</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveVariable(index)}
                disabled={formState.variables.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVariable}
          style={{ marginTop: "10px", marginBottom: "10px" }}
        >
          Añadir Variable
        </Button>

        <FormControl fullWidth margin="normal">
          <InputLabel>Tamaño de Columna</InputLabel>
          <Select
            name="colSize"
            value={formState.colSize}
            onChange={handleInputChange}
          >
            <MenuItem value="col2">1/6 (col2)</MenuItem>
            <MenuItem value="col3">1/4 (col3)</MenuItem>
            <MenuItem value="col4">1/3 (col4)</MenuItem>
            <MenuItem value="col6">1/2 (col6)</MenuItem>
            <MenuItem value="col12">Completo (col12)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Altura del Gráfico (px)"
          name="height"
          type="number"
          fullWidth
          margin="normal"
          value={formState.height || ''}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              height: e.target.value ? parseInt(e.target.value, 10) : '',
            }))
          }
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          style={{ marginTop: "20px" }}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  );
};

export default ChartConfigModal