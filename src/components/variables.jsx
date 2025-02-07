import React, { useState, useEffect } from "react";
import NavBar from "./Navbar";
import mqtt from "mqtt";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  },
}));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // Puedes personalizar el formato según tus necesidades
};

const Variables = () => {
  const [topics, setTopics] = useState([]);
  const [mqttData, setMqttData] = useState({}); // Eliminamos el uso de localStorage
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const apiBaseUrl = "https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices";
  const apiGatewayUrl = "https://uown6aglg5.execute-api.us-east-1.amazonaws.com/mqtt";

  // Obtener los topics del usuario
  useEffect(() => {
    const fetchTopics = async () => {
      if (!userId) {
        setSnackbarMessage("El usuario no está logueado.");
        setSnackbarOpen(true);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          setSnackbarMessage(`Error: ${errorData.error || "No se pudieron cargar los topics."}`);
          setSnackbarOpen(true);
          return;
        }

        const data = await response.json();
        const userTopics = data.devices.map((device) => device.topic);
        setTopics(userTopics);
        console.log("Topics obtenidos:", userTopics); // Log para depuración
      } catch (error) {
        setSnackbarMessage("Hubo un error al conectar con el servidor.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [userId]);

  useEffect(() => {
    const fetchMqttMessages = async () => {
      if (!userId) {
        setSnackbarMessage("El usuario no está logueado.");
        setSnackbarOpen(true);
        return;
      }

      try {
        const response = await fetch(
          `https://lboepfo1w8.execute-api.us-east-1.amazonaws.com/mqtttablavariables?userId=${userId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          setSnackbarMessage(`Error al obtener datos: ${errorData.message}`);
          setSnackbarOpen(true);
          return;
        }

        const data = await response.json();
        console.log("Datos obtenidos de la API:", data); // Log para depuración

        // Verificar si data es un objeto y no está vacío
        if (data && Object.keys(data).length > 0) {
          setMqttData(data); // Actualizar el estado con los datos organizados
        } else {
          setSnackbarMessage("No se encontraron datos para el usuario.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error obteniendo datos de la API:", error);
        setSnackbarMessage("Error obteniendo datos de la base de datos.");
        setSnackbarOpen(true);
      }
    };

    fetchMqttMessages();
  }, [userId]);

  // Validar el formato del mensaje MQTT
  const validateMessageFormat = (message) => {
    try {
      if (
        typeof message.device_id === "string" &&
        typeof message.subtopic === "string" &&
        typeof message.values === "object" &&
        typeof message.time === "string"
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  // Enviar datos al API Gateway
  const sendToApiGateway = async (dataArray) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Usuario no logueado");
      }

      const payload = dataArray.map((data) => ({
        ...data,
        userId,
        topic: data.topic,
      }));

      console.log("Payload enviado a la Lambda:", payload); // Log para depuración

      const response = await fetch(apiGatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Datos enviados correctamente a la Lambda");
      } else {
        console.error("Error al enviar datos a la Lambda:", response.statusText);
        const errorDetails = await response.json();
        console.error("Detalles del error:", errorDetails);
      }
    } catch (error) {
      console.error("Error en la solicitud al API Gateway:", error);
    }
  };

  // Conectar al broker MQTT y suscribirse a los topics
  useEffect(() => {
    if (topics.length === 0) return;

    const client = mqtt.connect("ws://44.219.190.124:8093/mqtt", {
      clientId: `mqtt_client_${Math.random().toString(16).slice(2)}`,
    });

    client.on("connect", () => {
      console.log("Conectado al broker MQTT");

      topics.forEach((topic) => {
        const validTopic = topic.endsWith("#") ? topic : `${topic}#`;
        client.subscribe(validTopic, (err) => {
          if (err) {
            console.error(`Error al suscribirse al topic ${validTopic}:`, err);
          } else {
            console.log(`Suscrito al topic: ${validTopic}`);
          }
        });
      });
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log("Mensaje MQTT recibido:", parsedMessage); // Log para depuración

        if (validateMessageFormat(parsedMessage)) {
          const { device_id, subtopic, values, time } = parsedMessage;

          setMqttData((prevData) => {
            const updatedData = {
              ...prevData, // Conserva todos los dispositivos y subtopics existentes
              [device_id]: {
                ...(prevData[device_id] || {}), // Conserva los subtopics existentes del dispositivo
                [subtopic]: { values, time }, // Actualiza o añade el nuevo subtopic
              },
            };

            console.log("Datos actualizados en el estado:", updatedData); // Log para depuración
            return updatedData;
          });

          sendToApiGateway([{ ...parsedMessage, topic }]);
        } else {
          setSnackbarMessage("Formato de mensaje no válido");
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage("Error procesando mensaje MQTT");
        setSnackbarOpen(true);
        console.error("Error procesando mensaje MQTT:", error);
      }
    });

    client.on("error", (err) => {
      console.error("Error en cliente MQTT:", err);
    });

    return () => {
      client.end();
    };
  }, [topics]);

  // Eliminar un dispositivo
  const handleDeleteDevice = async (deviceId) => {
    try {
      // Enviar una solicitud a la API para eliminar el dispositivo de la base de datos
      const response = await fetch(
        `https://uown6aglg5.execute-api.us-east-1.amazonaws.com/deletedevice?userId=${userId}&deviceId=${deviceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbarMessage(`Error al eliminar el dispositivo: ${errorData.message}`);
        setSnackbarOpen(true);
        return;
      }

      // Actualizar el estado local
      setMqttData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[deviceId];
        return updatedData;
      });

      setSnackbarMessage("Dispositivo eliminado correctamente.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error eliminando el dispositivo:", error);
      setSnackbarMessage("Error eliminando el dispositivo.");
      setSnackbarOpen(true);
    }
  };

  // Cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-6" style={{ marginLeft: "250px" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(mqttData).map(([deviceId, subtopics], index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <StyledCard>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5" style={{ fontWeight: "bold" }}>
                        {deviceId}
                      </Typography>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteDevice(deviceId)}
                        size="small"
                        style={{ color: "red" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box style={{ maxHeight: "200px", overflowY: "auto", marginTop: "16px" }}>
                      {Object.entries(subtopics).map(([subtopic, { values, time }], subIndex) => (
                        <Box key={subIndex} style={{ marginBottom: "8px" }}>
                          <Typography>
                            <strong>{subtopic}:</strong> {JSON.stringify(values)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(time)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Variables;