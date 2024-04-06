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

  const handleLogin = () => {
    return <Navigate to="/dashboard" />;
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
              <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/device-location" element={<Location />} />
              <Route path="/device-config" element={<DeviceConfig />} />
              <Route path="/historical" element={<HistoricalData />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
