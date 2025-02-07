import React, { useState, useEffect, useContext, forwardRef } from "react";
import axios from "axios";
import Sidebar from "./Navbar";
import {
  Button,
  Typography,
  Modal,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
  TablePagination,
  FormControl,
  Select,
  InputLabel,
  Box,
  Chip,
  CircularProgress,
  Slider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { MqttContext } from "./MqttContext";
import { styled } from '@mui/material/styles';
import CorreoAlarmaModal from './CorreoAlarmaModal';

// Estilos para las notificaciones de alarma
const AlarmNotification = styled('div')(({ severity }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  zIndex: 1000,
  animation: 'slideIn 0.3s ease-out',
  backgroundColor: severity === 'alta' ? '#f44336' : 
                  severity === 'media' ? '#ff9800' : 
                  severity === 'baja' ? '#2196f3' : '#666',
  color: 'white',
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
}));

// Estados iniciales
const Alarmas = () => {
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const [alarms, setAlarms] = useState([]); // Lista de alarmas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlarm, setNewAlarm] = useState({
    name: "",
    description: "",
    subtopic: "",
    variable: "",
    condition: "",
    valueType: "number",
    value: "",
    compareVariable: "",
    severity: "" 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [errors, setErrors] = useState({});
  const [filterSeverity, setFilterSeverity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [variables, setVariables] = useState([]);
  const [topicConcatenado, setTopicConcatenado] = useState('');
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [mqttTopics, setMqttTopics] = useState([]); // Lista de topics MQTT
  const [threshold, setThreshold] = useState(50); // Umbral del slider
  const [showSubtopics, setShowSubtopics] = useState(false);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [highlightedAlarms, setHighlightedAlarms] = useState([]);
  const [lastSentTimes, setLastSentTimes] = useState({});
  const [sendingEmails, setSendingEmails] = useState({});
  const apiBaseUrl = 'https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices';

  const userId = localStorage.getItem('userId');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const [emailRecipients, setEmailRecipients] = useState([]); // New state for email recipients
  const [isCorreoModalOpen, setIsCorreoModalOpen] = useState(false);
  const [alertShown, setAlertShown] = useState(false); // New state to track if SweetAlert has been shown
  const [isEmailsModalOpen, setIsEmailsModalOpen] = useState(false);
  const [configuredEmails, setConfiguredEmails] = useState([]);
  const [editEmailData, setEditEmailData] = useState(null);

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Función para obtener las alarmas
  const fetchAlarms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlertMessage('Token no proporcionado. Por favor, inicie sesión.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      const response = await fetch(
        `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarms?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al cargar los datos de alarmas:', errorData);
        setAlertMessage(`Error: ${errorData.message || 'No se pudieron cargar los datos de alarmas.'}`);
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      const data = await response.json();
      const { alarms } = data;
      setAlarms(alarms || []);
    } catch (error) {
      console.error('Error al obtener los datos de alarmas:', error);
      setAlertMessage('Error al obtener los datos de alarmas');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (alarm.topic) {
        subscribeToTopic(alarm.topic); // Suscribirse al topic de la alarma
        console.log(`Suscrito al topic: ${alarm.topic}`);
      }
    });
  }, [alarms, subscribeToTopic]);

  useEffect(() => {
    alarms.forEach((alarm) => {
      const topicParts = alarm.variable.split("/");
      const generalTopic = topicParts.slice(0, topicParts.length - 1).join("/") + "/#";
      subscribeToTopic(generalTopic);
    });
  }, [alarms, subscribeToTopic]);

  useEffect(() => {
    const fetchAlarmData = async () => {
      if (!userId) {
        setAlertMessage("El usuario no está logueado.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAlertMessage('Token no proporcionado. Por favor, inicie sesión.');
          setAlertSeverity('error');
          setAlertOpen(true);
          return;
        }

        const response = await fetch(
          `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarms?userId=${userId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al cargar los datos de alarmas:", errorData);
          setAlertMessage(`Error: ${errorData.message || 'No se pudieron cargar los datos de alarmas.'}`);
          setAlertSeverity("error");
          setAlertOpen(true);
          return;
        }

        const data = await response.json();
        const { alarms } = data;
        setAlarms(alarms || []);
      } catch (error) {
        console.error("Error al obtener los datos de alarmas:", error);
        setAlertMessage("Error al obtener los datos de alarmas");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };

    fetchAlarmData();
  }, [userId]);

  // Obtener los topics del usuario
  useEffect(() => {
    const fetchTopics = async () => {
      if (!userId) {
        setAlertMessage("El usuario no está logueado.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAlertMessage('Token no proporcionado. Por favor, inicie sesión.');
          setAlertSeverity('error');
          setAlertOpen(true);
          return;
        }

        const response = await fetch(`${apiBaseUrl}?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          setAlertMessage(`Error: ${errorData.error || "No se pudieron cargar los topics."}`);
          setAlertSeverity("error");
          setAlertOpen(true);
          return;
        }

        const data = await response.json();
        const userTopics = data.devices.map((device) => device.topic);
        setMqttTopics(userTopics);
        console.log("Topics obtenidos:", userTopics); // Log para depuración
      } catch (error) {
        setAlertMessage("Hubo un error al conectar con el servidor.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };

    fetchTopics();
  }, [userId]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !userId) {
          setAlertMessage("Token o ID de usuario no encontrados");
          setAlertSeverity("error");
          setAlertOpen(true);
          return;
        }

        const response = await axios.get(`${apiBaseUrl}?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Dispositivos obtenidos:', response.data); // Debug
        setDevices(response.data.devices || []);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
        setAlertMessage("Error al obtener dispositivos");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    if (devices && Array.isArray(devices)) {
      const topics = devices.map(device => device.topic);
      setMqttTopics(topics);
    }
  }, [devices]);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (alarm.deviceId && alarm.subtopic) {
        const cleanTopic = alarm.deviceId.replace(/#$/, '');
        const topic = `${cleanTopic}${alarm.subtopic}/#`;
        console.log('Suscribiéndose al topic:', topic);
        subscribeToTopic(topic);
      }
    });
  }, [alarms, subscribeToTopic]);

  
  useEffect(() => {
    console.log("Datos MQTT recibidos:", mqttData);
  }, [mqttData]);

  useEffect(() => {
    console.log("Datos MQTT recibidos en Alarmas:", mqttData);
  }, [mqttData]);

  useEffect(() => {
    console.log("Datos MQTT recibidos:", mqttData);
  }, [mqttData]);

  // Actualizar la lista de topics MQTT
  useEffect(() => {
    if (mqttData && typeof mqttData === 'object') {
      const topics = Object.keys(mqttData).map(key => key);
      setMqttTopics(topics);
    }
  }, [mqttData]);

  useEffect(() => {
    const handleMqttData = (topic, message) => {
      console.log(`Datos recibidos en el topic ${topic}:`, message.toString());
    };

    if (mqttData) {
      Object.entries(mqttData).forEach(([topic, message]) => {
        handleMqttData(topic, message);
      });
    }
  }, [mqttData]);

  useEffect(() => {
    const evaluateCondition = (condition, currentValue, threshold) => {
      switch (condition) {
        case '>':
          return currentValue > threshold;
        case '<':
          return currentValue < threshold;
        case '==':
          return currentValue === threshold;
        case '>=':
          return currentValue >= threshold;
        case '<=':
          return currentValue <= threshold;
        case '!=':
          return currentValue !== threshold;
        default:
          return false;
      }
    };

    const timers = {};

    alarms.forEach((alarm) => {
      const topicData = mqttData[alarm.topic];
      if (topicData) {
        const valuesArray = topicData.values[alarm.variable];
        if (valuesArray && valuesArray.length > 0) {
          const currentValue = valuesArray[valuesArray.length - 1]; // Último valor del array
          const thresholdValue = (alarm.value * alarm.threshold) / 100;
          console.log(`Comparando ${currentValue} con el umbral ${thresholdValue} para la alarma ${alarm.name}`);
          if (currentValue >= thresholdValue) {
            console.log(`Alerta: ${alarm.name} ha alcanzado el umbral configurado de ${alarm.threshold}% (${thresholdValue}).`);
            sendAlertEmail(alarm.name, currentValue, alarm.threshold, alarm.alarmId);
            setSnackbarMessage(`La alarma ${alarm.name} ha alcanzado el umbral configurado de ${alarm.threshold}% (${thresholdValue}).`);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            setHighlightedAlarms((prev) => [...prev, alarm.alarmId]);
          }
          if (evaluateCondition(alarm.condition, currentValue, alarm.value)) {
            if (!timers[alarm.alarmId]) {
              timers[alarm.alarmId] = setTimeout(() => {
                console.log(`Alarma activada para ${alarm.name}`);
                setSnackbarMessage(`La alarma ${alarm.name} ha sido activada.`);
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
                setActiveAlarms((prev) => [...prev, alarm.alarmId]);
                delete timers[alarm.alarmId];
              }, alarm.waitTime * 1000); // Convertir segundos a milisegundos
            }
          } else {
            console.log(`No se cumple la condición para ${alarm.name}`);
            clearTimeout(timers[alarm.alarmId]);
            delete timers[alarm.alarmId];
            setActiveAlarms((prev) => prev.filter((id) => id !== alarm.alarmId));
            setHighlightedAlarms((prev) => prev.filter((id) => id !== alarm.alarmId));
          }
        }
      }
    });

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [mqttData, alarms]);

  useEffect(() => {
    if (alarms.length > 0) {
      const activeAlarmNames = alarms.filter(alarm => highlightedAlarms.includes(alarm.alarmId)).map(alarm => alarm.name);
      if (activeAlarmNames.length > 0) {
        setSnackbarMessage(`Alarmas activas: ${activeAlarmNames.join(', ')}`);
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      }
    }
  }, [highlightedAlarms, alarms]);

  const handleAddAlarm = (newAlarm) => {
    setAlarms((prevAlarms) => [...prevAlarms, newAlarm]);
  };

  useEffect(() => {
    fetchAlarms(); // Refrescar las alarmas al montar el componente
  }, []);

  const evaluateAlarms = (data) => {
    alarms.forEach((alarm) => {
      const { variable, condition, value, waitTime, threshold } = alarm;
      const currentValue = data[variable];

      // Calcular el valor del umbral en base al porcentaje
      const thresholdValue = (value * threshold) / 100;

      // Mostrar alerta cuando el valor alcanza el umbral
      if (currentValue >= thresholdValue) {
        console.log(`Alerta: ${alarm.name} ha alcanzado el umbral configurado de ${threshold}% (${thresholdValue}).`);
        sendAlertEmail(alarm.name, currentValue, alarm.threshold, alarm.alarmId);
      }

      // Evaluar si el valor cumple la condición y supera el tiempo configurado
      if (currentValue >= value) {
        setTimeout(() => {
          if (data[variable] >= value) { // Re-evaluar después del tiempo de espera
            console.log(`Alerta: ${alarm.name} ha superado el valor configurado por ${waitTime} segundos.`);
          }
        }, waitTime * 1000); // Convertir waitTime a milisegundos
      }
    });
  };

  const newDataReceived = (data) => {
    evaluateAlarms(data);
  };

  const fetchSubtopics = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !selectedDevice) {
        setAlertMessage("Selecciona un dispositivo.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
      if (!device) {
        setAlertMessage("Dispositivo no encontrado.");
        setAlertSeverity("error");
        setAlertOpen(true);
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
        setAlertMessage("Selecciona un subtopic.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
      const device = devices.find((dev) => dev.deviceId === selectedDevice);
      if (!device) {
        setAlertMessage("Dispositivo no encontrado.");
        setAlertSeverity("error");
        setAlertOpen(true);
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

  // Manejar la selección del dispositivo
  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
    setShowSubtopics(false);
  };

  // Manejar la selección del subtopic
  const handleSubtopicChange = (event) => {
    setSelectedSubtopic(event.target.value);
    setNewAlarm({ ...newAlarm, subtopic: event.target.value });
    fetchVariables(event.target.value);
  };

  // Manejar la apertura del modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Manejar el cambio del slider
  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  const handleFetchSubtopics = async () => {
    await fetchSubtopics();
    setShowSubtopics(true);
  };

  const handleEditEmail = (emailData) => {
    console.log("Editando correo:", emailData);
    setEditEmailData(emailData);
    setEmailRecipients([emailData.email]);
    setIsCorreoModalOpen(true);
  };

  const handleSaveEditedEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId || !editEmailData) {
        setAlertMessage('Faltan datos necesarios para actualizar.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      if (!emailRecipients.length) {
        setAlertMessage('Seleccione un correo antes de guardar.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      const requestBody = {
        userId,
        email: emailRecipients[0],
        interval: editEmailData.interval,
      };

      const response = await fetch('https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/actuaalarmacorreo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al actualizar el correo:', errorData);
        setAlertMessage('Error al actualizar el correo.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      console.log('Correo actualizado exitosamente');
      setIsCorreoModalOpen(false);
      fetchConfiguredEmails(); // Refresh the list
    } catch (error) {
      console.error('Error al actualizar el correo:', error);
      setAlertMessage('Error al actualizar el correo.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleSaveAlarm = async () => {
    const device = devices.find((dev) => dev.deviceId === selectedDevice);
    if (!device) {
      console.error('Dispositivo no encontrado');
      return;
    }
    const cleanTopic = device.topic.replace(/#$/, '');
    const topicConcatenado = `${cleanTopic}${selectedSubtopic}`;
    const alarmData = {
      userId: userId,
      deviceName: device.name,
      alarmName: newAlarm.name,
      subtopic: selectedSubtopic,
      variable: newAlarm.variable,
      condition: newAlarm.condition,
      value: Number(newAlarm.value),
      threshold: Number(threshold),
      topic: topicConcatenado,
      emailRecipients: emailRecipients, // Include email recipients
    };
    if (isEditing) {
      alarmData.alarmId = newAlarm.alarmId;
    }
    try {
      const response = await fetch('https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarms', {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alarmData),
      });
      if (!response.ok) {
        throw new Error('Error al guardar la alarma');
      }
      const result = await response.json();
      console.log('Alarma guardada exitosamente:', result);
      if (isEditing) {
        setAlarms((prevAlarms) => {
          const updatedAlarms = [...prevAlarms];
          updatedAlarms[editIndex] = { ...newAlarm, ...alarmData };
          return updatedAlarms;
        });
      } else {
        setAlarms((prevAlarms) => [...prevAlarms, { ...alarmData, alarmId: result.alarmId }]);
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setEditIndex(null);
    } catch (error) {
      console.error('Error al guardar la alarma:', error);
    }
  };
  const handleOpenDialog = (alarm) => {
    setAlarmToDelete(alarm);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setConfirmationText('');
  };

  const handleDeleteAlarm = async () => {
    if (confirmationText !== 'confirmar') {
      setSnackbarMessage('Por favor, escriba "confirmar" para eliminar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await deleteAlarm(alarmToDelete.userId, alarmToDelete.alarmId);
      setSnackbarMessage('Alarma eliminada exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error al eliminar la alarma');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    handleCloseDialog();
  };

  const deleteAlarm = async (userId, alarmId) => {
    try {
      const response = await fetch(`https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarmas?userId=${userId}&alarmId=${alarmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la alarma');
      }

      console.log('Alarma eliminada exitosamente');
      setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.alarmId !== alarmId));
    } catch (error) {
      console.error('Error al eliminar la alarma:', error);
    }
  };

  useEffect(() => {
    if (mqttData) {
      newDataReceived(mqttData);
    }
  }, [mqttData]);

  const handleOpenCorreoModal = () => setIsCorreoModalOpen(true);
  const handleCloseCorreoModal = () => setIsCorreoModalOpen(false);

  const handleSaveEmails = async (emails, interval) => {
    if (interval < 60) {
      setSnackbarMessage('El intervalo mínimo debe ser de 60 segundos');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      if (!userId || !emails || emails.length === 0 || !interval) {
        throw new Error('Faltan campos requeridos: userId, emails, interval');
      }
  
      // Preparar los datos para enviar a la API
      const requestBody = {
        userId: userId, // Campo esperado por el backend
        emails: emails, // Campo esperado por el backend (debe ser un array)
        interval: interval // Campo esperado por el backend
      };
  
      console.log('Datos enviados a la API:', requestBody);
  
      const response = await fetch('https://6zhw53u206.execute-api.us-east-1.amazonaws.com/correo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error('Error al guardar los correos en la base de datos');
      }
  
      const result = await response.json();
      console.log('Correos guardados exitosamente:', result);
    } catch (error) {
      console.error('Error al guardar los correos:', error);
    }
  };

  const sendAlertEmail = async (alarmName, currentValue, threshold, alarmId, retryCount = 0) => {
    const now = Date.now();
    const lastSent = lastSentTimes[alarmId] || 0;

    if (now - lastSent < 60 * 1000) {
      console.log('Aún no ha pasado el tiempo suficiente para enviar otra alerta');
      return;
    }

    try {
      setSendingEmails(prev => ({ ...prev, [alarmId]: true }));
      const userId = localStorage.getItem('userId');
      console.log('Enviando correo de alerta para:', { userId, alarmName, currentValue, threshold });
      const response = await fetch('https://6zhw53u206.execute-api.us-east-1.amazonaws.com/alertaemail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          userId,
          alarmName,
          currentValue,
          threshold,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al enviar la alerta por correo:', errorData);
        setSnackbarMessage('No se pudo enviar la alerta por correo. Por favor, inténtelo de nuevo.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        throw new Error('Error al enviar la alerta por correo');
      }
  
      const result = await response.json();
      console.log('Correo enviado exitosamente:', result);
      setLastSentTimes(prev => ({ ...prev, [alarmId]: now }));
      setSnackbarMessage('La alerta por correo se envió exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          sendAlertEmail(alarmName, currentValue, threshold, alarmId, retryCount + 1);
        }, delay);
      }
      console.error('Error al enviar la alerta por correo:', error);
      setSnackbarMessage('Hubo un error al enviar la alerta por correo. Por favor, inténtelo de nuevo.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSendingEmails(prev => ({ ...prev, [alarmId]: false }));
    }
  };

  useEffect(() => {
    const evaluateAlarms = () => {
      alarms.forEach((alarm) => {
        const topicData = mqttData[alarm.topic];
        if (topicData) {
          const valuesArray = topicData.values[alarm.variable];
          if (valuesArray?.length > 0) {
            const currentValue = valuesArray[valuesArray.length - 1];
            const thresholdValue = (alarm.value * alarm.threshold) / 100;

            if (currentValue >= thresholdValue) {
              sendAlertEmail(alarm.name, currentValue, alarm.threshold, alarm.alarmId);
            }
          }
        }
      });
    };

    const interval = setInterval(evaluateAlarms, 5000);
    return () => clearInterval(interval);
  }, [mqttData, alarms, lastSentTimes]);

  const handleViewConfiguredEmails = () => {
    fetchConfiguredEmails();
  };

  const handleOpenEmailsModal = async () => {
    await fetchConfiguredEmails();
    setIsEmailsModalOpen(true);
  };

  const handleCloseEmailsModal = () => {
    setIsEmailsModalOpen(false);
  };

  const handleDeleteEmail = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId || !email) {
        setAlertMessage('Faltan datos necesarios para eliminar.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      console.log(`✅ Eliminando correo: ${email}`);

      const response = await fetch(`https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/acutacorreo?userId=${userId}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al eliminar el correo:', errorData);
        setAlertMessage('Error al eliminar el correo.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      console.log('✅ Correo eliminado exitosamente');
      fetchConfiguredEmails(); // Refrescar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar el correo:', error);
      setAlertMessage('Error al eliminar el correo.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const fetchConfiguredEmails = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setAlertMessage('No se encontró token de autenticación');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      console.log(`Fetching emails for userId: ${userId}`);

      const response = await axios.get(
        `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/getalarmasemail?userId=${userId}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Emails response:', response.data);

      // Corregir aquí: La respuesta es el array directo, no hay propiedad 'emails'
      if (response.data && Array.isArray(response.data)) {
        setConfiguredEmails(response.data);
        console.log(`Configured emails set: ${response.data.length} emails`);
      } else {
        console.warn('La respuesta no es un array válido');
        setConfiguredEmails([]);
      }
    } catch (error) {
      console.error('Error fetching configured emails:', error);
      setAlertMessage('No se pudieron cargar los correos configurados');
      setAlertSeverity('error');
      setAlertOpen(true);
      setConfiguredEmails([]);
    }
  };

  return (
    <div>
      <Sidebar />
      <div style={{ 
        marginLeft: "250px", 
        padding: "20px", 
        maxWidth: "100%", 
        overflowX: "auto",
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <Box sx={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h4" sx={{
            marginBottom: '20px',
            color: '#333',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Gestión de Alarmas
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
              Añadir Alarma
            </Button>
            <Button variant="contained" color="secondary" startIcon={<EmailIcon />} onClick={handleOpenCorreoModal}>
              Añadir Correos Remitentes
            </Button>
            <Button variant="contained" color="secondary" startIcon={<VisibilityIcon />} onClick={handleOpenEmailsModal}>
              Ver Correos
            </Button>
          </Box>
          <CorreoAlarmaModal
            open={isCorreoModalOpen}
            onClose={handleCloseCorreoModal}
            onSave={handleSaveEmails}
            initialEmail={''}
            initialInterval={''}
          />
          <Modal open={isModalOpen} onClose={handleCloseModal}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}>
              <Typography variant="h6" component="h2">
                Añadir Nueva Alarma
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Selecciona un dispositivo:
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="device-label">Dispositivo</InputLabel>
                <Select
                  labelId="device-label"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Dispositivo"
                >
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <MenuItem key={device.deviceId} value={device.deviceId}>
                        {device.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay dispositivos disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFetchSubtopics}
                disabled={!selectedDevice}
                startIcon={<AddIcon />}
              >
                Buscar Subtemas
              </Button>
              {showSubtopics && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="subtopic-label">Subtopic</InputLabel>
                  <Select
                    labelId="subtopic-label"
                    value={selectedSubtopic}
                    onChange={handleSubtopicChange}
                    label="Subtopic"
                  >
                    {subtopics.map((subtopic, index) => (
                      <MenuItem key={index} value={subtopic}>{subtopic}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth margin="normal">
                <InputLabel id="variable-label">Variable</InputLabel>
                <Select
                  labelId="variable-label"
                  value={newAlarm.variable}
                  onChange={(e) => setNewAlarm({ ...newAlarm, variable: e.target.value })}
                  label="Variable"
                >
                  {variables.map((variable, index) => (
                    <MenuItem key={index} value={variable}>{variable}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="condition-label">Condición</InputLabel>
                <Select
                  labelId="condition-label"
                  value={newAlarm.condition}
                  onChange={(e) => setNewAlarm({ ...newAlarm, condition: e.target.value })}
                  label="Condición"
                >
                  <MenuItem value=">">Mayor que</MenuItem>
                  <MenuItem value="<">Menor que</MenuItem>
                  <MenuItem value="==">Igual a</MenuItem>
                  <MenuItem value=">=">Mayor o igual que</MenuItem>
                  <MenuItem value="<=">Menor o igual que</MenuItem>
                  <MenuItem value="!=">Diferente de</MenuItem>
                </Select>
              </FormControl>
            
              <TextField
                label="Valor"
                variant="outlined"
                fullWidth
                margin="normal"
                type="number"
                value={newAlarm.value}
                onChange={(e) => setNewAlarm({ ...newAlarm, value: e.target.value })}
              />
              <TextField
                label="Nombre de la Alarma"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newAlarm.name}
                onChange={(e) => setNewAlarm({ ...newAlarm, name: e.target.value })}
              />
              <Typography gutterBottom>
                Umbral: {threshold}%
              </Typography>
              <Slider
                value={threshold}
                onChange={handleSliderChange}
                aria-labelledby="continuous-slider"
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
              <Button variant="contained" color="primary" onClick={handleSaveAlarm}>
                Guardar
              </Button>
            </Box>
          </Modal>
          <Modal open={isEmailsModalOpen} onClose={handleCloseEmailsModal}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}>
              <Typography variant="h6" component="h2">
                Correos Configurados
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Intervalo</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configuredEmails.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.interval}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditEmail(item)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteEmail(item.email)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {configuredEmails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} style={{textAlign: 'center'}}>
                          No hay correos configurados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Modal>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre de la Alarma</TableCell>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>Subtema</TableCell>
                  <TableCell>Variable</TableCell>
                  <TableCell>Condición</TableCell>
                  <TableCell>Valor</TableCell>
                   <TableCell>Umbral(%)</TableCell>
                  <TableCell>Acciones</TableCell>
                 </TableRow>
              </TableHead>
              <TableBody>
                {alarms.map((alarm, index) => (
                  <TableRow key={alarm.alarmId} style={{ backgroundColor: highlightedAlarms.includes(alarm.alarmId) ? 'yellow' : activeAlarms.includes(alarm.alarmId) ? 'red' : 'white' }}>
                    <TableCell>{alarm.name}</TableCell>
                    <TableCell>{alarm.deviceName}</TableCell>
                    <TableCell>{alarm.subtopic}</TableCell>
                    <TableCell>{alarm.variable}</TableCell>
                    <TableCell>{alarm.condition}</TableCell>
                    <TableCell>{alarm.value}</TableCell>
                     <TableCell>{alarm.threshold}</TableCell>
                    <TableCell>
                      {/* <IconButton onClick={() => handleEditAlarm(index)}><EditIcon /></IconButton> */}
                      <IconButton onClick={() => handleOpenDialog(alarm)}><DeleteIcon /></IconButton>
                      <Chip 
                        label={sendingEmails[alarm.alarmId] ? "Enviando..." : "Listo"} 
                        color={sendingEmails[alarm.alarmId] ? "warning" : "success"}
                      />
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para eliminar la alarma, por favor escriba "confirmar".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Confirmar"
            type="text"
            fullWidth
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteAlarm} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Alarmas;