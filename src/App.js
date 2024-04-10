import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isLoggedIn");
    if (isAuthenticated === "true") {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && location.pathname !== "/") {
      localStorage.setItem("lastVisitedRoute", location.pathname);
    }
  }, [loggedIn, location.pathname]);

  useEffect(() => {
    if (loggedIn && location.pathname === "/") {
      const lastVisitedRoute = localStorage.getItem("lastVisitedRoute");
      if (lastVisitedRoute) {
        navigate(lastVisitedRoute);
      } else {
        navigate("/dashboard");
      }
    }
  }, [loggedIn, location.pathname, navigate]);

  const handleLogin = () => {
    // Simulate successful login
    localStorage.setItem("isLoggedIn", "true");
    setLoggedIn(true);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    // Reset authentication state
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("lastVisitedRoute");
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {loggedIn && <Sidebar onLogout={handleLogout} />}
          <main className="content">
            {loggedIn && <Topbar loggedIn={loggedIn} onLogout={handleLogout} />}
            <Routes>
              <Route
                path="/"
                element={
                  loggedIn ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <LoginPage onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={loggedIn ? <Dashboard /> : <Navigate to="/" replace />}
              />
              <Route
                path="/device-location"
                element={loggedIn ? <Location /> : <Navigate to="/" replace />}
              />
              <Route
                path="/device-config"
                element={
                  loggedIn ? <DeviceConfig /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/historical"
                element={
                  loggedIn ? <HistoricalData /> : <Navigate to="/" replace />
                }
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
