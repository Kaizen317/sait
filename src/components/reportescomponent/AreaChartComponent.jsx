import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import 'chartjs-adapter-date-fns';
import { es } from 'date-fns/locale';

// Desactivar las etiquetas de datos globalmente para este tipo de gráfico
ChartJS.defaults.plugins.datalabels = { display: false };
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AreaChartComponent = ({ data, title, showTitle = true }) => {
  console.log("Datos recibidos en AreaChartComponent:", data);

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
        // Formato completo para las etiquetas según preferencia del usuario
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
      console.log("Dataset recibido en AreaChartComponent:", dataset); // Para depuración
      
      return {
        ...dataset,
        fill: true, // Esto hace que sea un gráfico de área
        // Usar los colores del dataset si existen, de lo contrario usar colores predeterminados
        backgroundColor: dataset.backgroundColor || `rgba(${index === 0 ? '75, 192, 192' : index === 1 ? '54, 162, 235' : '255, 159, 64'}, 0.2)`,
        borderColor: dataset.borderColor || `rgba(${index === 0 ? '75, 192, 192' : index === 1 ? '54, 162, 235' : '255, 159, 64'}, 1)`,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.2,
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

      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2.5, // Hacer el gráfico más ancho que alto
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 15,
                padding: 20,
                font: {
                  size: 13,
                  weight: 'bold'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#ccc',
              borderWidth: 1,
              padding: 12,
              boxPadding: 5,
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
                  const index = item.dataIndex;
                  try {
                    // Mostrar la fecha completa en el tooltip
                    const date = new Date(data.labels[index]);
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
                  return item.label;
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
                padding: 15,
                autoSkip: true,
                maxTicksLimit: 8,
                font: {
                  size: 12,
                  weight: 'bold'
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
                padding: 15,
                font: {
                  size: 12,
                  weight: 'bold'
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
          elements: {
            line: {
              tension: 0.2 // Suaviza las líneas
            },
            point: {
              // Configuración adicional para los puntos
              radius: 4,
              hoverRadius: 7,
              // Desactivar las etiquetas en los puntos
              drawLabels: false
            }
          }
        }}
      />
    </div>
  );
};

AreaChartComponent.propTypes = {
  data: PropTypes.object,
  title: PropTypes.string,
  showTitle: PropTypes.bool
};

export default AreaChartComponent;
