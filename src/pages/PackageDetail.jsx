import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Container,
  Stack,
  useTheme as useMuiTheme 
} from '@mui/material';
import { ChevronRight, CalendarMonth, AttachMoney, Add as AddIcon } from '@mui/icons-material';
import { fetchPackageById, createTrip } from "../api/api";
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext'; 
export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const muiTheme = useMuiTheme();
  const { currentMode, toggleTheme } = useMyCustomTheme(); 
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null); 
  useEffect(() => {
    fetchPackageById(id)
      .then((data) => {
        setPackageData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch package details:", err);
        setError("Failed to load package details. Please try again.");
        setLoading(false);
      });
  }, [id]);
  const handleCreateTrip = async (packageDetails) => {
    if (!user?.id) {
      setAlertInfo({ type: 'error', message: 'Please log in to create a trip.' });
      return;
    }
    try {
      const tripName = `Trip: ${packageDetails.title}`; 
      const tripData = {
        name: tripName,
        userId: user.id,
        status: "planning",
        packageId: packageDetails.id,
        departure: packageDetails.departure || '',
        destination: packageDetails.destination || '',
        date: packageDetails.startDate || new Date().toISOString().split('T')[0],
        price: packageDetails.price || 0,
        createdAt: new Date().toISOString(),
      };
      const newTrip = await createTrip(tripData);
      setAlertInfo({ type: 'success', message: `Trip "${tripName}" created successfully!` });
      console.log('Trip created:', newTrip);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setAlertInfo({ type: 'error', message: 'Failed to create trip. Please try again.' });
    }
  };
  if (loading) {
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
        <CircularProgress color="primary" />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading package details...</Typography>
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
  if (!packageData) {
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
        <Typography variant="h6">Package not found.</Typography>
      </Container>
    );
  }
  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '80vh',
        py: 4,
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
      }}
    >
      {alertInfo && (
        <Alert severity={alertInfo.type} sx={{ mb: 2, mx: 'auto', width: 'fit-content' }}>
          {alertInfo.message}
        </Alert>
      )}
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 6, mb: 3 }}>
        {packageData.image && (
          <Box
            component="img"
            src={packageData.image}
            alt={packageData.title}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 3,
            }}
          />
        )}
        <Typography variant="h4" component="h1" color="primary" sx={{ mb: 1.5 }}>
          {packageData.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: muiTheme.palette.text.secondary }}>
          {packageData.description}
        </Typography>
        {packageData.price && (
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 1,
                    backgroundColor: muiTheme.palette.action.hover, 
                    border: `1px solid ${muiTheme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <AttachMoney color="primary" sx={{ fontSize: '2.5rem' }} />
                <Box>
                    <Typography variant="h5" component="div" fontWeight="bold" color="primary">
                        ₹{packageData.price.toLocaleString()}
                        <Typography component="span" variant="body2" sx={{ ml: 1, color: muiTheme.palette.text.secondary, opacity: 0.8 }}>
                            per person
                        </Typography>
                    </Typography>
                    {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: muiTheme.palette.text.disabled, mt: 0.5 }}>
                            ₹{packageData.originalPrice.toLocaleString()}
                        </Typography>
                    )}
                </Box>
            </Paper>
        )}
        {packageData.itinerary && packageData.itinerary.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" color="text.primary" sx={{ mb: 1.5 }}>
              Itinerary
            </Typography>
            <List dense>
              {packageData.itinerary.map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <ChevronRight color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {packageData.duration && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: muiTheme.palette.text.secondary }}>
            <CalendarMonth sx={{ mr: 1 }} />
            <Typography variant="body1">
              Duration: {packageData.duration}
            </Typography>
          </Box>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/booking/${id}`)}
            sx={{ py: 1.5, flexGrow: 1 }}
          >
            Book Now
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleCreateTrip(packageData)}
            sx={{ py: 1.5, flexGrow: 1 }}
          >
            Add to My Trips
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}