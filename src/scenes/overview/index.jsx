import { Box, useTheme } from "@mui/material";
import Header from "../../components/header";
import { tokens } from "../../theme";
import DeviceOverview from "../../data/device-overview";

const Overview = () => {
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
      <Header title="Device Overview" subtitle={`${formattedDate}`} />

      <DeviceOverview />
    </Box>
  );
};

export default Overview;
