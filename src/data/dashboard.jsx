import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Import Link
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

  const [maintenanceCounts, setMaintenanceCounts] = useState({
    pending: 0,
    nomaintenancereq: 0,
    inprogress: 0,
  });

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
                const uniqueClogs = {};
                Object.entries(isClogged).forEach(([timestamp, status]) => {
                  if (
                    !uniqueClogs[name] ||
                    uniqueClogs[name].timestamp < timestamp
                  ) {
                    uniqueClogs[name] = { timestamp, status };
                  }
                });

                clogHistory = Object.values(uniqueClogs).map(
                  ({ timestamp, status }) => ({
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
      <Grid item xs={12} md={6}>
        <MapContainer
          center={center}
          zoom={16}
          ref={mapRef}
          style={{ height: "525px", width: "100%" }}
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
          {Object.keys(maintenanceCounts).length > 0 && (
            <>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h4
                    style={{
                      fontWeight: "normal",
                    }}
                  >
                    Pending Maintenance:
                  </h4>
                  <h1>{maintenanceCounts.pending}</h1>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h4 style={{ fontWeight: "normal" }}>
                    Currently under maintenance:
                  </h4>
                  <h1> {maintenanceCounts.inprogress}</h1>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <div style={{ textAlign: "left" }}>
                    <h3
                      style={{
                        fontWeight: "normal",
                        display: "inline-block",
                        marginRight: "10px",
                      }}
                    >
                      Clogged Gutters:
                    </h3>
                    <h1 style={{ display: "inline-block", margin: "0" }}>
                      {
                        rows.filter((row) => row.clogStatus === "Clogged")
                          .length
                      }
                    </h1>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} style={{ textAlign: "center" }}>
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
                      padding: "10px 20px",
                      width: "100%",
                      height: "100%",
                      fontSize: "18px",
                    }}
                    fullWidth
                  >
                    ADD NEW DEVICE
                  </Button>
                </Link>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
