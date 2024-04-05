import { Box, useTheme } from "@mui/material";
import Header from "../../components/header";
import { tokens } from "../../theme";
import DeviceLocation from "../../data/device-location";

const Location = () => {
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
      <Header title="Device Location" subtitle={`${formattedDate}`} />

      <DeviceLocation />
    </Box>
  );
};

export default Location;
