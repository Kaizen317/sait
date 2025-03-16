import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Alert, CircularProgress, Tooltip } from '@mui/material';
import * as math from 'mathjs';

/**
 * Componente mejorado para mostrar una fórmula personalizada con su resultado y variables
 * @param {Object} props - Propiedades del componente
 * @param {string} props.formula - La expresión de la fórmula a evaluar
 * @param {Array} props.variables - Lista de variables disponibles
 * @param {string} props.deviceId - ID del dispositivo seleccionado
 * @param {string} props.subtopic - Subtema seleccionado
 * @param {string} props.startDate - Fecha de inicio
 * @param {string} props.endDate - Fecha de fin
 * @param {Function} props.onCalculated - Función de callback al completar el cálculo (opcional)
 * @param {boolean} props.loading - Indica si está cargando datos (opcional)
 * @param {Function} props.fetchVariableData - Función para obtener datos reales (opcional)
 */
const FormulaChartComponent = ({ 
  formula, 
  variables, 
  deviceId, 
  subtopic, 
  startDate, 
  endDate,
  onCalculated,
  loading = false,
  fetchVariableData
}) => {
  const [formulaResult, setFormulaResult] = useState({ result: '--', variables: {}, error: null });
  const [isCalculating, setIsCalculating] = useState(false);

  // Efecto para evaluar la fórmula cuando cambien las dependencias
  useEffect(() => {
    const calculateFormula = async () => {
      if (!formula || !variables || variables.length === 0) return;
      
      setIsCalculating(true);
      try {
        // Si existe una función para obtener datos reales, la usamos
        if (typeof fetchVariableData === 'function') {
          const realData = await fetchVariableData(deviceId, subtopic, startDate, endDate);
          const result = evaluateFormula(formula, variables, realData);
          setFormulaResult(result);
          
          // Notificar al componente padre del resultado si se proporciona callback
          if (typeof onCalculated === 'function') {
            onCalculated(result);
          }
        } else {
          // Caso de demostración con datos simulados
          const result = evaluateFormula(formula, variables);
          setFormulaResult(result);
          
          if (typeof onCalculated === 'function') {
            onCalculated(result);
          }
        }
      } catch (error) {
        console.error("Error al calcular la fórmula:", error);
        setFormulaResult({
          result: 'Error',
          variables: {},
          error: error.message
        });
      } finally {
        setIsCalculating(false);
      }
    };

    calculateFormula();
  }, [formula, variables, deviceId, subtopic, startDate, endDate, fetchVariableData]);

  // Función para formatear el valor numérico según su magnitud
  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    
    // Si es un número entero, no mostramos decimales
    if (Number.isInteger(Number(value))) return Number(value).toString();
    
    // Para números muy grandes o muy pequeños, usar notación científica
    if (Math.abs(value) > 1e6 || (Math.abs(value) < 1e-3 && Math.abs(value) > 0)) {
      return value.toExponential(2);
    }
    
    // Para el resto, mostrar 2 decimales
    return Number(value).toFixed(2);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      p: 2
    }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1e293b', textAlign: 'center' }}>
        Fórmula Personalizada
      </Typography>
      
      {/* Fórmula */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          width: '100%',
          maxWidth: '90%'
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'monospace', 
            backgroundColor: '#f1f5f9',
            p: 2,
            borderRadius: 1,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'left',
            fontSize: '1.1rem',
            lineHeight: 1.5
          }}
        >
          {formula || 'Sin fórmula definida'}
        </Typography>
      </Paper>
      
      {/* Resultado con estado de carga */}
      <Box sx={{ 
        p: 3, 
        backgroundColor: formulaResult.error ? '#fff1f2' : '#f0f9ff', 
        borderRadius: 3,
        border: `1px solid ${formulaResult.error ? '#fecdd3' : '#bae6fd'}`,
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 3,
        minHeight: '120px',
        justifyContent: 'center'
      }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Resultado del cálculo
        </Typography>
        
        {(loading || isCalculating) ? (
          <CircularProgress size={40} sx={{ my: 1 }} />
        ) : formulaResult.error ? (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
              Error
            </Typography>
            <Tooltip title={formulaResult.error} arrow placement="bottom">
              <Typography variant="caption" sx={{ color: '#ef4444', maxWidth: '250px', textAlign: 'center', mt: 1 }}>
                {formulaResult.error.length > 50 
                  ? `${formulaResult.error.substring(0, 50)}...` 
                  : formulaResult.error}
              </Typography>
            </Tooltip>
          </>
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0c4a6e' }}>
            {formatValue(formulaResult.result)}
          </Typography>
        )}
      </Box>
      
      {/* Variables */}
      {Object.keys(formulaResult.variables).length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: '#f8fafc', 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '600px',
            overflow: 'auto'
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569', textAlign: 'center' }}>
            Variables utilizadas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
            {Object.entries(formulaResult.variables).map(([varName, value]) => (
              <Tooltip key={varName} title={`Valor original: ${value}`} arrow placement="top">
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    minWidth: '120px'
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#6b7280' }}>
                    {varName}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                    {formatValue(value)}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Mensaje informativo cuando no hay variables */}
      {!isCalculating && !loading && Object.keys(formulaResult.variables).length === 0 && !formulaResult.error && (
        <Alert severity="info" sx={{ mt: 2, width: '100%', maxWidth: '500px' }}>
          No se detectaron variables en la fórmula o no coinciden con las variables disponibles.
        </Alert>
      )}
    </Box>
  );
};

/**
 * Evalúa una fórmula matemática con las variables proporcionadas de forma segura
 * @param {string} formula - La expresión de la fórmula a evaluar
 * @param {Array} availableVariables - Lista de variables disponibles
 * @param {Object} realData - Datos reales de las variables (opcional)
 * @returns {Object} - Resultado de la evaluación y variables utilizadas
 */
const evaluateFormula = (formula, availableVariables, realData = null) => {
  try {
    if (!formula) {
      throw new Error("No se ha proporcionado una fórmula");
    }
    
    // Creamos un objeto para almacenar los valores de las variables
    const variableValues = {};
    
    // Extraemos todas las variables mencionadas en la fórmula
    const variablePattern = /[a-zA-Z][a-zA-Z0-9_]*/g;
    const mentionedVariables = Array.from(new Set(formula.match(variablePattern) || []));
    
    // Filtramos para quedarnos solo con las variables disponibles
    const validVariables = mentionedVariables.filter(varName => 
      availableVariables.includes(varName) &&
      !['sin', 'cos', 'tan', 'sqrt', 'log', 'exp', 'pi', 'e'].includes(varName) // Excluimos funciones matemáticas
    );
    
    if (validVariables.length === 0) {
      throw new Error("No se encontraron variables válidas en la fórmula");
    }
    
    // Asignamos valores a cada variable
    validVariables.forEach(varName => {
      if (realData && realData[varName] !== undefined) {
        // Usamos datos reales si están disponibles
        variableValues[varName] = realData[varName];
      } else {
        // Valor aleatorio entre 1 y 100 con 2 decimales para demostración
        variableValues[varName] = Math.round((Math.random() * 100) * 100) / 100;
      }
    });
    
    // Creamos un contexto seguro para la evaluación con mathjs
    const mathScope = { ...variableValues };
    
    // Evaluamos la fórmula de forma segura con mathjs
    const result = math.evaluate(formula, mathScope);
    
    return {
      result: result,
      variables: variableValues,
      error: null
    };
  } catch (error) {
    console.error("Error al evaluar la fórmula:", error);
    return {
      result: null,
      error: error.message,
      variables: {}
    };
  }
};

export default FormulaChartComponent;