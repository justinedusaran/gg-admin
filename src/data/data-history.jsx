import React, { useState, useEffect, useRef } from "react";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import initializeFirebase from "./firebase/firebase";
import { ref, get } from "firebase/database";

export default function DataHistory() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  function formatTimestamp(timestamp) {
    const month = parseInt(timestamp.substring(0, 2)) - 1;
    const day = parseInt(timestamp.substring(2, 4));
    const year = parseInt(timestamp.substring(4, 8));
    let hours = parseInt(timestamp.substring(9, 11));
    const minutes = parseInt(timestamp.substring(11, 13));
    const seconds = parseInt(timestamp.substring(13, 15));

    const date = new Date(year, month, day, hours, minutes, seconds);

    if (isNaN(date.getTime())) {
      return "Invalid Timestamp";
    }

    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();
    return `${dateString}, ${timeString}`;
  }

  useEffect(() => {
    const fetchDataFromFirebase = async () => {
      try {
        const database = initializeFirebase();
        const paramPath = "/GutterLocations";
        const paramRef = ref(database, paramPath);
        const snapshot = await get(paramRef);
        const data = snapshot.val();

        if (data) {
          const gutterLocations = Object.entries(data).map(
            ([deviceId, deviceData]) => {
              const {
                name,
                address,
                maintenanceStatus,
                isClogged,
                clogHistory: originalClogHistory,
              } = deviceData;

              let clogHistory = [];
              if (isClogged) {
                clogHistory = Object.entries(isClogged).map(
                  ([timestamp, status]) => ({
                    timestamp,
                    status: status ? "Clogged" : "Cleared",
                  })
                );
              } else if (originalClogHistory) {
                clogHistory = originalClogHistory.map((entry) => ({
                  timestamp: entry.timestamp,
                  status: entry.status ? "Clogged" : "Cleared",
                }));
              }

              return {
                name,
                address,
                maintenanceStatus,
                clogHistory,
              };
            }
          );

          setRows(gutterLocations);
        } else {
          console.log("No data available under GutterLocations.");
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchDataFromFirebase();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper>
          <TableContainer>
            <Table stickyHeader aria-label="clog-history-table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Timestamp</TableCell>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Clog Status</TableCell>
                  <TableCell align="center">Maintenance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) =>
                    row.clogHistory.map((entry, idx) => (
                      <TableRow key={`${index}-${idx}`}>
                        <TableCell align="center">
                          {formatTimestamp(entry.timestamp)}
                        </TableCell>
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">{entry.status}</TableCell>
                        <TableCell align="center">
                          {row.maintenanceStatus}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 16, 24]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
