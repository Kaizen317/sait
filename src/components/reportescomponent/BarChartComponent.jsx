import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { es } from 'date-fns/locale';

// Desactivar las etiquetas de datos globalmente para este tipo de gráfico
import { Chart as ChartJS } from 'chart.js';
ChartJS.defaults.plugins.datalabels = { display: false };

const BarChartComponent = ({ 
  data, 
  title,
  showTitle = true 
}) => {
  console.log("Datos recibidos en BarChartComponent:", data);

  if (!data || !data.labels || !data.datasets) {
    return <div>No hay datos disponibles para mostrar.</div>;
  }

  // Preparar los datos para el gráfico
  const chartData = {
    labels: data.labels.map(label => {
      try {
        const date = new Date(label);
        if (isNaN(date.getTime())) {
          return label;
        }
        return date.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return label;
      }
    }),
    datasets: data.datasets.map((dataset, index) => {
      // Definir colores más oscuros para cada dataset
      let backgroundColor;
      let borderColor;
      
      if (dataset.backgroundColor) {
        backgroundColor = dataset.backgroundColor;
      } else {
        // Usar colores predefinidos más oscuros según el índice
        switch (index % 3) {
          case 0:
            backgroundColor = 'rgba(54, 162, 235, 1)'; // Azul sin opacidad
            borderColor = 'rgba(25, 118, 210, 1)';
            break;
          case 1:
            backgroundColor = 'rgba(75, 192, 192, 1)'; // Verde sin opacidad
            borderColor = 'rgba(46, 139, 87, 1)';
            break;
          case 2:
            backgroundColor = 'rgba(255, 159, 64, 1)'; // Naranja sin opacidad
            borderColor = 'rgba(230, 126, 34, 1)';
            break;
          default:
            backgroundColor = 'rgba(54, 162, 235, 1)';
            borderColor = 'rgba(25, 118, 210, 1)';
        }
      }
      
      return {
        ...dataset,
        backgroundColor: backgroundColor,
        borderColor: dataset.borderColor || borderColor,
        borderWidth: 1,
        // Desactivar las etiquetas de datos para este dataset específico
        datalabels: {
          display: false
        }
      };
    })
  };

  // Reducir el número de etiquetas si hay demasiadas
  const skipLabels = data.labels.length > 10;

  return (
    <div
      style={{
        width: "100%",
        height: "700px", // Altura fija de 700px según preferencia del usuario
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {showTitle && (
        <h3
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "10px",
            color: "#444",
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: "0.5px",
            fontWeight: "bold",
          }}
        >
          {title}
        </h3>
      )}

      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#ccc',
              borderWidth: 1,
              padding: 10,
              boxPadding: 3,
              cornerRadius: 4,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                title: function(tooltipItems) {
                  const item = tooltipItems[0];
                  const label = item.label;
                  try {
                    // Si es una fecha en formato ISO, la formateamos
                    const date = new Date(label);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      });
                    }
                  } catch (e) {
                    // Si hay error, devolvemos el label original
                  }
                  return label;
                }
              }
            },
            // Desactivar explícitamente las etiquetas de datos
            datalabels: {
              display: false
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                padding: 10,
                font: {
                  size: 12
                },
                color: '#666',
                callback: function(value, index, ticks) {
                  // Mostrar solo algunas etiquetas para evitar compresión
                  if (skipLabels && index % Math.ceil(ticks.length / 8) !== 0) {
                    return '';
                  }
                  return chartData.labels[index];
                }
              },
              grid: {
                display: false
              },
              afterFit: function(scale) {
                // Aumentar el espacio para las etiquetas según preferencia del usuario
                scale.height = 120;
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                padding: 10,
                font: {
                  size: 12
                },
                color: '#666',
                callback: function(value) {
                  if (value % 1 === 0) {
                    return value;
                  }
                  return value.toFixed(2);
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          },
          animation: {
            duration: 1000
          },
          layout: {
            padding: {
              top: 5,
              right: 15,
              bottom: 5,
              left: 15
            }
          },
          elements: {
            bar: {
              borderRadius: 4
            }
          }
        }}
      />
    </div>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.object,
  title: PropTypes.string,
  showTitle: PropTypes.bool
};

export default BarChartComponent;