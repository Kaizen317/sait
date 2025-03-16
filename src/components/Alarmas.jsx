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
  TablePagination,
  Paper,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
  MenuItem,
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
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { MqttContext } from "./MqttContext";
import { styled } from "@mui/material/styles";

// Tema personalizado
const theme = {
  palette: {
    primary: { main: "#4CAF50" },
    secondary: { main: "#FF5722" },
    background: { default: "#f9fafb", paper: "#ffffff" },
    text: { primary: "#2d3748", secondary: "#718096" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600, color: "#2d3748" },
  },
};

// Estilos personalizados
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  "& .MuiTable-root": {
    borderCollapse: "separate",
    borderSpacing: "0 12px",
  },
  "& .MuiTableRow-root": {
    backgroundColor: theme.palette.background.paper,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(76, 175, 80, 0.05)",
    },
  },
  "& .MuiTableCell-root": {
    border: "none",
    padding: "16px",
    fontSize: "0.875rem",
  },
  "& .MuiTableHead-root .MuiTableRow-root": {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  borderRadius: "16px",
  fontWeight: 500,
  ...(status === "active" && {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    color: theme.palette.primary.main,
  }),
  ...(status === "inactive" && {
    backgroundColor: "rgba(158, 158, 158, 0.15)",
    color: "#9E9E9E",
  }),
}));

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .MuiPaper-root": {
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
}));

const ActionButton = styled(Button)(({ theme, color = "primary" }) => ({
  borderRadius: "8px",
  textTransform: "none",
  padding: "10px 20px",
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease",
  },
  ...(color === "primary" && {
    backgroundColor: theme.palette.primary.main,
    color: "#ffffff",
  }),
  ...(color === "secondary" && {
    backgroundColor: theme.palette.secondary.main,
    color: "#ffffff",
  }),
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": {
      borderColor: theme.palette.grey[300],
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
    },
  },
}));

const AlarmNotification = styled("div")(({ severity, theme }) => ({
  position: "fixed",
  top: "20px",
  right: "20px",
  padding: "15px 20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  zIndex: 1000,
  animation: "slideIn 0.3s ease-out",
  backgroundColor:
    severity === "alta"
      ? "#f44336"
      : severity === "media"
      ? "#ff9800"
      : severity === "baja"
      ? "#2196f3"
      : "#666",
  color: "#ffffff",
  "@keyframes slideIn": {
    from: { transform: "translateX(100%)", opacity: 0 },
    to: { transform: "translateX(0)", opacity: 1 },
  },
}));

