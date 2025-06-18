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
  DialogActions
} from '@mui/material';
import { ChevronDown, ChevronUp, Plus, Search, Plane, Train, Bus, MapPin, Calendar, DollarSign, Trash2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/Themecontext';
import { createTrip, createExpense, fetchUserExpenses, deleteExpense as apiDeleteExpense } from '../api/api';
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
  const { theme: currentThemeMode, toggleTheme } = useTheme();
  const [tripName, setTripName] = useState('');
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({
    departure: '',
    destination: '',
    transport: 'bus',
    date: '',
    passengers: 1
  });
  const [searchResults, setSearchResults] = useState([]);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expense-form');
  const [tabStates, setTabStates] = useState({
    'expense-form': false,
    'expense-list': false
  });
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'transport',
    date: ''
  });
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    travelers: 1,
    date: '',
    specialRequests: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  useEffect(() => {
    const loadExpenses = async () => {
      if (!user?.id) return;
      try {
        setFormLoading(true);
        const userExpenses = await fetchUserExpenses(user.id);
        const formattedExpenses = userExpenses.map(expense => ({
          ...expense,
          title: expense.description,
          amount: parseFloat(expense.amount) 
        }));
        setExpenses(formattedExpenses);
      } catch (error) {
        console.error('Failed to load expenses:', error);
        setAlertInfo({ type: 'error', message: 'Failed to load expenses.' });
      } finally {
        setFormLoading(false);
      }
    };
    loadExpenses();
  }, [user?.id]);
  if (!user) {
    return (
      <Box sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.primary'
      }}>
        <Typography variant="h6">Please log in to access trip planning.</Typography>
      </Box>
    );
  }
  const dummyResults = [
    {
      id: 1,
      departure: 'Mumbai',
      destination: 'Delhi',
      transport: 'plane',
      price: 8500,
      duration: '2h 30m',
      company: 'Air India',
      rating: 4.2
    },
    {
      id: 2,
      departure: 'Mumbai',
      destination: 'Delhi',
      transport: 'train',
      price: 2500,
      duration: '16h 45m',
      company: 'Rajdhani Express',
      rating: 4.0
    },
    {
      id: 3,
      departure: 'Mumbai',
      destination: 'Delhi',
      transport: 'bus',
      price: 1200,
      duration: '18h 30m',
      company: 'RedBus Premium',
      rating: 3.8
    }
  ];
  const toggleSidePanel = () => setSidePanelOpen(!sidePanelOpen);
  const handleAddNewTrip = async () => {
    if (!tripName.trim()) {
      setAlertInfo({ type: 'error', message: 'Trip name cannot be empty.' });
      return;
    }
    try {
      setFormLoading(true);
      const tripData = {
        name: tripName,
        userId: user?.id,
        status: "planning",
        createdAt: new Date().toISOString()
      };
      const newTrip = await createTrip(tripData);
      console.log('Trip created:', newTrip);
      setShowTripForm(true);
      setAlertInfo({ type: 'success', message: `Trip "${tripName}" created successfully!` });
    } catch (error) {
      console.error('Failed to create trip:', error);
      setAlertInfo({ type: 'error', message: 'Failed to create trip. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };
  const handleSearch = () => {
    if (!tripForm.departure || !tripForm.destination) {
      setAlertInfo({ type: 'error', message: 'Please enter both departure and destination.' });
      return;
    }
    setSearchResults(dummyResults);
    setAlertInfo({ type: 'success', message: 'Search completed!' });
  };
  const toggleTab = (tabName) => {
    setTabStates(prev => ({
      ...Object.fromEntries(Object.keys(prev).map(key => [key, false])),
      [tabName]: !prev[tabName]
    }));
    setActiveTab(tabName);
  };
  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      setAlertInfo({ type: 'error', message: 'Please fill all expense fields.' });
      return;
    }
    if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
      setAlertInfo({ type: 'error', message: 'Amount must be a positive number.' });
      return;
    }
    try {
      setFormLoading(true);
      const expenseData = {
        userId: user?.id,
        date: newExpense.date || new Date().toISOString().split('T')[0],
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        description: newExpense.title,
        receiptUrl: ""
      };
      const createdExpense = await createExpense(expenseData);
      setExpenses(prev => [...prev, { ...createdExpense, title: newExpense.title }]);
      setNewExpense({ title: '', amount: '', category: 'transport', date: '' });
      setAlertInfo({ type: 'success', message: 'Expense added successfully!' });
    } catch (error) {
      console.error('Failed to add expense:', error);
      setAlertInfo({ type: 'error', message: 'Failed to add expense. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };
  const deleteExpense = async (id) => {
    try {
      await apiDeleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      setAlertInfo({ type: 'success', message: 'Expense deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setAlertInfo({ type: 'error', message: 'Failed to delete expense. Please try again.' });
    }
  };
  const addToExpenseTracker = async (result) => {
    try {
      setFormLoading(true);
      const expenseData = {
        userId: user?.id,
        date: tripForm.date || new Date().toISOString().split('T')[0],
        category: 'transport',
        amount: result.price,
        description: `${result.transport.toUpperCase()} - ${result.departure} to ${result.destination}`,
        receiptUrl: ""
      };
      const createdExpense = await createExpense(expenseData);
      const expense = {
        ...createdExpense,
        title: `${result.transport.toUpperCase()} - ${result.departure} to ${result.destination}`
      };
      setExpenses(prev => [...prev, expense]);
      setAlertInfo({ type: 'success', message: 'Added to expense tracker!' });
    } catch (error) {
      console.error('Failed to add expense:', error);
      setAlertInfo({ type: 'error', message: 'Failed to add to expense tracker. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };
  const handleBookNow = (result) => {
    setSelectedResult(result);
    setBookingForm({
      travelers: tripForm.passengers || 1,
      date: tripForm.date || '',
      specialRequests: ''
    });
    setShowBookingModal(true);
  };
  const handleBookingSubmit = async () => {
    if (!bookingForm.date) {
      setAlertInfo({ type: 'error', message: 'Please select a travel date.' });
      return;
    }
    if (bookingForm.travelers <= 0) {
      setAlertInfo({ type: 'error', message: 'Number of travelers must be at least 1.' });
      return;
    }
    try {
      setBookingLoading(true);
      const bookingData = {
        userId: user?.id,
        packageId: selectedResult.id,
        date: bookingForm.date,
        travelers: bookingForm.travelers,
        status: 'pending',
        transportType: selectedResult.transport,
        route: `${selectedResult.departure} to ${selectedResult.destination}`,
        amount: selectedResult.price * bookingForm.travelers,
        specialRequests: bookingForm.specialRequests || ''
      };
      const booking = await createBooking(bookingData);
      console.log('Booking created:', booking);
      setShowBookingModal(false);
      setAlertInfo({ type: 'success', message: 'Booking submitted successfully!' });
    } catch (error) {
      console.error('Failed to create booking:', error);
      setAlertInfo({ type: 'error', message: 'Failed to create booking. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return (
    <Container maxWidth="xl" sx={{
      py: 4,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)',
    }}>
      {alertInfo && (
        <Alert severity={alertInfo.type} sx={{ mb: 2, mx: 'auto', width: 'fit-content' }}>
          {alertInfo.message}
        </Alert>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
          flexGrow: 1,
          position: 'relative',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection:"column",
              mb: 3,
              position: 'relative' 
            }}>
              <Typography variant="h4" component="h1" color="primary" sx={{ textAlign: 'center' }}>
                Plan Your Trip
              </Typography>
              <IconButton
                color="primary"
                sx={{
                  display: { xs: 'none', lg: 'block' }, 
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
                onClick={toggleSidePanel}
                aria-label="Toggle Expense Tracker"
              >
                {sidePanelOpen ? <ChevronUp size={20} /> : <DollarSign size={20} />}
              </IconButton>
            </Box>

            {!showTripForm && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ maxWidth: '28rem', mx: 'auto' }}
              >
                <TextField
                  fullWidth
                  label="Enter trip name here"
                  variant="outlined"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  disabled={formLoading}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddNewTrip}
                  startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <Plus size={20} />}
                  disabled={formLoading || !tripName.trim()}
                  sx={{ py: 1.5 }}
                >
                  Add New Trip
                </Button>
              </Stack>
            )}
            {showTripForm && (
              <Stack spacing={3}>
                <Typography variant="h5" component="h2" color="text.primary" textAlign="center">
                  Trip: {tripName}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2
                  }}
                >
                  <TextField
                    fullWidth
                    label="Departure From"
                    variant="outlined"
                    value={tripForm.departure}
                    onChange={(e) => setTripForm(prev => ({ ...prev, departure: e.target.value }))}
                    disabled={formLoading}
                  />
                  <TextField
                    fullWidth
                    label="Destination"
                    variant="outlined"
                    value={tripForm.destination}
                    onChange={(e) => setTripForm(prev => ({ ...prev, destination: e.target.value }))}
                    disabled={formLoading}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2
                  }}
                >
                  <FormControl fullWidth variant="outlined" disabled={formLoading}>
                    <InputLabel id="transport-label">Mode of Transport</InputLabel>
                    <Select
                      labelId="transport-label"
                      label="Mode of Transport"
                      value={tripForm.transport}
                      onChange={(e) => setTripForm(prev => ({ ...prev, transport: e.target.value }))}
                    >
                      <MenuItem value="bus">Bus</MenuItem>
                      <MenuItem value="train">Train</MenuItem>
                      <MenuItem value="plane">Aeroplane</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Travel Date"
                    type="date"
                    variant="outlined"
                    value={tripForm.date}
                    onChange={(e) => setTripForm(prev => ({ ...prev, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    disabled={formLoading}
                  />
                  <TextField
                    fullWidth
                    label="Passengers"
                    type="number"
                    variant="outlined"
                    inputProps={{ min: 1 }}
                    value={tripForm.passengers}
                    onChange={(e) => setTripForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                    disabled={formLoading}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSearch}
                    startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <Search size={20} />}
                    disabled={formLoading || !tripForm.departure || !tripForm.destination}
                    sx={{ px: 3, py: 1.5 }}
                  >
                    Search
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>
          {searchResults.length > 0 && (
            <Stack spacing={2}>
              <Typography variant="h5" component="h3" color="text.primary">
                Search Results
              </Typography>
              {searchResults.map((result) => (
                <Paper key={result.id} sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={{ xs: 1, sm: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                      <Box sx={{ color: 'text.secondary' }}>
                        {getTransportIcon(result.transport)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                          <MapPin size={16} /> {result.departure} → {result.destination}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.company} • {result.duration} • Rating: {result.rating}/5
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          ₹{result.price}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per person
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#3b82f6',
                          '&:hover': { backgroundColor: '#2563eb' },
                          flex: 1
                        }}
                        onClick={() => handleBookNow(result)}
                        disabled={formLoading}
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#8b5cf6',
                          '&:hover': { backgroundColor: '#7c3aed' },
                          flex: 1
                        }}
                        onClick={() => addToExpenseTracker(result)}
                        disabled={formLoading}
                      >
                        Add to Tracker
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1500,
            display: { xs: 'block', lg: 'none' } 
          }}
        >
          <IconButton
            color="primary"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
              boxShadow: 3,
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
            onClick={toggleSidePanel}
            aria-label="Toggle Expense Tracker"
          >
            <DollarSign size={24} />
          </IconButton>
        </Box>
        <Box
          sx={{
            position: { xs: 'fixed', lg: 'relative' },
            top: 0,
            right: 0,
            height: { xs: '100%', lg: 'auto' },
            width: { xs: '100%', sm: '20rem', lg: '25rem' },
            backgroundColor: 'background.paper',
            boxShadow: 8,
            zIndex: { xs: 2000, lg: 1 },
            transition: 'transform 0.3s ease-in-out',
            transform: sidePanelOpen ? 'translateX(0)' : { xs: 'translateX(100%)', lg: 'translateX(0)' },
            display: { xs: 'block', lg: (sidePanelOpen ? 'block' : 'none') },
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h3" color="text.primary" fontWeight="bold">
                Expense Tracker
              </Typography>
              <IconButton
                onClick={() => setSidePanelOpen(false)}
                sx={{ display: { lg: 'none' }, color: 'text.primary' }}
              >
                &times;
              </IconButton>
            </Box>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => toggleTab('expense-form')}
                endIcon={tabStates['expense-form'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                sx={{ justifyContent: 'space-between' }}
              >
                Add Expense
              </Button>
              {tabStates['expense-form'] && (
                <Paper sx={{ p: 2, borderRadius: 1, bgcolor: 'background.default', boxShadow: 1 }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Expense title"
                      variant="outlined"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                      disabled={formLoading}
                    />
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      variant="outlined"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      disabled={formLoading}
                    />
                    <FormControl fullWidth variant="outlined" disabled={formLoading}>
                      <InputLabel id="expense-category-label">Category</InputLabel>
                      <Select
                        labelId="expense-category-label"
                        label="Category"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <MenuItem value="transport">Transport</MenuItem>
                        <MenuItem value="accommodation">Accommodation</MenuItem>
                        <MenuItem value="food">Food</MenuItem>
                        <MenuItem value="entertainment">Entertainment</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      variant="outlined"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      disabled={formLoading}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={addExpense}
                      disabled={formLoading || !newExpense.title || !newExpense.amount}
                      startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      Add Expense
                    </Button>
                  </Stack>
                </Paper>
              )}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => toggleTab('expense-list')}
                endIcon={tabStates['expense-list'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                sx={{ justifyContent: 'space-between' }}
              >
                Expense List ({expenses.length})
              </Button>
              {tabStates['expense-list'] && (
                <Paper sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  boxShadow: 1,
                  maxHeight: '24rem',
                  overflowY: 'auto'
                }}>
                  {expenses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No expenses added yet
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ borderBottom: 1, borderColor: 'primary.main', pb: 0.5, mb: 1 }}>
                        Total: ₹{totalExpenses.toFixed(2)}
                      </Typography>
                      {expenses.map((expense) => (
                        <Paper key={expense.id} sx={{ p: 1.5, borderRadius: 1, border: 1, borderColor: 'primary.light' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={500} color="text.primary">
                                {expense.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                                {expense.category}
                              </Typography>
                              {expense.date && (
                                <Typography variant="caption" color="text.disabled">
                                  {expense.date}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight={600} color="success.main">
                                ₹{expense.amount.toFixed(2)}
                              </Typography>
                              <IconButton
                                onClick={() => deleteExpense(expense.id)}
                                color="error"
                                size="small"
                                sx={{ '&:hover': { color: 'error.dark' } }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
      {sidePanelOpen && (
        <Box
          onClick={() => setSidePanelOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: { xs: 1900, lg: -1 }
          }}
        />
      )}
      <Dialog
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: 8,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: 'primary.main', pb: 0 }}>
          Book Your Trip
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          {selectedResult && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedResult.departure} → {selectedResult.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedResult.company} • {selectedResult.transport.toUpperCase()}
              </Typography>
              <Typography variant="body1">
                ₹{selectedResult.price} per person
              </Typography>
            </Box>
          )}
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Travel Date"
              type="date"
              variant="outlined"
              value={bookingForm.date}
              onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              disabled={bookingLoading}
            />
            <TextField
              fullWidth
              label="Number of Travelers"
              type="number"
              min="1"
              variant="outlined"
              value={bookingForm.travelers}
              onChange={(e) => setBookingForm(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
              disabled={bookingLoading}
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
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowBookingModal(false)}
            variant="outlined"
            color="secondary"
            disabled={bookingLoading}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            color="success"
            disabled={bookingLoading}
            startIcon={bookingLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ flex: 1 }}
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