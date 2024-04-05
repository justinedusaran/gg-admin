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

export default function DeviceOverview() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [center, setCenter] = useState([14.5805353, 120.9856868]);
  const mapRef = useRef();

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

              if (isClogged) {
                const timestamps = Object.keys(isClogged);
                const latestTimestamp =
                  timestamps.length > 0
                    ? timestamps[timestamps.length - 1]
                    : null;
                const latestStatus = isClogged[latestTimestamp];

                if (latestStatus !== undefined) {
                  clogStatus = latestStatus ? "Clogged" : "Cleared";
                }
              }

              return {
                name,
                address,
                latitude,
                longitude,
                maintenanceStatus,
                clogStatus,
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
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={center}
            zoom={17}
            ref={mapRef}
            style={{ height: "400px", width: "100%" }}
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
                    <p>Latitude: {row.latitude}</p>
                    <p>Longitude: {row.longitude}</p>
                    <p>Clog Status: {row.clogStatus}</p>
                    <p>Maintenance Status: {row.maintenanceStatus}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Grid>
      <Grid item xs={12} paddingBottom={3}>
        <Paper>
          <TableContainer>
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
                    <TableRow key={row.name}>
                      <TableCell align="center">{row.name}</TableCell>
                      <TableCell align="center">{row.address}</TableCell>
                      <TableCell align="center">{row.latitude}</TableCell>
                      <TableCell align="center">{row.longitude}</TableCell>
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
