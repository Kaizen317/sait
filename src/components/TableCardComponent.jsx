import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  Box,
  Typography
} from '@mui/material';

const TableCardComponent = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filterText, setFilterText] = useState('');
  const [processedData, setProcessedData] = useState({ columns: [], rows: [] });

  useEffect(() => {
    if (!data || !data.variables || !Array.isArray(data.variables)) {
      console.log("No hay datos disponibles o formato incorrecto", data);
      return;
    }

    // Procesar las columnas
    const columns = data.variables.map(variable => ({
      id: variable.variable,
      label: variable.name || variable.variable,
      numeric: true
    }));

    // Procesar las filas
    let rows = [];
    data.variables.forEach(variable => {
      if (variable.value !== undefined) {
        // Si solo hay un valor actual
        const row = {
          timestamp: new Date().toISOString(),
          [variable.variable]: variable.value
        };
        rows.push(row);
      } else if (variable.history && Array.isArray(variable.history)) {
        // Si hay historial
        variable.history.forEach((entry, index) => {
          if (!rows[index]) {
            rows[index] = { timestamp: entry.timestamp };
          }
          rows[index][variable.variable] = entry.value;
        });
      }
    });

    // Eliminar filas vacías o incompletas
    rows = rows.filter(row => Object.keys(row).length > 1);

    setProcessedData({ columns, rows });
    console.log("Datos procesados:", { columns, rows });
  }, [data]);

  // Función de ordenamiento
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Función de comparación para ordenamiento
  const compareValues = (a, b) => {
    if (!a || !b) return 0;
    if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
    return a.toString().localeCompare(b.toString());
  };

  // Filtrar y ordenar datos
  const filteredAndSortedRows = processedData.rows
    .filter(row => 
      Object.values(row).some(value => 
        value?.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (orderBy) {
        const comparison = compareValues(a[orderBy], b[orderBy]);
        return order === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

  // Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!data || !data.variables || processedData.rows.length === 0) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Typography variant="body1" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TextField
        label="Filtrar"
        variant="outlined"
        size="small"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              {processedData.columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                  {processedData.columns.map((column) => (
                    <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                      {row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default TableCardComponent;
