import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress, 
  Alert, 
  useTheme as useMuiTheme 
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { fetchPackageById, createBooking } from "../api/api";
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext'; 
export default function Booking() {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const muiTheme = useMuiTheme(); 
  // const { currentMode, toggleTheme } = useMyCustomTheme(); 
  const [packageData, setPackageData] = useState(null);
  const [formData, setFormData] = useState({ date: "", travelers: 1 });
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null); 
  const [fetchError, setFetchError] = useState(null); 
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [bookingSuccess, setBookingSuccess] = useState(false); 
  useEffect(() => {
    if (!packageId) {
      setFetchError("No package ID provided.");
      setLoading(false);
      return;
    }
    fetchPackageById(packageId)
      .then((data) => {
        setPackageData(data);
        const defaultDate = data.startDate || new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: defaultDate }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch package details:", err);
        setFetchError("Failed to load package details. Please try again.");
        setLoading(false);
      });
  }, [packageId]);
  const calculateTotalAmount = (pkg, travelers) => {
    const basePrice = pkg.price || 0; 
    return basePrice * parseInt(travelers || 0); 
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setBookingError(null); 
    setBookingSuccess(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || parseInt(formData.travelers) <= 0) {
      setBookingError("Please select a date and ensure travelers are at least 1.");
      return;
    }
    setShowDialog(true);
  };
  const handleConfirmBooking = async () => {
    setShowDialog(false); 
    setIsSubmitting(true); 
    setBookingError(null);

    try {
      if (!user?.id) {
        throw new Error("User not logged in."); 
      }
      const totalAmount = calculateTotalAmount(packageData, formData.travelers);
      const bookingData = {
        packageId: packageData.id, 
        userId: user.id,
        date: formData.date,
        travelers: parseInt(formData.travelers),
        amount: totalAmount,
        status: "pending",
        packageTitle: packageData.title
      };
      await createBooking(bookingData);
      setBookingSuccess(true);
      setTimeout(() => {
        navigate("/booking-history");
      }, 2000);
    } catch (err) {
      console.error("Failed to create booking:", err);
      setBookingError("Failed to create booking. Please try again. " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!user) {
    return (
      <Container
        maxWidth="sm"
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
        <Alert severity="warning">Please log in to book a package.</Alert>
      </Container>
    );
  }
  if (loading) {
    return (
      <Container
        maxWidth="sm"
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
        <Typography variant="h6" color="text.secondary">Loading booking page...</Typography>
      </Container>
    );
  }
  if (fetchError) {
    return (
      <Container
        maxWidth="sm"
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
        <Alert severity="error">{fetchError}</Alert>
      </Container>
    );
  }
  if (!packageData) {
    return (
      <Container
        maxWidth="sm"
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
        <Alert severity="info">Package not found. Please select a valid package.</Alert>
      </Container>
    );
  }
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '80vh',
        py: 4,
        backgroundColor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, width: '100%', mx: "auto", borderRadius: 2, boxShadow: 6 }}>
        <Typography variant="h5" color="primary" gutterBottom align="center">
          Book: {packageData.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Price per person: ₹{packageData.price ? packageData.price.toLocaleString('en-IN') : 'N/A'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            type="date"
            name="date"
            label="Travel Date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }} 
          />
          <TextField
            type="number"
            name="travelers"
            label="Number of Travelers"
            value={formData.travelers}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ min: 1 }}
            error={parseInt(formData.travelers) <= 0}
            helperText={parseInt(formData.travelers) <= 0 ? "Travelers must be at least 1" : ""}
          />
          {(packageData.price || packageData.amount) && ( 
            <Box sx={{
              backgroundColor: muiTheme.palette.action.hover, 
              p: 2,
              borderRadius: 1,
              textAlign: "center",
              my: 3, 
              border: `1px solid ${muiTheme.palette.divider}` 
            }}>
              <Typography variant="body1">
                Price per person: <strong>₹{packageData.price ? packageData.price.toLocaleString('en-IN') : 'N/A'}</strong>
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                Total: <strong>₹{calculateTotalAmount(packageData, formData.travelers).toLocaleString('en-IN')}</strong>
              </Typography>
            </Box>
          )}
          {bookingError && (
            <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>
          )}
          {bookingSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>Booking confirmed! Redirecting to history...</Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting || parseInt(formData.travelers) <= 0 || !formData.date}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Confirm Booking"}
          </Button>
        </Box>
      </Paper>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Confirm Your Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please review your booking details:<br /><br />
            Package: <strong>{packageData.title}</strong><br />
            Date: <strong>{formData.date}</strong><br />
            Travelers: <strong>{formData.travelers}</strong><br />
            Total Amount: <strong>₹{calculateTotalAmount(packageData, formData.travelers).toLocaleString('en-IN')}</strong><br />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmBooking} variant="contained" color="primary" disabled={isSubmitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}