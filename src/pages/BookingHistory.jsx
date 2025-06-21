import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme as useMuiTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from "@mui/material";
import {
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Cancel as CancelIcon,
  Map as MapIcon // Added Map icon for trips
} from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";
import { fetchUserBookings, fetchPackages, updateBooking, fetchUserTrips } from "../api/api"; // Import fetchUserTrips
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext';

export default function BookingHistory() {
  const { user, isAuthenticated } = useAuth();
  const muiTheme = useMuiTheme();
  const { theme: currentThemeMode } = useMyCustomTheme();

  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]); // State for trips
  const [packagesMap, setPackagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: Bookings, 1: Trips

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    Promise.all([fetchUserBookings(user.id), fetchPackages(), fetchUserTrips(user.id)]) // Fetch trips
      .then(([userBookings, allPackages, userTrips]) => { // Destructure trips
        // Filter out packages from trips and add them to bookings
        const packageBookings = userTrips.filter(trip => trip.packageId !== null);
        setBookings([...userBookings, ...packageBookings]);
        setTrips(userTrips.filter(trip => trip.packageId === null)); // Set only non-package trips
        const map = {};
        allPackages.forEach((pkg) => {
          map[pkg.id] = {
            id: pkg.id,
            title: pkg.title,
            price: pkg.price || 0,
            imageUrl: pkg.image || `https://source.unsplash.com/random/300x200?travel,${pkg.title}`
          };
        });
        setPackagesMap(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching booking/trip history:", err);
        setError("Failed to load booking/trip history. Please try again.");
        setLoading(false);
      });
  }, [isAuthenticated, user]);

  const handleOpenCancelConfirmation = (booking) => {
    setBookingToCancel(booking);
    setShowCancelConfirmation(true);
  };

  const handleCloseCancelConfirmation = () => {
    setShowCancelConfirmation(false);
    setBookingToCancel(null);
    setCancelReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!bookingToCancel) return;

    try {
      setCancellationLoading(true);
      const updatedBooking = {
        ...bookingToCancel,
        status: 'cancelled',
        cancellationReason: cancelReason,
        cancellationDate: new Date().toISOString()
      };
      await updateBooking(bookingToCancel.id, updatedBooking);

      setBookings(prev =>
        prev.map(b => (b.id === bookingToCancel.id ? updatedBooking : b))
      );
      setAlertInfo({ type: 'success', message: `Booking ${bookingToCancel.id} cancelled successfully!` });
      handleCloseCancelConfirmation();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setAlertInfo({ type: 'error', message: 'Failed to cancel booking. Please try again.' });
    } finally {
      setCancellationLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading booking/trip history...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your booking/trip history.</Alert>
      </Container>
    );
  }

  const sortedBookings = [...bookings].sort((a, b) => new Date(b.date) - new Date(a.date));
  const sortedTrips = [...trips].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort trips

  return (
    <Container maxWidth="md" sx={{ py: 4, color: 'text.primary', minHeight: '80vh' }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)} sx={{ mb: 3 }}>
          {alertInfo.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600, mb: 4 }}>
        Your Booking/Trip History
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Bookings" />
        <Tab label="Trips" />
      </Tabs>

      {tabValue === 0 && ( // Bookings Tab
        sortedBookings.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No bookings found.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              It looks like you haven't made any bookings yet.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {sortedBookings.map((b) => {
              const packageDetails = packagesMap[b.packageId];
              const displayTitle = (b.route && b.transportType)
                ? b.route
                : (packageDetails ? packageDetails.title : 'Custom Booking');
              const displayAmount = b.amount || packageDetails?.price;

              return (
                <Paper
                  key={b.id}
                  elevation={3}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    borderLeft: `6px solid ${
                      b.status === 'pending'
                        ? muiTheme.palette.warning.main
                        : b.status === 'cancelled'
                        ? muiTheme.palette.error.main
                        : muiTheme.palette.success.main
                    }`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: 'text.primary' }}>
                      {displayTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        bgcolor: b.status === 'pending'
                          ? muiTheme.palette.warning.light
                          : b.status === 'cancelled'
                          ? muiTheme.palette.error.light
                          : muiTheme.palette.success.light,
                        color: b.status === 'pending'
                          ? muiTheme.palette.warning.dark
                          : b.status === 'cancelled'
                          ? muiTheme.palette.error.dark
                          : muiTheme.palette.success.dark,
                        px: 1.5, py: 0.5, borderRadius: 1, textTransform: 'uppercase', fontWeight: 'bold',
                      }}
                    >
                      {b.status}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary, mb: 1 }}>
                    <EventIcon fontSize="small" />
                    <Typography variant="body2">Date: {b.date}</Typography>
                  </Box>
                  {b.travelers && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary, mb: 1 }}>
                      <PeopleIcon fontSize="small" />
                      <Typography variant="body2">Travelers: {b.travelers}</Typography>
                    </Box>
                  )}
                  {b.transportType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: muiTheme.palette.text.secondary, mb: 1 }}>
                      <LocalShippingIcon fontSize="small" />
                      <Typography variant="body2">Transport: {b.transportType.toUpperCase()}</Typography>
                    </Box>
                  )}
                  {displayAmount ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                      <AttachMoneyIcon color="success" />
                      <Typography variant="h6" component="span" color="success.main" fontWeight="bold">
                        Amount: ₹{displayAmount.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                      Amount: Not specified
                    </Typography>
                  )}
                  {b.specialRequests && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                      Special Requests: {b.specialRequests}
                    </Typography>
                  )}
                  {b.status === 'cancelled' && b.cancellationReason && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                      Reason: {b.cancellationReason} (on {new Date(b.cancellationDate).toLocaleDateString()})
                    </Typography>
                  )}

                  {b.status !== 'cancelled' && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenCancelConfirmation(b)}
                      sx={{ mt: 2 }}
                    >
                      Cancel / Refund
                    </Button>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )
      )}

      {tabValue === 1 && ( // Trips Tab
        sortedTrips.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No trips found.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              It looks like you haven't created any trips yet.
            </Typography>
          </Paper>
        ) : (
          <List>
            {sortedTrips.map((trip) => (
              <ListItem alignItems="flex-start" key={trip.id} sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: muiTheme.palette.primary.main, color: muiTheme.palette.primary.contrastText }}>
                    <MapIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="span" style={{ fontWeight: 'bold', color: muiTheme.palette.text.primary }}>
                      {trip.name}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline', color: muiTheme.palette.text.secondary }}
                        component="span"
                        variant="body2"
                      >
                        {trip.departure}
                        {trip.intermediateStops && trip.intermediateStops.length > 0 && (
                          <>
                            {' via '}
                            {trip.intermediateStops.join(', ')}
                          </>
                        )}
                        {' to '}
                        {trip.destination}
                      </Typography>
                      {trip.date && (
                        <Typography
                          sx={{ display: 'block', color: muiTheme.palette.text.secondary }}
                          variant="body2"
                        >
                          Date: {trip.date}
                        </Typography>
                      )}
                      {trip.transport && (
                        <Typography
                          sx={{ display: 'block', color: muiTheme.palette.text.secondary }}
                          variant="body2"
                        >
                          Transport: {trip.transport}
                        </Typography>
                      )}
                      {trip.budget && (
                        <Typography
                          sx={{ display: 'block', color: muiTheme.palette.text.secondary }}
                          variant="body2"
                        >
                          Budget: ₹{trip.budget.toLocaleString('en-IN')}
                        </Typography>
                      )}
                      {trip.notes && (
                        <Typography
                          sx={{ display: 'block', color: muiTheme.palette.text.secondary }}
                          variant="body2"
                        >
                          Notes: {trip.notes}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        )
      )}

      <Dialog open={showCancelConfirmation} onClose={handleCloseCancelConfirmation} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>Confirm Cancellation</DialogTitle>
        <DialogContent dividers>
          {bookingToCancel && (
            <Stack spacing={2}>
              <Typography variant="body1">
                Are you sure you want to cancel the booking for: <strong>{bookingToCancel.id}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone and may be subject to cancellation fees.
              </Typography>
              <TextField
                fullWidth
                label="Reason for Cancellation (Optional)"
                multiline
                rows={3}
                variant="outlined"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancellationLoading}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseCancelConfirmation}
            variant="outlined"
            color="secondary"
            disabled={cancellationLoading}
            sx={{ flex: 1 }}
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirmCancellation}
            variant="contained"
            color="error"
            disabled={cancellationLoading}
            startIcon={cancellationLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ flex: 1 }}
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}