import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/header";
import DeviceManagement from "../../data/device-table";

const DeviceConfig = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const currentDate = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Header title="Device Configuration" subtitle={`${formattedDate}`} />
      {/* TABLE */}
      <Box mt={1}>
        <DeviceManagement />
      </Box>
    </Box>
  );
};

export default DeviceConfig;
