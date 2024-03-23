import * as React from "react";
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
import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";

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
    id: "imagePath",
    label: "Image",
    minWidth: 50,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "address",
    label: "Address",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "isClogged",
    label: "Clog Status",
    minWidth: 100,
    align: "center",
    format: (value) => (value ? "Clogged" : "Clear"),
  },
];

function createData(id, name, imagePath, address, isClogged) {
  return { id, name, imagePath, address, isClogged };
}

export default function DeviceManagement() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [fileName, setFileName] = React.useState("");
  const [idInput, setIdInput] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [addressInput, setAddressInput] = React.useState("");
  const [rows, setRows] = React.useState([
    createData(
      "id83428342",
      "United Nations",
      "UN.jpg",
      "Taft Ave, Manila",
      DEFAULT_CLOG_STATUS
    ),
  ]);

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
      fileName,
      addressInput,
      DEFAULT_CLOG_STATUS
    );
    setRows([...rows, newDevice]);
    setIdInput("");
    setNameInput("");
    setAddressInput("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
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
                  .map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.code}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.id === "isClogged"
                                ? row.isClogged
                                  ? "Clogged"
                                  : "Clear"
                                : row[column.id]}
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
            label="ID"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={2}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ color: colors.primary[100] }}
              >
                Image
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <label htmlFor="contained-button-file">
                <Input
                  accept="image/*"
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={handleFileChange}
                  sx={{ display: "none" }}
                />
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                  sx={{
                    backgroundColor: colors.orangeAccent[400],
                    color: colors.primary[900],
                    "&:hover": {
                      backgroundColor: colors.orangeAccent[300],
                    },
                  }}
                >
                  {fileName ? fileName : "Choose File"}
                </Button>
              </label>
            </Grid>
          </Grid>
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            sx={{ marginTop: 2, marginBottom: 2 }}
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
