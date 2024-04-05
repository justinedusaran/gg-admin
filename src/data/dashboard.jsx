import React, { useState, useEffect, useRef } from "react";
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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import cloggedIcon from "../icons/clogged-icon.svg";
import clearedIcon from "../icons/cleared-icon.svg";

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
    id: "isClogged",
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

const clogIcon = L.icon({
  iconUrl: cloggedIcon,
  iconSize: [30, 30],
});

const clearIcon = L.icon({
  iconUrl: clearedIcon,
  iconSize: [30, 30],
});

export default function DashboardComponents() {
  const [rows, setRows] = useState([]);
  const [page1, setPage1] = useState(0);
  const [page2] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [center, setCenter] = useState([14.577694, 120.9856868]);
  const mapRef = useRef();

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
    const database = initializeFirebase();
    const paramPath = "/GutterLocations";
    const paramRef = ref(database, paramPath);

    const fetchDataFromFirebase = async () => {
      try {
        const snapshot = await get(paramRef);
        const data = snapshot.val();
        if (data) {
          const gutterLocations = Object.entries(data).map(
            ([deviceId, deviceData]) => {
              const {
                name,
                address,
                latitude,
                longitude,
                maintenanceStatus,
                isClogged,
              } = deviceData;

              let clogStatus = "Cleared";
              let clogHistory = [];

              if (isClogged) {
                clogHistory = Object.entries(isClogged).map(
                  ([timestamp, status]) => ({
                    timestamp,
                    status: status ? "Clogged" : "Cleared",
                  })
                );
                const latestStatus = clogHistory[clogHistory.length - 1];
                if (latestStatus) {
                  clogStatus = latestStatus.status;
                }
              }
              return {
                name,
                address,
                latitude,
                longitude,
                maintenanceStatus,
                clogStatus,
                clogHistory, // Add clogHistory field
              };
            }
          );

          setRows(gutterLocations);

          if (gutterLocations.length > 0) {
            const centerLocation = gutterLocations[0];
            setCenter([
              parseFloat(centerLocation.latitude),
              parseFloat(centerLocation.longitude),
            ]);
          }
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

  const handleChangePage1 = (event, newPage) => {
    setPage1(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage1(0);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <MapContainer
          center={center}
          zoom={16}
          ref={mapRef}
          style={{ height: "490px", width: "100%" }}
        >
          <TileLayer
            url="https://api.maptiler.com/maps/dataviz/256/{z}/{x}/{y}.png?key=qKtzXYmOKKYYAxMzX6D4"
            attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
          />
          {rows.map((row, index) => (
            <Marker
              key={index}
              position={[parseFloat(row.latitude), parseFloat(row.longitude)]}
              icon={row.clogStatus === "Clogged" ? clogIcon : clearIcon}
            >
              <Popup>
                <div>
                  <h2>{row.name}</h2>
                  <p>Address: {row.address}</p>
                  <p>Clog Status: {row.clogStatus}</p>
                  <p>Maintenance Status: {row.maintenanceStatus}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper>
              <TableContainer>
                <Table stickyHeader aria-label="device-info-table">
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
                      .slice(
                        page1 * rowsPerPage,
                        page1 * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">{row.name}</TableCell>
                          <TableCell align="center">{row.address}</TableCell>
                          <TableCell align="center">{row.clogStatus}</TableCell>
                          <TableCell align="center">
                            {row.maintenanceStatus}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[3]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page1}
                onPageChange={handleChangePage1}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper>
              <TableContainer>
                <Table stickyHeader aria-label="clog-history-table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Timestamp</TableCell>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Clog Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(
                        page2 * rowsPerPage,
                        page2 * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => (
                        <React.Fragment key={index}>
                          {row.clogHistory
                            .sort(
                              (a, b) =>
                                new Date(b.timestamp) - new Date(a.timestamp)
                            )
                            .map((entry, idx) => (
                              <TableRow key={`${index}-${idx}`}>
                                <TableCell align="center">
                                  {formatTimestamp(entry.timestamp)}
                                </TableCell>
                                <TableCell align="center">{row.name}</TableCell>
                                <TableCell align="center">
                                  {entry.status}
                                </TableCell>
                              </TableRow>
                            ))}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
