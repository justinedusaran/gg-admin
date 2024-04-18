import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import cloggedIcon from "../icons/clogged-icon.svg";
import clearedIcon from "../icons/cleared-icon.svg";
import initializeFirebase from "./firebase/firebase";
import { ref, get } from "firebase/database";

const clogIcon = L.icon({
  iconUrl: cloggedIcon,
  iconSize: [30, 30],
});

const clearIcon = L.icon({
  iconUrl: clearedIcon,
  iconSize: [30, 30],
});

export default function DeviceLocation() {
  const [rows, setRows] = useState([]);
  const [center, setCenter] = useState([14.5798232, 120.98568789]);
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

              const mappedMaintenanceStatus = {
                inprogress: "In progress",
                nomaintenancereq: "No maintenance required",
                pending: "Pending",
              };

              return {
                name,
                address,
                latitude,
                longitude,
                maintenanceStatus:
                  mappedMaintenanceStatus[maintenanceStatus.toLowerCase()],
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

  return (
    <MapContainer
      center={center}
      zoom={16}
      ref={mapRef}
      style={{ height: "525px", width: "100%" }}
      maxZoom={18}
      minZoom={14}
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
  );
}
