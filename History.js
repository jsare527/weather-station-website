import React, {useState, useEffect} from "react";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Container from 'react-bootstrap/Container';


const columns = [
    { id: 'current_day', label: 'Date', minWidth: 170 },
    { id: 'time_taken', label: 'Time taken', minWidth: 100 },
    {
      id: 'ambient_temperature',
      label: 'Air temp',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'humidity',
      label: 'Humidity',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'wind_speed',
      label: 'Wind speed',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'wind_gust',
      label: 'Wind gust',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'pressure',
      label: 'Pressure',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toFixed(2),
    },
    {
      id: 'ground_temp',
      label: 'Ground temp',
      minWidth: 170,
      align: 'right',
      format: (value) => value.toFixed(2),
    }
  ];


function fetchAPI(){
  const [data, setdata] = useState([]);
  useEffect(() => {
    async function fetchData(){
      try {
        let response = await fetch("https://55i449sxbd.execute-api.us-east-2.amazonaws.com/default/website-api");
        response = await response.json();
        setdata(response);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);
  return data;
}

export default function History(){
    const rows = fetchAPI();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
  };
    return(
      <Container data-bs-theme="dark">
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 700 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format && typeof value === 'number'
                                ? column.format(value)
                                : value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
    );
}
