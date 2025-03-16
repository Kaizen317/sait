import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  Fade,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FunctionsIcon from "@mui/icons-material/Functions";
import CalculateIcon from "@mui/icons-material/Calculate";
import SpeedIcon from "@mui/icons-material/Speed";
import axios from "axios";
import { evaluate } from "mathjs"; // Necesitamos instalar mathjs para evaluar fórmulas
import { MqttContext } from "./MqttContext";

const FormulaComponent = ({ componentData, userId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [variableValues, setVariableValues] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { mqttData, subscribeToTopic, initialDataLoaded } = useContext(MqttContext);

  const {
    componentName,
    variables,
    formula,
    formulaDisplayType = "number",
    formulaMin = 0,
    formulaMax = 100,
    formulaUnit = "",
    height = 375,
  } = componentData;

  // Función para evaluar la fórmula con los valores actuales
  const evaluateFormula = (values) => {
    if (Object.keys(values).length > 0 && formula) {
      try {
        const calculatedResult = evaluate(formula, values);
        setResult(calculatedResult);
        return calculatedResult;
      } catch (evalError) {
        console.error("Error al evaluar la fórmula:", evalError);
        setError(`Error al evaluar la fórmula: ${evalError.message}`);
        return null;
      }
    } else {
      console.warn("No hay suficientes datos para calcular la fórmula");
      setError("No hay suficientes datos para calcular la fórmula");
      return null;
    }
  };

  // Función para procesar un mensaje MQTT
  const processMqttMessage = (currentMqttData) => {
    try {
      if (!variables || variables.length === 0) return;
      
      const newValues = { ...variableValues };
      let dataUpdated = false;
      
      // Procesar cada variable
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        if (!variable.variable || !variable.value) continue;
        
        const topic = variable.variable;
        const valueKey = variable.value;
        
        // Verificar si hay datos para este tópico
        const topicData = currentMqttData[topic];
        if (!topicData || !topicData.values) continue;
        
        // Intentar obtener el valor de diferentes maneras
        let rawValue = null;
        
        // Método 1: Acceso directo
        if (topicData.values[valueKey] !== undefined) {
          const values = topicData.values[valueKey];
          rawValue = Array.isArray(values) ? values[values.length - 1] : values;
        } 
        // Método 2: Buscar en todas las claves
        else {
          const keys = Object.keys(topicData.values);
          
          // Buscar claves que contengan el valor buscado
          const matchingKey = keys.find(key => 
            key.toLowerCase().includes(valueKey.toLowerCase())
          );
          
          if (matchingKey) {
            const values = topicData.values[matchingKey];
            rawValue = Array.isArray(values) ? values[values.length - 1] : values;
          }
        }
        
        // Si se encontró un valor, procesarlo
        if (rawValue !== null) {
          // Convertir a número y manejar posibles valores no numéricos
          const numericValue = typeof rawValue === 'string' 
            ? parseFloat(rawValue.replace(',', '.')) 
            : parseFloat(rawValue);
          
          // Guardar el valor como var1, var2, etc.
          if (!isNaN(numericValue)) {
            newValues[`var${i + 1}`] = numericValue;
            dataUpdated = true;
          }
        }
      }
      
      // Solo actualizar los valores si se encontraron datos nuevos
      if (dataUpdated) {
        setVariableValues(newValues);
        
        // Evaluar la fórmula con los valores obtenidos
        evaluateFormula(newValues);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error al procesar datos MQTT:", error);
    }
  };

  // Efecto para suscribirse a los tópicos y procesar mensajes MQTT
  useEffect(() => {
    if (!variables || variables.length === 0) return;
    
    // Suscribirse a todos los tópicos
    variables.forEach(variable => {
      if (variable.variable) {
        subscribeToTopic(variable.variable);
      }
    });
    
    // Iniciar el componente
    setLoading(false);
  }, [variables, subscribeToTopic]);

  // Efecto para procesar cambios en mqttData
  useEffect(() => {
    if (Object.keys(mqttData).length > 0 && variables && variables.length > 0) {
      processMqttMessage(mqttData);
    }
  }, [mqttData, variables]);

  // Renderizar el componente según el tipo de visualización
  const renderDisplayComponent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <CircularProgress sx={{ color: "#8b5cf6" }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: "center", color: "error.main", p: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      );
    }

    if (result === null) {
      return (
        <Box sx={{ textAlign: "center", color: "text.secondary", p: 2 }}>
          <Typography variant="body2">No hay datos disponibles</Typography>
        </Box>
      );
    }

    // Formatear el resultado para mostrar solo 2 decimales
    const formattedResult = typeof result === 'number' ? result.toFixed(2) : result;

    switch (formulaDisplayType) {
      case "gauge":
        return renderGauge(formattedResult);
      case "card":
        return renderCard(formattedResult);
      case "number":
      default:
        return renderNumber(formattedResult);
    }
  };

  // Renderizar como número grande
  const renderNumber = (value) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 3,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: "#8b5cf6",
            textAlign: "center",
          }}
        >
          {value !== null && value !== undefined ? value : "Sin datos"}
          <Typography
            component="span"
            variant="h5"
            sx={{ color: alpha("#8b5cf6", 0.7), ml: 1 }}
          >
            {formulaUnit}
          </Typography>
        </Typography>
        
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 2, textAlign: "center" }}
        >
          Fórmula: {formula}
        </Typography>
        
        {/* Información de depuración */}
        <Box sx={{ mt: 2, p: 1, bgcolor: alpha("#f3f4f6", 0.5), borderRadius: 1, width: '100%' }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            Variables disponibles:
          </Typography>
          {Object.keys(variableValues).length > 0 ? (
            Object.entries(variableValues).map(([key, val]) => (
              <Typography key={key} variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                {key}: {val}
              </Typography>
            ))
          ) : (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              No hay variables disponibles
            </Typography>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: result !== null ? 'success.main' : 'error.main' }}>
            Resultado: {result !== null ? result : "No calculado"}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Renderizar como medidor
  const renderGauge = (value) => {
    // Asegurar que los valores mínimos y máximos son números válidos
    const min = formulaMin !== undefined && !isNaN(parseFloat(formulaMin)) 
      ? parseFloat(formulaMin) 
      : 0;
    
    const max = formulaMax !== undefined && !isNaN(parseFloat(formulaMax)) 
      ? parseFloat(formulaMax) 
      : 100;
    
    // Asegurar que el valor es un número válido
    const numValue = !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    
    // Calcular el porcentaje (asegurar que está entre 0 y 100)
    const percentage = Math.min(100, Math.max(0, ((numValue - min) / (max - min)) * 100)) || 0;
    
    // Determinar el color según el porcentaje
    let color = "#22c55e"; // Verde para valores altos
    if (percentage < 33) {
      color = "#ef4444"; // Rojo para valores bajos
    } else if (percentage < 66) {
      color = "#f59e0b"; // Amarillo para valores medios
    }
    
    // Calcular el ángulo para la aguja (de -90 a 90 grados)
    const angle = (percentage * 1.8) - 90;
    
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 2,
        }}
      >
        {/* Medidor */}
        <Box sx={{ position: "relative", width: "200px", height: "120px", mb: 3 }}>
          {/* Semicírculo de fondo */}
          <svg width="200" height="120" viewBox="0 0 200 120">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            
            {/* Fondo gris */}
            <path 
              d="M10,110 A90,90 0 0,1 190,110" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="10" 
              strokeLinecap="round"
            />
            
            {/* Arco de valor */}
            <path 
              d="M10,110 A90,90 0 0,1 190,110" 
              fill="none" 
              stroke="url(#gaugeGradient)" 
              strokeWidth="10" 
              strokeLinecap="round"
              strokeDasharray={`${percentage * 3.14}, 314`}
            />
            
            {/* Marcas de graduación */}
            <path d="M10,110 L10,95" stroke="#9ca3af" strokeWidth="2" />
            <path d="M55,75 L50,62" stroke="#9ca3af" strokeWidth="2" />
            <path d="M100,65 L100,50" stroke="#9ca3af" strokeWidth="2" />
            <path d="M145,75 L150,62" stroke="#9ca3af" strokeWidth="2" />
            <path d="M190,110 L190,95" stroke="#9ca3af" strokeWidth="2" />
            
            {/* Textos de mínimo, medio y máximo */}
            <text x="10" y="125" fontSize="10" textAnchor="middle" fill="#6b7280">{min}</text>
            <text x="100" y="45" fontSize="10" textAnchor="middle" fill="#6b7280">{((max - min) / 2) + min}</text>
            <text x="190" y="125" fontSize="10" textAnchor="middle" fill="#6b7280">{max}</text>
            
            {/* Aguja */}
            <line 
              x1="100" 
              y1="110" 
              x2="100" 
              y2="30" 
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle}, 100, 110)`}
            />
            
            {/* Círculo central */}
            <circle cx="100" cy="110" r="8" fill={color} />
          </svg>
        </Box>
        
        {/* Valor */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color,
            textAlign: "center",
            mt: 1,
          }}
        >
          {value}
          <Typography
            component="span"
            variant="h6"
            sx={{ color: alpha(color, 0.7), ml: 1 }}
          >
            {formulaUnit}
          </Typography>
        </Typography>
        
        {/* Etiqueta de la fórmula */}
        <Typography
          variant="body2"
          sx={{ 
            color: "text.secondary", 
            mt: 1, 
            textAlign: "center",
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {formula}
        </Typography>
      </Box>
    );
  };

  // Renderizar como tarjeta
  const renderCard = (value) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 4,
            p: 4,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            width: "80%",
            textAlign: "center",
          }}
        >
          <FunctionsIcon
            sx={{
              fontSize: 48,
              color: "#8b5cf6",
              mb: 2,
            }}
          />
          
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 1,
            }}
          >
            {value}
            <Typography
              component="span"
              variant="h6"
              sx={{ color: alpha("#1f2937", 0.7), ml: 1 }}
            >
              {formulaUnit}
            </Typography>
          </Typography>
          
          <Typography
            variant="body1"
            sx={{ color: "#6b7280", fontWeight: 500 }}
          >
            {formula}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}>
            {Object.entries(variableValues).map(([key, val]) => (
              <Tooltip key={key} title={`${key} = ${val}`}>
                <Box
                  sx={{
                    bgcolor: alpha("#8b5cf6", 0.1),
                    color: "#8b5cf6",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {key}: {val}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Fade in timeout={800}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: 2,
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FunctionsIcon sx={{ mr: 1, color: "#8b5cf6" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {componentName || "Fórmula personalizada"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Indicador de conexión MQTT */}
              <Tooltip
                title={Object.keys(mqttData).length > 0 ? "Conectado en tiempo real" : "Sin conexión en tiempo real"}
                arrow
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: Object.keys(mqttData).length > 0 ? "success.main" : "error.main",
                    mr: 1,
                    transition: "background-color 0.3s",
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 2,
              textAlign: "right",
            }}
          >
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Box
            sx={{
              height: "calc(100% - 80px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderDisplayComponent()}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default FormulaComponent;
