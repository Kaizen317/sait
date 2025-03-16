// src/context/MqttContext.jsx
import { createContext } from "react";

// Crear el contexto con un valor inicial por defecto
export const MqttContext = createContext({
  mqttData: {},
  subscribeToTopic: () => {},
  userId: null,
  getLatestValues: () => null
});