const Alarmas = () => {
  const theme = useTheme(); // Usar el tema de Material-UI
  const { mqttData, subscribeToTopic } = useContext(MqttContext);
  const [alarms, setAlarms] = useState([]);
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
    severity: "",
    waitTime: "",
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [variables, setVariables] = useState([]);
  const [topicConcatenado, setTopicConcatenado] = useState("");
  const [isLoadingVariables, setIsLoadingVariables] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [mqttTopics, setMqttTopics] = useState([]);
  const [threshold, setThreshold] = useState(50);
  const [showSubtopics, setShowSubtopics] = useState(false);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [highlightedAlarms, setHighlightedAlarms] = useState([]);
  const apiBaseUrl = "https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices";
  const userId = localStorage.getItem("userId");
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const [openActivatedAlarmsModal, setOpenActivatedAlarmsModal] = useState(false);
  const [activatedAlarms, setActivatedAlarms] = useState([]);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [isCorreoModalOpen, setIsCorreoModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSavingAlarm, setIsSavingAlarm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchAlarms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAlertMessage("Token no proporcionado. Por favor, inicie sesión.");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
      const response = await fetch(
        `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarms?userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al cargar los datos de alarmas:", errorData);
        setAlertMessage(`Error: ${errorData.message || "No se pudieron cargar los datos de alarmas."}`);
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
      const data = await response.json();
      setAlarms(data.alarms || []);
    } catch (error) {
      console.error("Error al obtener los datos de alarmas:", error);
      setAlertMessage("Error al obtener los datos de alarmas");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (alarm.topic) {
        subscribeToTopic(alarm.topic);
        console.log(`Suscrito al topic: ${alarm.topic}`);
      }
    });
  }, [alarms, subscribeToTopic]);

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
            "Content-Type": "application/json",
          },
        });
        console.log("Dispositivos obtenidos:", response.data);
        setDevices(response.data.devices || []);
      } catch (error) {
        console.error("Error al obtener dispositivos:", error);
        setAlertMessage("Error al obtener dispositivos");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };
    fetchDevices();
  }, [userId]);

  useEffect(() => {
    if (devices && Array.isArray(devices)) {
      const topics = devices.map((device) => device.topic);
      setMqttTopics(topics);
    }
  }, [devices]);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (alarm.deviceId && alarm.subtopic) {
        const cleanTopic = alarm.deviceId.replace(/#$/, "");
        const topic = `${cleanTopic}${alarm.subtopic}/#`;
        console.log("Suscribiéndose al topic:", topic);
        subscribeToTopic(topic);
      }
    });
  }, [alarms, subscribeToTopic]);

  useEffect(() => {
    console.log("Datos MQTT recibidos:", mqttData);
    if (mqttData && Object.keys(mqttData).length > 0) {
      Object.entries(mqttData).forEach(([topic, data]) => {
        if (data && data.values) {
          console.log(`Datos para topic ${topic}:`, {
            tiempos: data.time,
            valores: Object.entries(data.values).map(([variable, valores]) => ({
              variable,
              valores: valores.slice(-10),
              ultimoValor: valores[valores.length - 1],
            })),
          });
        }
      });
    }
  }, [mqttData]);

  useEffect(() => {
    const evaluateCondition = (condition, currentValue, threshold) => {
      switch (condition) {
        case ">":
          return currentValue > threshold;
        case "<":
          return currentValue < threshold;
        case "==":
          return currentValue === threshold;
        case ">=":
          return currentValue >= threshold;
        case "<=":
          return currentValue <= threshold;
        case "!=":
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
          const currentValue = valuesArray[valuesArray.length - 1];
          if (evaluateCondition(alarm.condition, currentValue, alarm.value)) {
            if (!timers[alarm.alarmId]) {
              timers[alarm.alarmId] = setTimeout(() => {
                console.log(`Alarma activada para ${alarm.name}`);
                setSnackbarMessage(`La alarma ${alarm.name} ha sido activada.`);
                setSnackbarSeverity("warning");
                setSnackbarOpen(true);
                setActiveAlarms((prev) => [...prev, alarm.alarmId]);
                setHighlightedAlarms((prev) => [...prev, alarm.alarmId]);
                delete timers[alarm.alarmId];
              }, alarm.waitTime * 1000);
            }
          } else {
            clearTimeout(timers[alarm.alarmId]);
            delete timers[alarm.alarmId];
            setActiveAlarms((prev) => prev.filter((id) => id !== alarm.alarmId));
            setHighlightedAlarms((prev) => prev.filter((id) => id !== alarm.alarmId));
          }
        }
      }
    });
    return () => Object.values(timers).forEach(clearTimeout);
  }, [mqttData, alarms]);

  useEffect(() => {
    if (alarms.length > 0) {
      const activeAlarmNames = alarms
        .filter((alarm) => highlightedAlarms.includes(alarm.alarmId))
        .map((alarm) => alarm.name);
      if (activeAlarmNames.length > 0) {
        setSnackbarMessage(`Alarmas activas: ${activeAlarmNames.join(", ")}`);
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
      }
    }
  }, [highlightedAlarms, alarms]);

  const handleAddAlarm = (newAlarm) => {
    setAlarms((prevAlarms) => [...prevAlarms, newAlarm]);
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
      setSubtopics(response.data || []);
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

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
    setShowSubtopics(false);
    setSelectedSubtopic("");
    setVariables([]);
  };

  const handleSubtopicChange = (event) => {
    const subtopic = event.target.value;
    setSelectedSubtopic(subtopic);
    setNewAlarm({ ...newAlarm, subtopic });
    fetchVariables(subtopic);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewAlarm({
      name: "",
      description: "",
      subtopic: "",
      variable: "",
      condition: "",
      valueType: "number",
      value: "",
      compareVariable: "",
      severity: "",
      waitTime: "",
    });
    setSelectedDevice("");
    setSelectedSubtopic("");
    setVariables([]);
    setThreshold(50);
    setEmailRecipients([]);
  };

  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  const handleFetchSubtopics = async () => {
    await fetchSubtopics();
    setShowSubtopics(true);
  };

  const handleSaveAlarm = async () => {
    setIsSavingAlarm(true);
    const device = devices.find((dev) => dev.deviceId === selectedDevice);
    if (!device) {
      console.error("Dispositivo no encontrado");
      setIsSavingAlarm(false);
      return;
    }

    const cleanTopic = device.topic.replace(/#$/, "");
    const topicConcatenado = `${cleanTopic}${selectedSubtopic}`;

    const alarmData = {
      userId,
      deviceName: device.name,
      alarmName: newAlarm.name,
      subtopic: selectedSubtopic,
      variable: newAlarm.variable,
      condition: newAlarm.condition,
      value: Number(newAlarm.value),
      threshold: Number(threshold),
      topic: topicConcatenado,
      emailRecipients,
      waitTime: Number(newAlarm.waitTime) || 30,
    };

    try {
      const response = await fetch(
        "https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarms",
        {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alarmData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar la alarma");
      }

      const result = await response.json();
      console.log("Alarma guardada exitosamente:", result);
      setAlarms((prevAlarms) => [...prevAlarms, { ...alarmData, alarmId: result.alarmId }]);
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar la alarma:", error);
    } finally {
      setIsSavingAlarm(false);
    }
  };

  const handleOpenDialog = (alarm) => {
    setAlarmToDelete(alarm);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setConfirmationText("");
  };

  const handleDeleteAlarm = async () => {
    if (confirmationText !== "confirmar") {
      setSnackbarMessage("Por favor, escriba 'confirmar' para eliminar.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await deleteAlarm(alarmToDelete.userId, alarmToDelete.alarmId);
      setSnackbarMessage("Alarma eliminada exitosamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error al eliminar la alarma");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    handleCloseDialog();
  };

  const deleteAlarm = async (userId, alarmId) => {
    try {
      const response = await fetch(
        `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/alarmas?userId=${userId}&alarmId=${alarmId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la alarma");
      }

      setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.alarmId !== alarmId));
    } catch (error) {
      console.error("Error al eliminar la alarma:", error);
    }
  };

  const fetchActivatedAlarms = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setAlertMessage("No se encontró token o userId");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }

      const response = await axios.get(
        "https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/leeralertas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { userId },
        }
      );

      console.log("Activated Alarms:", response.data);
      setActivatedAlarms(response.data);
      setOpenActivatedAlarmsModal(true);
    } catch (error) {
      console.error("Error al obtener alertas activadas:", error);
      setAlertMessage("Error al obtener alertas activadas");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const ActivatedAlarmsModal = () => (
    <Dialog
      open={openActivatedAlarmsModal}
      onClose={() => setOpenActivatedAlarmsModal(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: "#fff" }}>
        <Typography variant="h6">Alertas Activadas</Typography>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Dispositivo
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Variable
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Valor Actual
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Fecha
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activatedAlarms.length > 0 ? (
                activatedAlarms.map((alarm) => (
                  <TableRow
                    key={alarm.alarmId}
                    sx={{ "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.05)" } }}
                  >
                    <TableCell>{alarm.deviceName}</TableCell>
                    <TableCell>{alarm.variable}</TableCell>
                    <TableCell>{alarm.valorActual}</TableCell>
                    <TableCell>{new Date(alarm.fecha).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: theme.palette.text.secondary }}>
                    No hay alertas activadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <ActionButton onClick={() => setOpenActivatedAlarmsModal(false)} color="primary">
          Cerrar
        </ActionButton>
      </DialogActions>
    </Dialog>
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isThresholdExceeded = (alarm) => {
    const topicData = mqttData[alarm.topic];
    if (!topicData || !topicData.values) return false;
    const valueArray = topicData.values[alarm.variable];
    if (!valueArray || valueArray.length === 0) return false;
    const currentValue = valueArray[valueArray.length - 1];
    return currentValue !== undefined && evaluateCondition(alarm.condition, currentValue, alarm.value);
  };

  const getCurrentValue = (alarm) => {
    const topicData = mqttData[alarm.topic];
    if (!topicData || !topicData.values) return "N/A";
    const valueArray = topicData.values[alarm.variable];
    if (!valueArray || valueArray.length === 0) return "N/A";
    return valueArray[valueArray.length - 1] !== undefined ? valueArray[valueArray.length - 1] : "N/A";
  };

  const renderTableRow = (alarm, index) => {
    const isActive = activeAlarms.includes(alarm.alarmId);
    const isHighlighted = highlightedAlarms.includes(alarm.alarmId);

    return (
      <TableRow
        key={index}
        sx={{
          transition: "all 0.3s ease",
          ...(isHighlighted && {
            animation: "highlight 2s infinite",
            "@keyframes highlight": {
              "0%": { backgroundColor: "rgba(255, 193, 7, 0.1)" },
              "50%": { backgroundColor: "rgba(255, 193, 7, 0.2)" },
              "100%": { backgroundColor: "rgba(255, 193, 7, 0.1)" },
            },
          }),
        }}
      >
        <TableCell>{alarm.name}</TableCell>
        <TableCell>{alarm.deviceName}</TableCell>
        <TableCell>{alarm.subtopic}</TableCell>
        <TableCell>{alarm.variable}</TableCell>
        <TableCell>{alarm.condition}</TableCell>
        <TableCell>{alarm.value}</TableCell>
        <TableCell>{alarm.waitTime} s</TableCell>
        <TableCell>{alarm.threshold}%</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <ActionButton
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => handleOpenDialog(alarm)}
              startIcon={<DeleteIcon />}
            >
              Eliminar
            </ActionButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const AlarmNotificationComponent = ({ alarm }) => {
    const severity = alarm.severity.toLowerCase();
    const [show, setShow] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
      return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
      <AlarmNotification severity={severity}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={20} sx={{ color: "white" }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {alarm.name}
            </Typography>
            <Typography variant="body2">{alarm.description}</Typography>
          </Box>
        </Box>
      </AlarmNotification>
    );
  };

  const showTemporaryNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const Notification = () => {
    if (!showNotification) return null;

    return (
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: notificationType === 'success' ? '#059669' : '#DC2626',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {notificationType === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l2 2 4-4" />
            <circle cx="10" cy="10" r="8" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4M10 14h.01" />
          </svg>
        )}
        {notificationMessage}
      </div>
    );
  };

  const handleSaveEmails = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch("https://6zhw53u206.execute-api.us-east-1.amazonaws.com/correo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ userId, emails: emailRecipients, interval: 30 }),
      });

      if (!response.ok) throw new Error("Error al guardar los correos");

      const data = await response.json();
      showTemporaryNotification('Correos guardados exitosamente');
      setIsCorreoModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("Error al guardar los correos");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const handleDeleteEmail = async (emailToDelete) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch("https://6zhw53u206.execute-api.us-east-1.amazonaws.com/email", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          userId,
          email: emailToDelete
        }),
      });

      if (!response.ok) throw new Error("Error al eliminar el correo");

      setEmailRecipients(prev => prev.filter(email => email !== emailToDelete));
      showTemporaryNotification('Correo eliminado exitosamente');
    } catch (error) {
      console.error("Error:", error);
      showTemporaryNotification('Error al eliminar el correo', 'error');
    }
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `https://3at9n0fhdi.execute-api.us-east-1.amazonaws.com/getalarmasemail?userId=${userId}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener los correos");

        const data = await response.json();
        if (data && Array.isArray(data)) {
          // Extraer los correos de cada item
          const emails = data.map(item => item.email).filter(Boolean);
          setEmailRecipients(emails);
        }
      } catch (error) {
        console.error("Error al obtener correos:", error);
      }
    };

    fetchEmails();
  }, [isCorreoModalOpen]); // Actualizamos cuando se cierra el modal también

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "250px",
          padding: "24px",
          backgroundColor: theme.palette.background.default,
          minHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Gestión de Alarmas
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <ActionButton
              variant="contained"
              color="secondary"
              startIcon={<VisibilityIcon />}
              onClick={fetchActivatedAlarms}
            >
              Ver Alarmas Activadas
            </ActionButton>
            <ActionButton
              variant="contained"
              color="secondary"
              onClick={() => setIsCorreoModalOpen(true)}
            >
              Ver o Añadir Correos
            </ActionButton>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Añadir Alarma
            </ActionButton>
          </Box>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell>Subtema</TableCell>
                  <TableCell>Variable</TableCell>
                  <TableCell>Condición</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Tiempo (s)</TableCell>
                  <TableCell>Umbral (%)</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alarms
                  .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                  .map((alarm, index) => renderTableRow(alarm, index))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={alarms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: theme.palette.text.secondary }}
          />
        </Box>
        <StyledModal open={isModalOpen} onClose={handleCloseModal}>
          <Box sx={{ 
            p: 4, 
            maxWidth: "500px", 
            width: "100%", 
            backgroundColor: "#ffffff" 
          }}>
            <DialogTitle>
              <Typography variant="h6">Añadir Nueva Alarma</Typography>
            </DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="normal">
                <InputLabel id="device-label">Dispositivo</InputLabel>
                <Select
                  labelId="device-label"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Dispositivo"
                  sx={{ borderRadius: "8px" }}
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
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleFetchSubtopics}
                disabled={!selectedDevice}
                sx={{ mt: 2, mb: 2 }}
              >
                Buscar Subtemas
              </ActionButton>
              {showSubtopics && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="subtopic-label">Subtopic</InputLabel>
                  <Select
                    labelId="subtopic-label"
                    value={selectedSubtopic}
                    onChange={handleSubtopicChange}
                    label="Subtopic"
                    sx={{ borderRadius: "8px" }}
                  >
                    {subtopics.map((subtopic, index) => (
                      <MenuItem key={index} value={subtopic}>
                        {subtopic}
                      </MenuItem>
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
                  sx={{ borderRadius: "8px" }}
                >
                  {variables.map((variable, index) => (
                    <MenuItem key={index} value={variable}>
                      {variable}
                    </MenuItem>
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
                  sx={{ borderRadius: "8px" }}
                >
                  <MenuItem value=">">Mayor que</MenuItem>
                  <MenuItem value="<">Menor que</MenuItem>
                  <MenuItem value="==">Igual a</MenuItem>
                  <MenuItem value=">=">Mayor o igual que</MenuItem>
                  <MenuItem value="<=">Menor o igual que</MenuItem>
                  <MenuItem value="!=">Diferente de</MenuItem>
                </Select>
              </FormControl>
              <FormTextField
                label="Valor"
                variant="outlined"
                fullWidth
                margin="normal"
                type="number"
                value={newAlarm.value}
                onChange={(e) => setNewAlarm({ ...newAlarm, value: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <FormTextField
                label="Tiempo de Espera (s)"
                variant="outlined"
                fullWidth
                margin="normal"
                type="number"
                value={newAlarm.waitTime}
                onChange={(e) => setNewAlarm({ ...newAlarm, waitTime: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <FormTextField
                label="Nombre de la Alarma"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newAlarm.name}
                onChange={(e) => setNewAlarm({ ...newAlarm, name: e.target.value })}
              />
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: theme.palette.text.primary }}>
                Umbral: {threshold}%
              </Typography>
              <Slider
                value={threshold}
                onChange={handleSliderChange}
                aria-labelledby="threshold-slider"
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{ color: theme.palette.primary.main }}
              />
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleSaveAlarm}
                disabled={isSavingAlarm}
                sx={{ mt: 3, minWidth: "150px" }}
              >
                {isSavingAlarm ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
              </ActionButton>
            </DialogContent>
          </Box>
        </StyledModal>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ backgroundColor: theme.palette.secondary.main, color: "#fff" }}>
            Confirmar Eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: theme.palette.text.primary }}>
              Para eliminar la alarma, por favor escriba "confirmar".
            </DialogContentText>
            <FormTextField
              autoFocus
              margin="dense"
              label="Confirmar"
              type="text"
              fullWidth
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <ActionButton onClick={handleCloseDialog} color="secondary">
              Cancelar
            </ActionButton>
            <ActionButton onClick={handleDeleteAlarm} color="primary">
              Confirmar
            </ActionButton>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ borderRadius: "8px" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <ActivatedAlarmsModal />
        <Dialog
          open={isCorreoModalOpen}
          onClose={() => setIsCorreoModalOpen(false)}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              Gestionar Correos Electrónicos
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Correos configurados actualmente:
              </Typography>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                {emailRecipients.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleDeleteEmail(email)}
                    sx={{
                      backgroundColor: 'rgba(5, 150, 105, 0.1)',
                      color: '#059669',
                      '& .MuiChip-deleteIcon': {
                        color: '#059669',
                        '&:hover': {
                          color: '#047857'
                        }
                      }
                    }}
                  />
                ))}
              </div>
              <FormTextField
                fullWidth
                label="Añadir correo electrónico"
                variant="outlined"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <ActionButton
                  variant="contained"
                  onClick={() => {
                    if (!newEmail) {
                      setEmailError('Por favor ingrese un correo');
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(newEmail)) {
                      setEmailError('Correo electrónico inválido');
                      return;
                    }
                    setEmailRecipients([...emailRecipients, newEmail]);
                    setNewEmail('');
                    setEmailError('');
                  }}
                >
                  Añadir Correo
                </ActionButton>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <ActionButton
              onClick={() => setIsCorreoModalOpen(false)}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Cancelar
            </ActionButton>
            <ActionButton
              variant="contained"
              onClick={handleSaveEmails}
              sx={{
                backgroundColor: '#059669',
                '&:hover': {
                  backgroundColor: '#047857'
                }
              }}
            >
              Guardar Correos
            </ActionButton>
          </DialogActions>
        </Dialog>
      </div>
      <Notification />
    </div>
  );
};

export default Alarmas;