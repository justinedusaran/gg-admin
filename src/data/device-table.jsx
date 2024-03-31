import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { MenuItem } from "@mui/material";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";
import initializeFirebase from "../data/firebase/firebase";
import { ref, onValue } from "firebase/database";

const DEFAULT_CLOG_STATUS = false;

const columns = [
  {
    id: "id",
    label: "ID",
    align: "center",
    minWidth: 100,
  },
  {
    id: "name",
    label: "Name",
    align: "center",
    minWidth: 100,
  },
  {
    id: "address",
    label: "Address",
    minWidth: 100,
    align: "center",
  },
  {
    id: "isClogged",
    label: "Clog Status",
    minWidth: 100,
    align: "center",
    format: (value) => (value ? "Clogged" : "Clear"),
  },
];

function createData(id, name, address, isClogged) {
  return { id, name, address, isClogged };
}

export default function DeviceManagement() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [idInput, setIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [rows, setRows] = useState([
    createData(
      "id83428342",
      "United Nations",
      "Taft Ave, Manila",
      DEFAULT_CLOG_STATUS
    ),
  ]);
  const [idOptions, setIdOptions] = useState([]);

  useEffect(() => {
    const database = initializeFirebase();
    const paramPath = "/GutterLocations";
    const paramRef = ref(database, paramPath);

    const fetchDataFromFirebase = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ids = Object.keys(data);
        setIdOptions(ids);
      } else {
        console.log("No data available under GutterLocations.");
      }
    };

    const handleError = (error) => {
      console.error("Error fetching data from Firebase:", error);
      // You can handle errors, such as displaying an error message to the user.
    };

    // Subscribe to changes and fetch initial data
    const unsubscribe = onValue(paramRef, fetchDataFromFirebase, handleError);

    // Cleanup function
    return () => {
      // Unsubscribe from Firebase listener to prevent memory leaks
      unsubscribe();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAddDevice = () => {
    const newDevice = createData(
      idInput,
      nameInput,
      addressInput,
      DEFAULT_CLOG_STATUS
    );
    setRows([...rows, newDevice]);
    setIdInput("");
    setNameInput("");
    setAddressInput("");
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={8}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 400 }}>
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
                  .map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === "isClogged"
                            ? row.isClogged
                              ? "Clogged"
                              : "Clear"
                            : row[column.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            New Device
          </Typography>
          <TextField
            select
            label="ID"
            variant="filled"
            fullWidth
            InputLabelProps={{
              style: {
                color: colors.primary[200],
              },
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    backgroundColor: colors.primary[900],
                  },
                },
              },
            }}
            sx={{ marginBottom: 2 }}
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          >
            {idOptions && idOptions.length > 0 ? (
              idOptions.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  style={{ color: colors.primary[100] }}
                >
                  {option}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Loading...</MenuItem>
            )}
          </TextField>
          <TextField
            label="Name"
            variant="filled"
            fullWidth
            InputLabelProps={{
              style: {
                color: colors.primary[200],
              },
            }}
            sx={{ marginBottom: 2 }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <TextField
            label="Address"
            variant="filled"
            fullWidth
            InputLabelProps={{
              style: {
                color: colors.primary[200],
              },
            }}
            sx={{ marginBottom: 2 }}
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.orangeAccent[400],
              color: colors.primary[900],
              "&:hover": {
                backgroundColor: colors.orangeAccent[300],
              },
            }}
            onClick={handleAddDevice}
            fullWidth
          >
            Add Device
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
