import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import initializeFirebase from "./firebase/firebase";
import { ref, get } from "firebase/database";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import cloggedIcon from "../icons/clogged-icon.svg";
import clearedIcon from "../icons/cleared-icon.svg";
import { useTheme } from "@emotion/react";
import { tokens } from "../theme";
import { Button } from "@mui/material";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import ErrorIcon from "@mui/icons-material/Error";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import Chart from "chart.js/auto";

const clogIcon = L.icon({
  iconUrl: cloggedIcon,
  iconSize: [30, 30],
});

const clearIcon = L.icon({
  iconUrl: clearedIcon,
  iconSize: [30, 30],
});

export default function DashboardComponents() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [center, setCenter] = useState([14.577694, 120.9856868]);
  const mapRef = useRef();
  const chartRefHour = useRef(null);
  const [maintenanceCounts, setMaintenanceCounts] = useState({
    pending: 0,
    nomaintenancereq: 0,
    inprogress: 0,
  });

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
                latitude,
                longitude,
                maintenanceStatus,
                isClogged,
              } = deviceData;

              let clogStatus = "Cleared";
              let clogHistory = [];

              if (isClogged) {
                const clogEvents = Object.entries(isClogged).map(
                  ([timestamp, status]) => ({
                    timestamp,
                    status: status ? "Clogged" : "Unclogged",
                  })
                );

                // Sorting the clog events by timestamp
                clogEvents.sort((a, b) => a.timestamp - b.timestamp);

                // Taking the latest clog status
                const latestClogEvent = clogEvents[clogEvents.length - 1];
                if (latestClogEvent) {
                  clogStatus = latestClogEvent.status;
                  clogHistory = clogEvents;
                }
              }

              return {
                name,
                address,
                latitude,
                longitude,
                maintenanceStatus,
                clogStatus,
                clogHistory,
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

          let counts = {
            pending: 0,
            nomaintenancereq: 0,
            inprogress: 0,
          };

          gutterLocations.forEach((deviceData) => {
            counts[deviceData.maintenanceStatus]++;
          });

          setMaintenanceCounts(counts);

          const cloggingEvents = {
            Clogged: Array.from({ length: 24 }, () => 0),
            Unclogged: Array.from({ length: 24 }, () => 0),
          };

          gutterLocations.forEach(({ clogHistory }) => {
            clogHistory.forEach(({ timestamp, status }) => {
              const hour = new Date(parseInt(timestamp)).getHours();
              cloggingEvents[status][hour]++; // Increment the count for the corresponding hour
            });
          });

          drawChart(cloggingEvents, "hour");
        } else {
          console.log("No data available under GutterLocations.");
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchDataFromFirebase();
  }, []);

  const drawChart = (cloggingEvents, type) => {
    if (
      !cloggingEvents ||
      !cloggingEvents.Clogged ||
      !cloggingEvents.Unclogged
    ) {
      console.error("cloggingEvents or its properties are undefined");
      return;
    }

    const ctx = document.getElementById(`clogging-chart-${type}`);

    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    const datasets = [
      {
        label: `Clogged`,
        data: cloggingEvents.Clogged,
        borderColor: "rgba(255, 60, 60, 0.86)",
        backgroundColor: "rgba(255, 222, 222, 0.71)",
        borderWidth: 1,
        fill: true,
      },
      {
        label: `Unclogged`,
        data: cloggingEvents.Unclogged,
        borderColor: "rgba(50, 168, 255, 0.71)",
        backgroundColor: "rgba(186, 225, 255, 0.71)",
        borderWidth: 1,
        fill: true,
      },
    ];

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            min: 0,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Clogging Frequency per Hour",
          font: {
            size: 14,
          },
        },
      },
    };

    if (chartRefHour.current) {
      chartRefHour.current.destroy();
    }

    chartRefHour.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: options,
    });
  };

  const maintenanceStatusMapping = {
    pending: "Pending",
    nomaintenancereq: "No maintenance required",
    inprogress: "In progress",
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MapContainer
          center={center}
          zoom={16}
          ref={mapRef}
          style={{ height: "100%", width: "100%" }}
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
                  <p>
                    Maintenance Status:{" "}
                    {maintenanceStatusMapping[row.maintenanceStatus]}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper style={{ height: "320px", width: "100%" }}>
          <canvas id="clogging-chart-hour" />
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper elevation={2}>
          <div
            style={{ display: "flex", alignItems: "center", padding: "30px" }}
          >
            <ErrorIcon
              style={{ fontSize: 80, color: "orange", marginRight: "20px" }}
            />
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontWeight: "normal",
                  margin: "0",
                  marginLeft: "10px",
                }}
              >
                Pending Maintenance
              </h3>
              <h3 style={{ margin: "0", fontSize: "50px", marginLeft: "10px" }}>
                {maintenanceCounts.pending}
              </h3>
            </div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={2}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "30px",
            }}
          >
            <PublishedWithChangesIcon
              style={{
                fontSize: 80,
                color: "green",
                marginRight: "30px",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontWeight: "normal",
                  margin: "0",
                }}
              >
                Under maintenance
              </h3>
              <h1 style={{ margin: "0", fontSize: "50px" }}>
                {maintenanceCounts.inprogress}
              </h1>
            </div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={2}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "30px",
            }}
          >
            <NotificationImportantIcon
              style={{
                fontSize: 80,
                color: "red",
                marginRight: "30px",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontWeight: "normal",
                  margin: "0",
                }}
              >
                Clogged Gutters
              </h3>
              <h1 style={{ margin: "0", fontSize: "50px" }}>
                {rows.filter((row) => row.clogStatus === "Clogged").length}
              </h1>
            </div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3} style={{ textAlign: "center" }}>
        <Link to="/device-config">
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.orangeAccent[400],
              color: colors.primary[900],
              "&:hover": {
                backgroundColor: colors.orangeAccent[300],
              },
              borderRadius: "5px",
              width: "100%",
              height: "100%",
              fontSize: "20px",
            }}
            fullWidth
          >
            ADD NEW DEVICE
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
}
