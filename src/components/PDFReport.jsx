import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 12,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  component: {
    marginBottom: 15,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  details: {
    fontSize: 10,
    marginBottom: 5,
  },
});

// Componente PDF para el reporte
const PDFReport = ({ components }) => (
  <Document>
    <Page style={styles.page} size="A4">
      <Text style={styles.header}>Reporte de Componentes</Text>
      {components.map((comp, index) => (
        <View key={index} style={styles.component}>
          <Text style={styles.title}>{comp.title}</Text>
          <Text style={styles.details}>Tamaño: {comp.width}</Text>
          <Text style={styles.details}>Altura: {comp.height}px</Text>
          <Text style={styles.details}>Fecha de Inicio: {comp.startDate || "N/A"}</Text>
          <Text style={styles.details}>Fecha de Fin: {comp.endDate || "N/A"}</Text>
          {comp.variables.map((variable, idx) => (
            <Text key={idx} style={styles.details}>
              Variable: {variable.variable} | Color: {variable.color}
            </Text>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

export default PDFReport;
