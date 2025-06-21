import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  useTheme as useMuiTheme
} from '@mui/material';
import { ChevronDown, ChevronUp, Plus, Search, Plane, Train, Bus, MapPin, Calendar, DollarSign, Trash2, Sun, Moon, ChevronRight, X } from 'lucide-react'; // Added X icon for removing stops
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext';
import { createTrip, updateTrip, createExpense, fetchUserExpenses, deleteExpense as apiDeleteExpense } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { createBooking } from '../api/api';

const getTransportIcon = (transport) => {
  switch (transport) {
    case 'plane': return <Plane size={20} />;
    case 'train': return <Train size={20} />;
    case 'bus': return <Bus size={20} />;
    default: return <Bus size={20} />;
  }
};

const PlanTripContent = () => {
  const muiTheme = useMuiTheme();
  const { theme: currentThemeMode, toggleTheme } = useMyCustomTheme();

  const [tripName, setTripName] = useState('');
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({
    departure: '',
    destination: '',
    intermediateStops: [], // Added for intermediate stops
    transport: 'bus',
    date: '',
    price: '',
    notes: '',
    budget: ''
  });
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState(null);
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    travelers: 1,
    specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [newIntermediateStop, setNewIntermediateStop] = useState(''); // State for new intermediate stop input

  useEffect(() => {
    if (user && currentTrip) {
      setExpenseError(null);
      setExpenseLoading(true);
      fetchUserExpenses(user.id, currentTrip.id)
        .then(setExpenses)
        .catch(err => {
          console.error("Failed to fetch expenses:", err);
          setExpenseError("Failed to load expenses.");
        })
        .finally(() => setExpenseLoading(false));
    } else {
      setExpenses([]);
    }
  }, [user, currentTrip]);

  useEffect(() => {
    if (currentTrip) {
      setTripForm({
        departure: currentTrip.departure || '',
        destination: currentTrip.destination || '',
        intermediateStops: currentTrip.intermediateStops || [], // Populate intermediate stops from current trip
        transport: currentTrip.transport || 'bus',
        date: currentTrip.date || '',
        price: currentTrip.price ? String(currentTrip.price) : '',
        notes: currentTrip.notes || '',
        budget: currentTrip.budget ? String(currentTrip.budget) : ''
      });
    } else {
      setTripForm({
        departure: '',
        destination: '',
        intermediateStops: [], // Reset intermediate stops for new trip
        transport: 'bus',
        date: '',
        price: '',
        notes: '',
        budget: ''
      });
    }
  }, [currentTrip]);

  const handleTripFormChange = (e) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const handleAddIntermediateStop = () => { // Handler for adding intermediate stops
    if (newIntermediateStop.trim() !== '') {
      setTripForm(prev => ({
        ...prev,
        intermediateStops: [...prev.intermediateStops, newIntermediateStop.trim()]
      }));
      setNewIntermediateStop('');
    }
  };

  const handleRemoveIntermediateStop = (indexToRemove) => { // Handler for removing intermediate stops
    setTripForm(prev => ({
      ...prev,
      intermediateStops: prev.intermediateStops.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleCreateNewTrip = async () => {
    if (!user) {
      setTripError("Please log in to create a trip.");
      return;
    }
    setTripLoading(true);
    setTripError(null);
    try {
      const newTrip = {
        name: tripName || `Trip to ${tripForm.destination || 'Unknown'}`,
        userId: user.id,
        status: 'planning',
        ...tripForm,
        price: parseFloat(tripForm.price) || 0,
        budget: parseFloat(tripForm.budget) || 0,
        createdAt: new Date().toISOString(),
        packageId: null,
      };
      const createdTrip = await createTrip(newTrip);
      setCurrentTrip(createdTrip);
      setTripName('');
      setShowTripForm(false);
      setAlertInfo({ type: 'success', message: `Trip to ${createdTrip.destination} created!` });
    } catch (err) {
      console.error("Failed to create trip:", err);
      setTripError("Failed to create trip. Please try again.");
    } finally {
      setTripLoading(false);
    }
  };

  const handleSearchTransport = async () => {
    if (!tripForm.departure || !tripForm.destination || !tripForm.date || !tripForm.transport) {
      setSearchError("Please fill in Departure, Destination, Date, and Transport Type to search.");
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock results adjusted to include intermediate stops for demonstration
      const mockResults = [
        { id: 't1', route: `${tripForm.departure} ${tripForm.intermediateStops.length > 0 ? `via ${tripForm.intermediateStops.join(', ')} ` : ''}to ${tripForm.destination} (Plane)`, price: 25000, transportType: 'plane' },
        { id: 't2', route: `${tripForm.departure} ${tripForm.intermediateStops.length > 0 ? `via ${tripForm.intermediateStops.join(', ')} ` : ''}to ${tripForm.destination} (Train)`, price: 12000, transportType: 'train' },
        { id: 't3', route: `${tripForm.departure} ${tripForm.intermediateStops.length > 0 ? `via ${tripForm.intermediateStops.join(', ')} ` : ''}to ${tripForm.destination} (Bus)`, price: 5000, transportType: 'bus' },
      ];
      setSearchResults(mockResults.filter(r => r.transportType === tripForm.transport));
    } catch (err) {
      setSearchError("Failed to search transport. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookTransport = (result) => {
    setSelectedResult(result);
    setBookingForm(prev => ({ ...prev, travelers: 1 }));
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!user || !selectedResult || !currentTrip) {
      setBookingError("Missing user, selected transport, or current trip info.");
      return;
    }
    setBookingLoading(true);
    setBookingError(null);

    try {
      const newBooking = {
        userId: user.id,
        tripId: currentTrip.id,
        packageId: null,
        route: selectedResult.route, // This would ideally be a more structured object for multi-leg journeys
        transportType: selectedResult.transportType,
        date: tripForm.date,
        amount: selectedResult.price * bookingForm.travelers,
        travelers: bookingForm.travelers,
        specialRequests: bookingForm.specialRequests,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await createBooking(newBooking);
      setAlertInfo({ type: 'success', message: 'Transport booked successfully!' });
      setShowBookingModal(false);
      setSelectedResult(null);
    } catch (err) {
      console.error("Failed to create booking:", err);
      setBookingError("Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleExpenseFormChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async () => {
    if (!user || !currentTrip) {
      setExpenseError("Please create or select a trip first.");
      return;
    }
    if (!expenseForm.description || !expenseForm.amount || isNaN(parseFloat(expenseForm.amount))) {
      setExpenseError("Please provide a valid description and amount for the expense.");
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);
    try {
      const newExpense = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        userId: user.id,
        tripId: currentTrip.id,
        createdAt: new Date().toISOString(),
      };
      const createdExpense = await createExpense(newExpense);
      setExpenses((prev) => [...prev, createdExpense]);
      setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: '' });
      setAlertInfo({ type: 'success', message: 'Expense added!' });
    } catch (err) {
      console.error("Failed to add expense:", err);
      setExpenseError("Failed to add expense. Please try again.");
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setExpenseLoading(true);
    setExpenseError(null);
    try {
      await apiDeleteExpense(expenseId);
      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
      setAlertInfo({ type: 'info', message: 'Expense deleted.' });
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setExpenseError("Failed to delete expense. Please try again.");
    } finally {
      setExpenseLoading(false);
    }
  };

  const containerBgColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[900] : muiTheme.palette.background.default;
  const paperBgColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[800] : muiTheme.palette.background.paper;
  const textColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[100] : muiTheme.palette.text.primary;
  const secondaryTextColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[400] : muiTheme.palette.text.secondary;
  const inputBgColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[700] : muiTheme.palette.background.paper;
  const inputBorderColor = currentThemeMode === 'dark' ? muiTheme.palette.grey[600] : muiTheme.palette.divider;

  return (
    <Container maxWidth="lg" sx={{ py: 4, color: textColor, minHeight: '100vh', bgcolor: containerBgColor }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} onClose={() => setAlertInfo(null)} sx={{ mb: 3 }}>
          {alertInfo.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Plan Your Trip
        </Typography>
      </Box>

      {!user ? (
        <Alert severity="info">Please log in to plan your trip.</Alert>
      ) : (
        <Stack spacing={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: paperBgColor }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: textColor }}>
                {currentTrip ? `Current Trip: ${currentTrip.name}` : 'Start a New Trip'}
              </Typography>
              <IconButton onClick={() => setShowTripForm(!showTripForm)} sx={{ color: textColor }}>
                {showTripForm ? <ChevronUp /> : <ChevronDown />}
              </IconButton>
            </Box>

            {showTripForm && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Trip Name"
                  variant="outlined"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth
                  label="Departure"
                  name="departure"
                  variant="outlined"
                  value={tripForm.departure}
                  onChange={handleTripFormChange}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                {/* Intermediate Stops Input and List */}
                <Box>
                  <Typography variant="h6" sx={{ color: textColor, mb: 1 }}>Intermediate Stops</Typography>
                  <Stack direction="row" spacing={1} mb={1}>
                    <TextField
                      fullWidth
                      label="Add Stop"
                      variant="outlined"
                      value={newIntermediateStop}
                      onChange={(e) => setNewIntermediateStop(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddIntermediateStop();
                        }
                      }}
                      sx={{
                        '& .MuiInputBase-input': { color: textColor },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                        '& .MuiInputLabel-root': { color: secondaryTextColor },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                        bgcolor: inputBgColor,
                        borderRadius: 1
                      }}
                      InputProps={{ style: { borderRadius: '8px' } }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddIntermediateStop}
                      startIcon={<Plus />}
                      sx={{ borderRadius: 2 }}
                    >
                      Add
                    </Button>
                  </Stack>
                  {tripForm.intermediateStops.length > 0 && (
                    <List dense sx={{ maxHeight: 150, overflow: 'auto', border: `1px solid ${inputBorderColor}`, borderRadius: 1, bgcolor: inputBgColor }}>
                      {tripForm.intermediateStops.map((stop, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveIntermediateStop(index)} sx={{ color: muiTheme.palette.error.main }}>
                              <X size={16} />
                            </IconButton>
                          }
                          sx={{ color: textColor }}
                        >
                          <ListItemText primary={stop} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  variant="outlined"
                  value={tripForm.destination}
                  onChange={handleTripFormChange}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                <FormControl fullWidth variant="outlined" sx={{
                  '& .MuiInputBase-input': { color: textColor },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '& .MuiInputLabel-root': { color: secondaryTextColor },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                  bgcolor: inputBgColor,
                  borderRadius: 1
                }}>
                  <InputLabel>Transport</InputLabel>
                  <Select
                    name="transport"
                    value={tripForm.transport}
                    onChange={handleTripFormChange}
                    label="Transport"
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="plane">Plane</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  variant="outlined"
                  value={tripForm.date}
                  onChange={handleTripFormChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth
                  label="Budget (₹)"
                  name="budget"
                  type="number"
                  variant="outlined"
                  value={tripForm.budget}
                  onChange={handleTripFormChange}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  variant="outlined"
                  value={tripForm.notes}
                  onChange={handleTripFormChange}
                  sx={{
                    '& .MuiInputBase-input': { color: textColor },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '& .MuiInputLabel-root': { color: secondaryTextColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                    bgcolor: inputBgColor,
                    borderRadius: 1
                  }}
                  InputProps={{ style: { borderRadius: '8px' } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateNewTrip}
                  disabled={tripLoading || !tripForm.destination || !tripForm.date}
                  startIcon={tripLoading ? <CircularProgress size={20} color="inherit" /> : <Plus />}
                  sx={{ borderRadius: 2 }}
                >
                  Create Trip
                </Button>
                {tripError && <Alert severity="error">{tripError}</Alert>}
              </Stack>
            )}
          </Paper>

          {currentTrip && (
            <>
              {/* Transport Search and Booking */}
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: paperBgColor }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: textColor }}>
                  Book Transport
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Box sx={{ p: 1, bgcolor: muiTheme.palette.primary.main, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getTransportIcon(tripForm.transport)}
                  </Box>
                  <Typography variant="body1" sx={{ color: textColor }}>
                    {tripForm.departure}
                    {tripForm.intermediateStops.length > 0 && ( // Display intermediate stops in route
                      <>
                        <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
                        {tripForm.intermediateStops.join(' > ')}
                      </>
                    )}
                    <ChevronRight size={16} style={{ verticalAlign: 'middle' }} /> {tripForm.destination}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSearchTransport}
                  disabled={searchLoading || !tripForm.departure || !tripForm.destination || !tripForm.date || !tripForm.transport}
                  startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                  sx={{ borderRadius: 2 }}
                >
                  Search Transport
                </Button>
                {searchError && <Alert severity="error" sx={{ mt: 2 }}>{searchError}</Alert>}

                {searchLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
                {searchResults.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1.5, color: textColor }}>Available Options:</Typography>
                    <List>
                      {searchResults.map((result) => (
                        <ListItem
                          key={result.id}
                          secondaryAction={
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleBookTransport(result)}
                              sx={{ borderRadius: 1.5 }}
                            >
                              Book
                            </Button>
                          }
                          sx={{
                            bgcolor: paperBgColor,
                            mb: 1,
                            borderRadius: 1,
                            color: textColor
                          }}
                        >
                          <ListItemText
                            primary={<Typography variant="body1" fontWeight="bold" sx={{ color: textColor }}>{result.route}</Typography>}
                            secondary={<Typography variant="body2" sx={{ color: secondaryTextColor }}>₹{result.price.toLocaleString('en-IN')}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>

              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: paperBgColor }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: textColor }}>
                  Expense Tracking
                </Typography>
                <Stack spacing={2} mb={3}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    variant="outlined"
                    value={expenseForm.description}
                    onChange={handleExpenseFormChange}
                    sx={{
                      '& .MuiInputBase-input': { color: textColor },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '& .MuiInputLabel-root': { color: secondaryTextColor },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                      bgcolor: inputBgColor,
                      borderRadius: 1
                    }}
                    InputProps={{ style: { borderRadius: '8px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    variant="outlined"
                    value={expenseForm.amount}
                    onChange={handleExpenseFormChange}
                    sx={{
                      '& .MuiInputBase-input': { color: textColor },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '& .MuiInputLabel-root': { color: secondaryTextColor },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                      bgcolor: inputBgColor,
                      borderRadius: 1
                    }}
                    InputProps={{ style: { borderRadius: '8px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    variant="outlined"
                    value={expenseForm.date}
                    onChange={handleExpenseFormChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputBase-input': { color: textColor },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '& .MuiInputLabel-root': { color: secondaryTextColor },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                      bgcolor: inputBgColor,
                      borderRadius: 1
                    }}
                    InputProps={{ style: { borderRadius: '8px' } }}
                  />
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    variant="outlined"
                    value={expenseForm.category}
                    onChange={handleExpenseFormChange}
                    sx={{
                      '& .MuiInputBase-input': { color: textColor },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '& .MuiInputLabel-root': { color: secondaryTextColor },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                      bgcolor: inputBgColor,
                      borderRadius: 1
                    }}
                    InputProps={{ style: { borderRadius: '8px' } }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddExpense}
                    disabled={expenseLoading || !expenseForm.description || !expenseForm.amount}
                    startIcon={expenseLoading ? <CircularProgress size={20} color="inherit" /> : <Plus />}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Expense
                  </Button>
                  {expenseError && <Alert severity="error">{expenseError}</Alert>}
                </Stack>

                <Typography variant="h6" sx={{ mb: 1.5, color: textColor }}>Recent Expenses:</Typography>
                {expenseLoading ? (
                  <CircularProgress size={24} />
                ) : expenses.length === 0 ? (
                  <Typography variant="body2" sx={{ color: secondaryTextColor }}>No expenses recorded for this trip yet.</Typography>
                ) : (
                  <List>
                    {expenses.map((expense) => (
                      <ListItem
                        key={expense.id}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteExpense(expense.id)} sx={{ color: muiTheme.palette.error.main }}>
                            <Trash2 size={20} />
                          </IconButton>
                        }
                        sx={{
                          bgcolor: paperBgColor,
                          mb: 1, borderRadius: 1, color: textColor
                        }}
                      >
                        <ListItemText
                          primary={<Typography variant="body1" fontWeight="bold" sx={{ color: textColor }}>{expense.description} - ₹{expense.amount.toLocaleString('en-IN')}</Typography>}
                          secondary={<Typography variant="body2" sx={{ color: secondaryTextColor }}>{expense.category} on {expense.date}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </>
          )}
        </Stack>
      )}

      <Dialog open={showBookingModal} onClose={() => setShowBookingModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: muiTheme.palette.primary.main, color: muiTheme.palette.primary.contrastText }}>Confirm Transport Booking</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: paperBgColor, color: textColor }}>
          {selectedResult && (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ color: textColor }}>
                Booking: {selectedResult.route}
              </Typography>
              <Typography variant="body1" sx={{ color: secondaryTextColor }}>
                Price per traveler: ₹{selectedResult.price.toLocaleString('en-IN')}
              </Typography>
              <TextField
                fullWidth
                label="Number of Travelers"
                type="number"
                variant="outlined"
                value={bookingForm.travelers}
                onChange={(e) => setBookingForm(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
                disabled={bookingLoading}
                sx={{
                  '& .MuiInputBase-input': { color: textColor },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '& .MuiInputLabel-root': { color: secondaryTextColor },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                  bgcolor: inputBgColor,
                  borderRadius: 1
                }}
                InputProps={{ style: { borderRadius: '8px' } }}
              />
              <TextField
                fullWidth
                label="Special Requests (Optional)"
                multiline
                rows={3}
                variant="outlined"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any special requirements..."
                disabled={bookingLoading}
                sx={{
                  '& .MuiInputBase-input': { color: textColor },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '& .MuiInputLabel-root': { color: secondaryTextColor },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: inputBorderColor },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
                  bgcolor: inputBgColor,
                  borderRadius: 1
                }}
                InputProps={{ style: { borderRadius: '8px' } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: paperBgColor }}>
          <Button
            onClick={() => setShowBookingModal(false)}
            variant="outlined"
            color="secondary"
            disabled={bookingLoading}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            color="success"
            disabled={bookingLoading}
            startIcon={bookingLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            Confirm Booking (₹{selectedResult ? (selectedResult.price * bookingForm.travelers).toFixed(2) : 0})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const PlanTrip = () => {
  return <PlanTripContent />;
};

export default PlanTrip;