import { useState } from "react";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/topbar";
import Sidebar from "./scenes/global/sidebar";
import Dashboard from "./scenes/dashboard";
import Location from "./scenes/device-location";
import HistoricalData from "./scenes/historical";
import DeviceConfig from "./scenes/device-config";
import LoginPage from "./scenes/login";

function App() {
  const [theme, colorMode] = useMode();
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    // Simulate successful login
    setLoggedIn(true);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route
                path="/"
                element={
                  loggedIn ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <LoginPage onLogin={handleLogin} />
                  )
                }
              />
              <Route path="/dashboard" element={loggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/device-location" element={loggedIn ? <Location /> : <Navigate to="/" />} />
              <Route path="/device-config" element={loggedIn ? <DeviceConfig /> : <Navigate to="/" />} />
              <Route path="/historical" element={loggedIn ? <HistoricalData /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
