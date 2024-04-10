import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflow="hidden"
    >
      <img
        src="./assets/ggutterguard-icon.png"
        alt="logo"
        style={{ width: "100px", marginTop: "130px" }}
      />
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "300px",
          width: "100%",
          marginTop: "20px",
          overflowY: "auto",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ mt: 2, width: "100%" }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
