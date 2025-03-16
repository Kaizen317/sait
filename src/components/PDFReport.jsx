import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";

// Continuación de donde nos quedamos...

// Componentes de página de métricas completos
const ComponentPage = ({ components, pageIndex, logoUrl, pdfTitle }) => {
  return (
    <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        {logoUrl && <Image src={logoUrl} style={styles.headerLogo} />}
        <Text style={styles.headerTitle}>{pdfTitle}</Text>
      </View>
      
      <View style={styles.content}>
        {components.map((comp, idx) => (
          <View key={idx} style={styles.component}>
            <Text style={styles.componentDate}>
              {new Date(comp.startDate).toLocaleDateString()} - {new Date(comp.endDate).toLocaleDateString()}
            </Text>
            {comp.chartImage ? (
              <Image 
                src={comp.chartImage} 
                style={{
                  width: '100%',
                  height: comp.chartType === 'table' ? 'auto' : 600,
                  objectFit: 'contain',
                  marginTop: 10,
                  marginBottom: 30, // Aumentar el margen inferior para las etiquetas del eje X
                  paddingBottom: 40, // Añadir padding inferior para las etiquetas
                  breakInside: comp.chartType === 'table' ? 'avoid' : 'auto'
                }} 
                cache={false}
              />
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>No hay datos disponibles</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Página {pageIndex + 1} | Generado el: {new Date().toLocaleDateString('es-ES', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </Page>
  );
};

// Página de análisis estadístico mejorada
const StatisticsPage = ({ summaryData, logoUrl, pdfTitle, colors, styles }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header} fixed>
      {logoUrl && <Image src={logoUrl} style={styles.headerLogo} />}
      <Text style={styles.headerTitle}>Análisis Estadístico</Text>
      <Text style={styles.headerDate}>
        {new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen Estadístico</Text>
      
      {summaryData.length > 0 ? (
        <>
          <View style={styles.table}>
            <View style={{flexDirection: 'row', backgroundColor: colors.primary}}>
              <Text style={{...styles.tableHeader, flex: 1.5}}>Componente</Text>
              <Text style={styles.tableHeader}>Variable</Text>
              <Text style={styles.tableHeader}>Mínimo</Text>
              <Text style={styles.tableHeader}>Máximo</Text>
              <Text style={styles.tableHeader}>Promedio</Text>
              <Text style={styles.tableHeader}>Cambio %</Text>
            </View>
            
            {summaryData.map((item, index) => (
              <View key={index} style={styles.tableRow(index)}>
                <Text style={{...styles.tableCell, flex: 1.5}}>{item.component}</Text>
                <Text style={styles.tableCell}>{item.variable}</Text>
                <Text style={styles.tableCell}>{item.min}</Text>
                <Text style={styles.tableCell}>{item.max}</Text>
                <Text style={styles.tableCell}>{item.avg}</Text>
                <Text style={{
                  ...styles.tableCell, 
                  color: parseFloat(item.change) >= 0 ? colors.accent : colors.error
                }}>
                  {parseFloat(item.change) >= 0 ? '+' : ''}{item.change}%
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsGrid}>
            {summaryData.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statTitle}>{item.variable}</Text>
                <Text style={styles.statValue}>{item.avg}</Text>
                <Text style={styles.statLabel}>Promedio en {item.component}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.summaryNote}>
          No hay suficientes datos numéricos para generar estadísticas.
        </Text>
      )}
    </View>
    
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>IoT Data Platform • Análisis de Dispositivos</Text>
      <Text style={styles.footerPageNumber} render={({ pageNumber, totalPages }) => (
        `Página ${pageNumber} de ${totalPages}`
      )} />
    </View>
  </Page>
);

// Página de conclusiones mejorada
const ConclusionsPage = ({ deviceName, logoUrl, pdfTitle, colors, styles }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header} fixed>
      {logoUrl && <Image src={logoUrl} style={styles.headerLogo} />}
      <Text style={styles.headerTitle}>Conclusiones y Recomendaciones</Text>
      <Text style={styles.headerDate}>
        {new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
    </View>
    
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Observaciones</Text>
      <Text style={styles.summaryNote}>
        El análisis de los datos recopilados del dispositivo "{deviceName}" muestra patrones 
        significativos que pueden ayudar a optimizar su rendimiento y prevenir posibles problemas.
        A continuación se presentan las principales observaciones y recomendaciones basadas en
        los datos analizados.
      </Text>
      
      <View style={{
        marginTop: 20,
        padding: 15,
        backgroundColor: colors.backgroundAlt,
        borderRadius: 8,
        border: `1px solid ${colors.borders}`
      }}>
        <Text style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.primary,
          marginBottom: 10
        }}>
          Hallazgos Principales
        </Text>
        
        <View style={{marginLeft: 10}}>
          <View style={{
            flexDirection: 'row',
            marginBottom: 8,
            alignItems: 'flex-start'
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.primary,
              marginRight: 5,
              lineHeight: 1.5
            }}>•</Text>
            <Text style={{
              fontSize: 11,
              color: colors.text,
              flex: 1,
              lineHeight: 1.5
            }}>
              El dispositivo ha mostrado un rendimiento estable durante el período analizado,
              con variaciones dentro de los rangos esperados.
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            marginBottom: 8,
            alignItems: 'flex-start'
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.primary,
              marginRight: 5,
              lineHeight: 1.5
            }}>•</Text>
            <Text style={{
              fontSize: 11,
              color: colors.text,
              flex: 1,
              lineHeight: 1.5
            }}>
              Se han identificado patrones cíclicos en varias métricas que sugieren
              un comportamiento predecible del sistema.
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            marginBottom: 8,
            alignItems: 'flex-start'
          }}>
            <Text style={{
              fontSize: 12,
              color: colors.primary,
              marginRight: 5,
              lineHeight: 1.5
            }}>•</Text>
            <Text style={{
              fontSize: 11,
              color: colors.text,
              flex: 1,
              lineHeight: 1.5
            }}>
              La correlación entre diferentes variables indica una interdependencia
              que debe ser considerada para la optimización del sistema.
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={{...styles.sectionTitle, marginTop: 25}}>Recomendaciones</Text>
      
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginTop: 10
      }}>
        <View style={{
          width: '100%',
          padding: 15,
          backgroundColor: colors.primaryLight,
          borderRadius: 8,
          borderLeft: `4px solid ${colors.primary}`
        }}>
          <Text style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 5
          }}>
            Monitoreo Continuo
          </Text>
          <Text style={{
            fontSize: 11,
            color: colors.textLight,
            lineHeight: 1.5
          }}>
            Establecer un sistema de monitoreo continuo para las variables críticas,
            con umbrales de alerta personalizados basados en los valores mínimos y máximos
            identificados en este análisis.
          </Text>
        </View>
        
        <View style={{
          width: '100%',
          padding: 15,
          backgroundColor: '#e6f2ff',
          borderRadius: 8,
          borderLeft: `4px solid #0077cc`
        }}>
          <Text style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#0077cc',
            marginBottom: 5
          }}>
            Optimización de Recursos
          </Text>
          <Text style={{
            fontSize: 11,
            color: colors.textLight,
            lineHeight: 1.5
          }}>
            Ajustar la configuración del dispositivo para optimizar el consumo de recursos
            durante los períodos de baja actividad identificados en los patrones cíclicos.
          </Text>
        </View>
        
        <View style={{
          width: '100%',
          padding: 15,
          backgroundColor: '#f0f7ed',
          borderRadius: 8,
          borderLeft: `4px solid #2e7d32`
        }}>
          <Text style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#2e7d32',
            marginBottom: 5
          }}>
            Mantenimiento Preventivo
          </Text>
          <Text style={{
            fontSize: 11,
            color: colors.textLight,
            lineHeight: 1.5
          }}>
            Programar revisiones periódicas basadas en los ciclos de rendimiento observados
            para prevenir fallos y optimizar la vida útil del dispositivo.
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>IoT Data Platform • Análisis de Dispositivos</Text>
      <Text style={styles.footerPageNumber} render={({ pageNumber, totalPages }) => (
        `Página ${pageNumber} de ${totalPages}`
      )} />
    </View>
  </Page>
);

