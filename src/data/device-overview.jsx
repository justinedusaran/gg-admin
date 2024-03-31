import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import initializeFirebase from "./firebase/firebase";
import { ref, get } from "firebase/database";

const columns = [
  {
    id: "name",
    label: "Name",
    minWidth: 100,
    align: "center",
  },
  {
    id: "address",
    label: "Address",
    minWidth: 100,
    align: "center",
  },
  {
    id: "latitude",
    label: "Latitude",
    minWidth: 100,
    align: "center",
  },
  {
    id: "longitude",
    label: "Longitude",
    minWidth: 100,
    align: "center",
  },
  {
    id: "clogStatus",
    label: "Clog Status",
    minWidth: 100,
    align: "center",
  },
  {
    id: "maintenanceStatus",
    label: "Maintenance Status",
    minWidth: 100,
    align: "center",
  },
];

function createData(
  name,
  address,
  latitude,
  longitude,
  clogStatus,
  maintenanceStatus
) {
  return { name, address, latitude, longitude, clogStatus, maintenanceStatus };
}

export default function DeviceOverview() {
  const [rows, setRows] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  useEffect(() => {
    const database = initializeFirebase();
    const paramPath = "/GutterLocations";
    const paramRef = ref(database, paramPath);

    const fetchDataFromFirebase = async () => {
      try {
        const snapshot = await get(paramRef);
        const data = snapshot.val();
        if (data) {
          const gutterLocations = Object.values(data).map(
            ({
              name,
              address,
              latitude,
              longitude,
              clogStatus,
              maintenanceStatus,
            }) =>
              createData(
                name,
                address,
                latitude,
                longitude,
                clogStatus,
                maintenanceStatus
              )
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

    return () => {};
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 400, width: "100%" }}>
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
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.address}</TableCell>
                    <TableCell align="center">{row.latitude}</TableCell>
                    <TableCell align="center">{row.longitude}</TableCell>
                    <TableCell align="center">
                      {row.clogStatus ? "Clogged" : "Cleared"}
                    </TableCell>
                    <TableCell align="center">
                      {row.maintenanceStatus}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[8, 16, 24]}
            component="div"
            rowsPerPage={rowsPerPage}
            page={0}
            count={rows.length}
            onPageChange={(e, newPage) => console.log(newPage)}
            onRowsPerPageChange={(e) => setRowsPerPage(e.target.value)}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
          <div
            style={{
              width: "100%",
              overflow: "hidden",
              marginBottom: "0px",
            }}
          >
            <div className="gmap_canvas">
              <iframe
                src={`https://maps.google.com/maps?q=NCR&amp;t=&amp;z=10&amp;ie=UTF8&amp;iwloc=&amp;output=embed`}
                frameBorder="1"
                title="Google Map"
                style={{
                  border: "0.1px solid #3d3d3d",
                  borderRadius: "8px",
                  width: "100%",
                  height: "485px",
                }}
              />
            </div>
          </div>
      </Grid>
    </Grid>
  );
}
