import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/header";
import DashboardComponents from "../../data/dashboard";

const Dashboard = () => {
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Dashboard" subtitle={`${formattedDate}`} />
      </Box>
      <DashboardComponents />
    </Box>
  );
};

export default Dashboard;
