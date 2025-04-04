// MqttProvider.jsx
import React, { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import { MqttContext } from "./MqttContext";
import axios from "axios";

/**
 * MqttProvider
 * @param {string} userId  - ID del usuario proveniente de App.jsx
 * @param {React.ReactNode} children
 */
const MqttProvider = ({ userId, children }) => {
  // Estado local que guarda mensajes MQTT
  const [mqttData, setMqttData] = useState(() => {
    const stored = localStorage.getItem("mqttData");
    return stored ? JSON.parse(stored) : {};
  });

  // Estado para controlar si los datos iniciales se han cargado
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Mapa deviceId => mqtt.Client
  const clientsRef = useRef(new Map());

  // Estado para controlar si estamos conectados
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Efecto que se ejecuta cada vez que userId cambie.
   * Si userId existe, conecta a los dispositivos.
   */
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const effectiveUserId = userId || storedUserId;

    if (!effectiveUserId) {
      console.log("[MQTT] No userId disponible => no se conectan dispositivos.");
      return;
    }

    if (isConnecting) {
      console.log("[MQTT] Ya hay una conexión en proceso...");
      return;
    }

    console.log("[MQTT] Iniciando conexión con userId:", effectiveUserId);
    setIsConnecting(true);

    const fetchDevicesAndConnect = async () => {
      try {
        const devicesRes = await fetch(
          `https://z9tss4i6we.execute-api.us-east-1.amazonaws.com/devices?userId=${effectiveUserId}`
        );
        if (!devicesRes.ok) {
          throw new Error("[FETCH] Error al obtener dispositivos");
        }
        const { devices } = await devicesRes.json();
        console.log("[MQTT] Dispositivos obtenidos:", devices);

        // Recopilar todos los tópicos para cargar datos iniciales
        const allTopics = [];

        for (const device of devices) {
          if (clientsRef.current.has(device.deviceId)) {
            // Ya tenemos un cliente para este deviceId
            continue;
          }

          try {
            const subtopicsRes = await fetch(
              `https://qoxkrbn8z1.execute-api.us-east-1.amazonaws.com/mqtttopic?userId=${effectiveUserId}&deviceName=${device.name}`
            );
            const { topics = [] } = await subtopicsRes.json();

            if (topics.length === 0) {
              console.log(`[SKIP] ${device.name} sin subtopics`);
              continue;
            }

            console.log("[MQTT CONFIG]", {
              device: device.name,
              clientId: device.deviceId,
              username: device.username,
              password: device.password ? "••••••" : "undefined",
            });

            // Recopilar tópicos para cargar datos iniciales
            topics.forEach(topic => {
              const parts = topic.split('/');
              if (parts.length >= 4) {
                const deviceId = parts[parts.length - 2];
                const subtopic = parts[parts.length - 1];
                allTopics.push({ device_id: deviceId, subtopic });
              }
            });

            // Crear cliente MQTT
            const client = mqtt.connect("wss://saitbrokers.com:8094/mqtt", {
              clientId: `${device.deviceId}_${Math.random().toString(36).substring(7)}`,
              username: device.username,
              password: device.password,
              keepalive: 60,
              reconnectPeriod: 5000,
              clean: true,
            });

            setupClientEvents(device, client, topics);
            clientsRef.current.set(device.deviceId, client);
          } catch (err) {
            console.error(`[INIT ERR] ${device.name}:`, err);
          }
        }

        // Cargar datos iniciales para todos los tópicos recopilados
        if (allTopics.length > 0) {
          console.log("[INITIAL DATA] Omitiendo carga de datos iniciales para evitar error CORS");
          setInitialDataLoaded(true);
        }
      } catch (err) {
        console.error("[FETCH]:", err);
      } finally {
        setIsConnecting(false);
      }
    };

    fetchDevicesAndConnect();

    // Cleanup al cambiar userId o desmontar
    return () => {
      console.log("[MQTT] Limpiando conexiones previas al cambiar userId...");
      clientsRef.current.forEach((client, deviceId) => {
        console.log(`[CLEANUP] deviceId=${deviceId}`);
        client.end();
      });
      clientsRef.current.clear();
    };
  }, [userId]);

  /**
   * setupClientEvents
   */
  const setupClientEvents = (device, client, topics) => {
    let reconnectAttempts = 0;

    client.on("connect", () => {
      reconnectAttempts = 0;
      console.log(`[CONNECTED] ${device.name}`, {
        clientId: device.deviceId,
        user: device.username,
      });

      // Eliminar duplicados y suscribir
      const uniqueTopics = [...new Set(topics)];
      uniqueTopics.forEach((topic) => {
        if (topic.endsWith("#")) {
          console.warn(`[SUBSCRIBE WARN] Ignorando ${topic} porque termina en "#"`);
          return;
        }
        const parts = topic.split("/");
        if (parts.length < 2 || parts.some((p) => !p.trim())) {
          console.warn(`[SUBSCRIBE WARN] Tópico inválido => ${topic}`);
          return;
        }

        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`[SUB FAIL] ${topic}:`, err.message);
          } else {
            console.log(`[SUB OK] ${topic}`);
          }
        });
      });

      console.log(`[KEEPALIVE] ${device.name}, manejado por mqtt.js`);
    });

    client.on("reconnect", () => {
      reconnectAttempts++;
      console.warn(`[RECONNECT] ${device.name} (Intento=${reconnectAttempts})`);
    });

    client.on("error", (err) => {
      console.error(`[ERROR] ${device.name}:`, err.message);
    });

    client.on("close", () => {
      console.warn(`[CLOSED] ${device.name}`);
    });

    client.on("message", (topic, message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.payload) {
          console.log(`[MESSAGE] Topic=${topic}, payload=`, parsed.payload);
        }
        updateMqttData(topic, parsed);
      } catch (e) {
        console.error(`[PARSE ERROR] ${device.name}:`, e);
      }
    });
  };

  /**
   * updateMqttData
   */
  const updateMqttData = (topic, parsed) => {
    setMqttData((prev) => {
      const now = new Date().toLocaleTimeString();
      const prevData = prev[topic] || { time: [], values: {} };

      const newValues = {};
      if (parsed.payload) {
        console.log(` Nuevo mensaje MQTT para ${topic}:`, parsed.payload);
        Object.entries(parsed.payload).forEach(([key, val]) => {
          const oldArr = prevData.values[key] || [];
          newValues[key] = [...oldArr.slice(-9), val];
        });
      } else {
        console.log(` Nuevo mensaje MQTT (formato alternativo) para ${topic}:`, parsed);
        const oldMsgArr = prevData.values["message"] || [];
        newValues["message"] = [...oldMsgArr.slice(-9), parsed];
      }

      const newTopicData = {
        time: [...prevData.time.slice(-9), now],
        values: {
          ...prevData.values,
          ...newValues,
        },
      };

      const newState = {
        ...prev,
        [topic]: newTopicData,
      };

      // Guardar en localStorage
      localStorage.setItem("mqttData", JSON.stringify(newState));
      
      console.log(` Estado MQTT actualizado para ${topic}`);
      
      return newState;
    });
  };

  /**
   * subscribeToTopic manual (para DashboardConfig)
   */
  const subscribeToTopic = (topic) => {
    if (!topic) {
      console.error("[SUBSCRIBE ERROR] Tópico no proporcionado");
      return;
    }
    if (!userId) {
      console.error("[SUBSCRIBE ERROR] userId no definido => no se pueden suscribir topics.");
      return;
    }

    if (topic.endsWith("#")) {
      console.warn(`[SUBSCRIBE WARN] Ignorando ${topic}, termina en "#"`);
      return;
    }
    const parts = topic.split("/");
    if (parts.length < 2 || parts.some((p) => !p.trim())) {
      console.warn(`[SUBSCRIBE WARN] Tópico inválido => ${topic}`);
      return;
    }

    clientsRef.current.forEach((client, deviceId) => {
      console.log(`[SUBSCRIBE ATTEMPT] ${topic}, deviceId=${deviceId}`);
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`[SUBSCRIBE ERROR] ${topic}, deviceId=${deviceId}`, err.message);
        } else {
          console.log(`[SUBSCRIBED] Ok => ${topic}, deviceId=${deviceId}`);
        }
      });
    });
  };

  /**
   * getLatestValues
   */
  const getLatestValues = (topic) => {
    const topicData = mqttData[topic];
    if (!topicData) return null;

    const latestTime = topicData.time[topicData.time.length - 1];
    const latestValues = Object.entries(topicData.values).reduce(
      (acc, [key, arr]) => ({
        ...acc,
        [key]: arr[arr.length - 1],
      }),
      {}
    );

    return { time: latestTime, values: latestValues };
  };

  return (
    <MqttContext.Provider value={{ mqttData, subscribeToTopic, getLatestValues, userId, initialDataLoaded }}>
      {children}
    </MqttContext.Provider>
  );
};

export default MqttProvider;
