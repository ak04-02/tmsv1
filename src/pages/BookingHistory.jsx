import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  useTheme as useMuiTheme 
} from "@mui/material";
import {
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";
import { fetchUserBookings, fetchPackages } from "../api/api";
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext'; 
export default function BookingHistory() {
  const { user, isAuthenticated } = useAuth();
  const muiTheme = useMuiTheme(); 
  // const { currentMode, toggleTheme } = useMyCustomTheme(); 
  const [bookings, setBookings] = useState([]);
  const [packagesMap, setPackagesMap] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    Promise.all([fetchUserBookings(user.id), fetchPackages()])
      .then(([userBookings, allPackages]) => {
        setBookings(userBookings);
        const map = {};
        allPackages.forEach((pkg) => {
          map[pkg.id] = pkg; 
        });
        setPackagesMap(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch booking history:", err);
        setError("Failed to load booking history. Please try again.");
        setLoading(false);
      });
  }, [isAuthenticated, user]);
  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundColor: muiTheme.palette.background.default,
          color: muiTheme.palette.text.primary,
        }}
      >
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Loading booking history...</Typography>
      </Container>
    );
  }
  if (!isAuthenticated) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundColor: muiTheme.palette.background.default,
          color: muiTheme.palette.text.primary,
        }}
      >
        <Alert severity="warning">Please log in to view your booking history.</Alert>
      </Container>
    );
  }
  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          backgroundColor: muiTheme.palette.background.default,
          color: muiTheme.palette.text.primary,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  return (
    <Container
      
      sx={{
        minHeight: '80vh',
        py: 4,
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
      }}
    >
      <Typography variant="h4" component="h1" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
        Booking History
      </Typography>

      {bookings.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4, mx: 'auto', width: 'fit-content' }}>
          <Typography>You don't have any bookings yet.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Start exploring our packages to book your next adventure!</Typography>
        </Alert>
      ) : (
        <Stack spacing={3}> 
          {bookings.map((b) => {
            const associatedPackage = packagesMap[b.packageId];
            const bookingTitle = b.route || associatedPackage?.title || 'Travel Booking';
            const displayAmount = b.amount || associatedPackage?.price;
            return (
              <Paper
                key={b.id}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  boxShadow: 4,
                  border: `1px solid ${muiTheme.palette.primary.main}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                <Typography variant="h6" component="strong" color="primary">
                  {bookingTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary }}>
                  <EventIcon fontSize="small" />
                  <Typography variant="body2">Date: {b.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary }}>
                  <PeopleIcon fontSize="small" />
                  <Typography variant="body2">Travelers: {b.travelers || 1}</Typography>
                </Box>
                {b.transportType && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary }}>
                    <LocalShippingIcon fontSize="small" />
                    <Typography variant="body2">Transport: {b.transportType.toUpperCase()}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary }}>
                  <InfoOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Status: {b.status}</Typography>
                </Box>
                {displayAmount ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <AttachMoneyIcon color="success" />
                    <Typography variant="h6" component="span" color="success.main" fontWeight="bold">
                      Amount: ₹{displayAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Amount: Not specified
                  </Typography>
                )}
                {b.specialRequests && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Special Requests: {b.specialRequests}
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}