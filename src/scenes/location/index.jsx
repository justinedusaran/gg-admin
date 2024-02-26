import { Box, useTheme } from "@mui/material";
import GeographyChart from "../../components/geo-chart";
import Header from "../../components/header";
import { tokens } from "../../theme";

const Geography = () => {
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

      <Box
        height="70vh"
        border={`1px solid ${colors.gray[700]}`}
        borderRadius="8px"
      >
        <GeographyChart />
      </Box>
    </Box>
  );
};

export default Geography;
