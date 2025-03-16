import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Box
} from '@mui/material';

const TableHistoricos = ({ data, title, showTitle = true }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  if (!data || !data.datasets || !data.labels) {
    return <div>No hay datos disponibles para mostrar.</div>;
  }

  // Preparar los datos para la tabla
  const tableData = data.labels.map((fecha, index) => {
    const row = { fecha };
    data.datasets.forEach(dataset => {
      row[dataset.label] = dataset.data[index];
    });
    return row;
  });

  console.log('Datos recibidos en la tabla:', {
    totalRegistros: tableData.length,
    datos: tableData
  });

  const columns = [
    { 
      id: 'fecha', 
      label: 'Fecha', 
      format: (value) => {
        try {
          const fecha = new Date(value);
          if (isNaN(fecha.getTime())) {
            return value; // Si no es una fecha válida, mostrar el valor original
          }
          return fecha.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        } catch (error) {
          console.error('Error al formatear fecha:', error);
          return value;
        }
      }
    },
    ...data.datasets.map(dataset => ({
      id: dataset.label,
      label: dataset.label,
      format: (value) => typeof value === 'number' ? value.toFixed(2) : value
    }))
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Asegurarse de mostrar todos los datos cuando rowsPerPage es -1
  const displayData = rowsPerPage === -1
    ? tableData
    : tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {showTitle && (
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            color: '#444',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          {title || 'Datos Históricos'}
        </Typography>
      )}
      
      <TableContainer 
        component={Paper}
        sx={{
          width: '100%',
          boxShadow: 'none',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: '4px',
          overflow: 'visible',
          maxHeight: 'none'
        }}
      >
        <Table sx={{ tableLayout: 'auto', width: '100%' }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    color: '#1a237e',
                    borderBottom: '2px solid #e0e0e0',
                    padding: '12px 16px',
                    whiteSpace: 'normal',
                    width: column.id === 'fecha' ? '200px' : 'auto',
                    minWidth: column.id === 'fecha' ? '200px' : '150px'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderBottom: '1px solid #e0e0e0'
                }}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.id}
                    sx={{
                      padding: '12px 16px',
                      whiteSpace: 'normal',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0',
                      width: column.id === 'fecha' ? '200px' : 'auto',
                      minWidth: column.id === 'fecha' ? '200px' : '150px'
                    }}
                  >
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[
            100,
            200,
            500,
            { label: 'Todos', value: -1 }
          ]}
          component="div"
          count={tableData.length}
          rowsPerPage={rowsPerPage}
          page={rowsPerPage === -1 ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            rowsPerPage === -1
              ? `Mostrando todos los ${count} registros`
              : `Mostrando ${from}-${to} de ${count} registros`
          }
          sx={{
            '.MuiTablePagination-select': {
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            },
            '.MuiTablePagination-displayedRows': {
              margin: '0 1rem'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default TableHistoricos;
