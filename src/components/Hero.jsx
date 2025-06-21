import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/packages");
    } else {
      navigate("/login");
    }
  };

  const handleLearnMore = () => {
    navigate("/about");
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: { xs: "center", md: "flex-start" },
        minHeight: "70vh",
        padding: { xs: "2rem 1rem", md: "0 2rem" },
        backgroundColor: 'rgb(17, 43, 81)',
        color: (theme) => theme.palette.text.primary,
        textAlign: { xs: "center", md: "left" },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: "2.5rem", md: "3.5rem" },
          color: (theme) => theme.palette.primary.main,
          fontWeight:'bolder',
          mb: 2,
        }}
      >
        Explore the World with TravelMS
      </Typography>
      <Typography
        variant="h5"
        sx={{ maxWidth: "600px", mb: 3,color:'white' }}
      >
        Manage your trips, bookings, and itineraries effortlessly with our
        all-in-one travel management system.
      </Typography>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{ minWidth: "150px" }}
        >
          Get Started
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={handleLearnMore}
          sx={{ minWidth: "150px" }}
        >
          Learn More
        </Button>
      </Stack>
    </Box>
  );
}