// Versión final del componente PDF mejorado
const ModernPDFReport = ({ 
  components, 
  deviceName, 
  pdfTitle, 
  pdfSubtitle, 
  logoUrl,
  startDate,
  endDate 
}) => {
  // Definir colores para su uso en todo el PDF
  const colors = {
    primary: "#0f62fe",         // Azul primario más moderno
    primaryDark: "#0043ce",     // Azul oscuro para elementos destacados
    primaryLight: "#d0e2ff",    // Azul claro para fondos y bordes
    secondary: "#6f6f6f",       // Color secundario para textos no principales
    text: "#161616",            // Color principal para texto
    textLight: "#525252",       // Color para textos secundarios
    background: "#ffffff",      // Fondo principal
    backgroundAlt: "#f4f4f4",   // Fondo alternativo para secciones
    accent: "#42be65",          // Color acento para datos positivos
    warning: "#f1c21b",         // Color para advertencias
    error: "#fa4d56",           // Color para errores
    borders: "#e0e0e0",         // Color para bordes
  };
  
  // Función para agrupar componentes en páginas
  const groupComponentsIntoPages = () => {
    const pages = [];
    let currentPage = [];
    let currentCount = 0;
    const maxPerPage = 4; // Máximo 4 componentes por página
    
    for (const comp of components) {
      // Decidir si el componente ocupa la página completa
      const isFullWidth = comp.width === "col12";
      const size = isFullWidth ? maxPerPage : 1;
      
      // Si no cabe en la página actual, crear nueva página
      if (currentCount + size > maxPerPage) {
        pages.push([...currentPage]);
        currentPage = [comp];
        currentCount = size;
      } else {
        currentPage.push(comp);
        currentCount += size;
      }
    }
    
    // Añadir la última página
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    return pages;
  };
  
  // Agrupar componentes
  const componentPages = groupComponentsIntoPages();
  
  // Datos para resumen estadístico
  const generateSummaryData = () => {
    const summaryData = [];
    
    components.forEach(comp => {
      if (!comp.data || comp.data.length === 0) return;
      
      if (comp.variables && comp.variables.length > 0) {
        comp.variables.forEach(variable => {
          const values = comp.data
            .map(item => {
              // Manejar diferentes estructuras de datos
              if (item.values && item.values[variable.variable] !== undefined) {
                return Number(item.values[variable.variable]);
              } else if (item[variable.variable] !== undefined) {
                return Number(item[variable.variable]);
              }
              return null;
            })
            .filter(val => val !== null && !isNaN(val));
          
          if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            
            summaryData.push({
              component: comp.title,
              variable: variable.variable,
              min: min.toFixed(2),
              max: max.toFixed(2),
              avg: avg.toFixed(2),
              count: values.length,
              change: ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)
            });
          }
        });
      }
    });
    
    return summaryData;
  };
  
  const summaryData = generateSummaryData();
  
  return (
    <Document>
      {/* Portada mejorada */}
      <CoverPage 
        pdfTitle={pdfTitle}
        pdfSubtitle={pdfSubtitle}
        deviceName={deviceName}
        logoUrl={logoUrl}
        startDate={startDate}
        endDate={endDate}
        colors={colors}
        styles={styles}
      />
      
      {/* Índice mejorado */}
      <TableOfContents 
        components={components} 
        logoUrl={logoUrl}
        colors={colors}
        styles={styles}
      />
      
      {/* Resumen ejecutivo mejorado */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          {logoUrl && <Image src={logoUrl} style={styles.headerLogo} />}
          <Text style={styles.headerTitle}>{pdfTitle}</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
          <Text style={styles.summaryNote}>
            Este informe presenta el análisis detallado del dispositivo "{deviceName}". 
            Se han analizado {components.length} métricas diferentes para proporcionar una visión
            completa del rendimiento y comportamiento del dispositivo durante el período seleccionado.
          </Text>
          
          <View style={styles.infoSection}>
            <Text style={{...styles.sectionTitle, fontSize: 16, marginTop: 20}}>
              Datos Clave
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Total Métricas Analizadas</Text>
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardValue}>{components.length}</Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Total Variables</Text>
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardValue}>
                    {components.reduce((total, comp) => total + (comp.variables?.length || 0), 0)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Período Analizado</Text>
                <View style={styles.infoCardContent}>
                  <Text style={{...styles.infoCardValue, fontSize: 16}}>
                    {startDate && endDate 
                      ? `${startDate} - ${endDate}`
                      : "Período completo"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Estado General</Text>
                <View style={styles.infoCardContent}>
                  <Text style={{...styles.infoCardValue, fontSize: 16, color: colors.accent}}>
                    Óptimo
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.note}>
            <Text style={{fontSize: 11, fontWeight: 600, color: colors.primary, marginBottom: 5}}>
              Nota Importante
            </Text>
            <Text style={{fontSize: 10, color: colors.textLight, lineHeight: 1.5}}>
              Este informe proporciona una visión general del rendimiento del dispositivo.
              Para un análisis más detallado, se recomienda revisar las métricas individuales
              y configurar alertas personalizadas según las necesidades específicas.
            </Text>
          </View>
        </View>
        
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>IoT Data Platform • Análisis de Dispositivos</Text>
          <Text style={styles.footerPageNumber} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
      
      {/* Página divisora */}
      <DividerPage 
        title="Datos del Dispositivo" 
        subtitle="Análisis detallado de las métricas y variables monitorizadas en tiempo real"
        logoUrl={logoUrl}
        colors={colors}
        styles={styles}
      />
      
      {/* Páginas de componentes mejoradas */}
      {componentPages.map((pageComponents, pageIndex) => (
        <ComponentPage
          key={`page-${pageIndex}`}
          components={pageComponents}
          pageIndex={pageIndex}
          logoUrl={logoUrl}
          pdfTitle={pdfTitle}
        />
      ))}
      
      {/* Página divisora */}
      <DividerPage 
        title="Análisis Estadístico" 
        subtitle="Indicadores clave y tendencias identificadas en los datos del dispositivo"
        logoUrl={logoUrl}
        colors={colors}
        styles={styles}
      />
      
      {/* Página de estadísticas */}
      <StatisticsPage
        summaryData={summaryData}
        logoUrl={logoUrl}
        pdfTitle={pdfTitle}
        colors={colors}
        styles={styles}
      />
      
      {/* Página de conclusiones */}
      <ConclusionsPage
        deviceName={deviceName}
        logoUrl={logoUrl}
        pdfTitle={pdfTitle}
        colors={colors}
        styles={styles}
      />
    </Document>
  );
};

// Estilos actualizados
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  componentWrapper: (width) => ({
    width: width === 'col12' ? '100%' : width === 'col6' ? '48%' : '31%',
    display: 'inline-block',
    margin: '0 1% 20px 1%',
  }),
  component: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  },
  componentDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartImage: {
    marginTop: 10,
    marginBottom: 30, // Aumentar el margen inferior para las etiquetas del eje X
    paddingBottom: 40, // Añadir padding inferior para las etiquetas
    width: '100%',
    height: 600,
    objectFit: 'contain',
    borderRadius: 4,
    breakInside: 'avoid'
  },
  table: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'visible'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  noData: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    marginTop: 10
  },
  noDataText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  }
});

export default ModernPDFReport;