import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import {
  Container, Box, Typography, Button, Tabs, Tab, Paper,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody,
  TextField, Checkbox, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  fetchPackages,
  updateTrip,
} from '../api/api';
const API_BASE = "http://localhost:5000"; 
const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newPackage, setNewPackage] = useState({
    title: '', description: '', image: '', price: '', 
    originalPrice: '', duration: '', category: '',
    startDate: '', endDate: '', departureLocation: '', destinationLocation: ''
  });
  const [openAddPackageDialog, setOpenAddPackageDialog] = useState(false);
  const [openEditPackageDialog, setOpenEditPackageDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openEditTripDialog, setOpenEditTripDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const fetchAllUsersForAdminDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error("Failed to fetch all users.");
      return await res.json();
    } catch (err) {
      console.error('Error in fetchAllUsersForAdminDashboard:', err);
      throw err;
    }
  };
  const updateUserForAdminDashboard = async (userId, userData) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user.");
      }
      return await res.json();
    } catch (err) {
      console.error('Error in updateUserForAdminDashboard:', err);
      throw err;
    }
  };
  const fetchAllBookingsForAdminDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      if (!res.ok) throw new Error("Failed to fetch all bookings.");
      return await res.json();
    } catch (err) {
      console.error('Error in fetchAllBookingsForAdminDashboard:', err);
      throw err;
    }
  };
  const updateBookingStatusForAdminDashboard = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update booking status.");
      }
      return await res.json();
    } catch (err) {
      console.error('Error in updateBookingStatusForAdminDashboard:', err);
      throw err;
    }
  };
  const addPackageForAdminDashboard = async (packageData) => {
    try {
      const res = await fetch(`${API_BASE}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add package.");
      }
      return await res.json();
    } catch (err) {
      console.error('Error in addPackageForAdminDashboard:', err);
      throw err;
    }
  };
  const updatePackageForAdminDashboard = async (packageId, packageData) => {
    try {
      const res = await fetch(`${API_BASE}/packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update package.");
      }
      return await res.json();
    } catch (err) {
      console.error('Error in updatePackageForAdminDashboard:', err);
      throw err;
    }
  };
  const deletePackageForAdminDashboard = async (packageId) => {
    try {
      const res = await fetch(`${API_BASE}/packages/${packageId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete package.");
      }
      return true;
    } catch (err) {
      console.error('Error in deletePackageForAdminDashboard:', err);
      throw err;
    }
  };
  const fetchAllTripsForAdminDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/trips`);
      if (!res.ok) throw new Error("Failed to fetch all trips.");
      return await res.json();
    } catch (err) {
      console.error('Error in fetchAllTripsForAdminDashboard:', err);
      throw err;
    }
  };
  const fetchAllExpensesForAdminDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      if (!res.ok) throw new Error("Failed to fetch all expenses.");
      return await res.json();
    } catch (err) {
      console.error('Error in fetchAllExpensesForAdminDashboard:', err);
      throw err;
    }
  };
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/login');
    } else if (user && user.isAdmin) {
      fetchAdminData();
    }
  }, [user, loading, navigate]); 
  const fetchAdminData = async () => {
    setError(null);
    try {
      const [fetchedUsers, fetchedBookings, fetchedPackages, fetchedTrips, fetchedExpenses] =
        await Promise.all([
          fetchAllUsersForAdminDashboard(),
          fetchAllBookingsForAdminDashboard(),
          fetchPackages(), 
          fetchAllTripsForAdminDashboard(),
          fetchAllExpensesForAdminDashboard()
        ]);
      setUsers(fetchedUsers);
      setBookings(fetchedBookings);
      setPackages(fetchedPackages);
      setTrips(fetchedTrips);
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch admin data. Please try again. Error: ' + err.message);
    }
  };
  const handleUpdateBookingStatus = async (bookingId, currentStatus) => {
    const newStatus = prompt(`Enter new status for booking ${bookingId} (e.g., pending, confirmed, cancelled, completed):`, currentStatus);
    if (newStatus && newStatus.trim() !== '' && newStatus !== currentStatus) { 
      try {
        await updateBookingStatusForAdminDashboard(bookingId, newStatus.trim());
        fetchAdminData(); 
      } catch (err) {
        console.error('Error updating booking status:', err);
        setError('Failed to update booking status. Please try again. Error: ' + err.message);
      }
    }
  };
  const handleNewPackageFormChange = (e) => {
    const { name, value, type } = e.target;
    setNewPackage(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value 
    }));
  };
  const handleAddPackageSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    if (!newPackage.title || !newPackage.description || !newPackage.price || !newPackage.duration || !newPackage.category) {
      setError("Please fill in all required fields for the new package.");
      return;
    }
    try {
      await addPackageForAdminDashboard(newPackage);
      setOpenAddPackageDialog(false);
      setNewPackage({ 
        title: '', description: '', image: '', price: '',
        originalPrice: '', duration: '', category: '',
        startDate: '', endDate: '', departureLocation: '', destinationLocation: ''
      });
      fetchAdminData(); 
    } catch (err) {
      console.error('Error adding package:', err);
      setError('Failed to add package. Please try again. Error: ' + err.message);
    }
  };
  const handleDeletePackage = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      try {
        await deletePackageForAdminDashboard(packageId);
        fetchAdminData(); 
      } catch (err) {
        console.error('Error deleting package:', err);
        setError('Failed to delete package. Please try again. Error: ' + err.message);
      }
    }
  };
  const handleEditPackageClick = (pkg) => {
    const formattedPkg = {
      ...pkg,
      startDate: pkg.startDate ? new Date(pkg.startDate).toISOString().split('T')[0] : '',
      endDate: pkg.endDate ? new Date(pkg.endDate).toISOString().split('T')[0] : '',
      price: pkg.price || '',
      originalPrice: pkg.originalPrice || '',
    };
    setEditingPackage(formattedPkg);
    setOpenEditPackageDialog(true);
  };
  const handleEditPackageFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditingPackage(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value 
    }));
  };
  const handleEditPackageSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    if (!editingPackage.title || !editingPackage.description || !editingPackage.price || !editingPackage.duration || !editingPackage.category) {
      setError("Please fill in all required fields for the package.");
      return;
    }
    try {
      await updatePackageForAdminDashboard(editingPackage.id, editingPackage);
      setOpenEditPackageDialog(false);
      setEditingPackage(null); 
      fetchAdminData(); 
    } catch (err) {
      console.error('Error updating package:', err);
      setError('Failed to update package. Please try again. Error: ' + err.message);
    }
  };
  const handleEditUserClick = (user) => {
    setEditingUser({ ...user });
    setOpenEditUserDialog(true);
  };
  const handleEditUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    try {
      await updateUserForAdminDashboard(editingUser.id, editingUser);
      setOpenEditUserDialog(false);
      setEditingUser(null);
      fetchAdminData();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again. Error: ' + err.message);
    }
  };
  const handleEditTripClick = (trip) => {
    const formattedTrip = {
      ...trip,
      date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : '',
      price: trip.price || '', 
    };
    setEditingTrip(formattedTrip);
    setOpenEditTripDialog(true);
  };
  const handleEditTripFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditingTrip(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };
  const handleEditTripSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    try {
      await updateTrip(editingTrip.id, editingTrip); 
      setOpenEditTripDialog(false);
      setEditingTrip(null);
      fetchAdminData();
    } catch (err) {
      console.error('Error updating trip:', err);
      setError('Failed to update trip. Please try again. Error: ' + err.message);
    }
  };
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading admin panel...</Typography>
      </Container>
    );
  }
  if (!user || !user.isAdmin) {
    return null; 
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: muiTheme.palette.mode === 'light' ? muiTheme.palette.background.paper : muiTheme.palette.background.default,
        boxShadow: muiTheme.shadows[1]
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: muiTheme.palette.text.primary, mb: 0 }}>
          Admin Dashboard
        </Typography>
        {/* <Button variant="contained" color="secondary" onClick={logout}>
          Logout
        </Button> */}
      </Box>
      <Typography variant="h6" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
        Welcome, {user.username}!
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        aria-label="Admin Tabs"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Users" />
        <Tab label="Bookings" />
        <Tab label="Packages" />
        <Tab label="Trips" />
        <Tab label="Expenses" />
      </Tabs>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, boxShadow: muiTheme.shadows[3] }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: muiTheme.palette.primary.main }}>
            All Users
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: muiTheme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map(u => (
                    <TableRow key={u.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || 'N/A'}</TableCell>
                      <TableCell>{u.isAdmin ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <IconButton aria-label="edit user" size="small" onClick={() => handleEditUserClick(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: muiTheme.palette.text.secondary }}>No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, boxShadow: muiTheme.shadows[3] }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: muiTheme.palette.primary.main }}>
            All Bookings
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: muiTheme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Package ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Travelers</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Transport</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requests</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings.map(b => (
                    <TableRow key={b.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{b.id}</TableCell>
                      <TableCell>{b.userId}</TableCell>
                      <TableCell>{b.packageId}</TableCell>
                      <TableCell>{b.date}</TableCell>
                      <TableCell>{b.travelers}</TableCell>
                      <TableCell>${b.amount}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 'bold',
                            color: b.status === 'confirmed' ? muiTheme.palette.success.main :
                              b.status === 'pending' ? muiTheme.palette.warning.main :
                                b.status === 'cancelled' ? muiTheme.palette.error.main :
                                  muiTheme.palette.text.primary
                          }}
                        >
                          {b.status}
                        </Typography>
                      </TableCell>
                      <TableCell>{b.transportType || 'N/A'}</TableCell>
                      <TableCell>{b.route || 'N/A'}</TableCell>
                      <TableCell>{b.specialRequests || 'None'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleUpdateBookingStatus(b.id, b.status)}
                        >
                          Change Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} sx={{ textAlign: 'center', color: muiTheme.palette.text.secondary }}>No bookings found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, boxShadow: muiTheme.shadows[3] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ color: muiTheme.palette.primary.main, mb: 0 }}>
              Manage Packages
            </Typography>
            <Button variant="contained" onClick={() => setOpenAddPackageDialog(true)}>
              Add New Package
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: muiTheme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.length > 0 ? (
                  packages.map(p => (
                    <TableRow key={p.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>${p.price}</TableCell>
                      <TableCell>{p.duration}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>
                        <IconButton aria-label="edit" size="small" onClick={() => handleEditPackageClick(p)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton aria-label="delete" size="small" color="error" onClick={() => handleDeletePackage(p.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: muiTheme.palette.text.secondary }}>No packages found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, boxShadow: muiTheme.shadows[3] }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: muiTheme.palette.primary.main }}>
            All Trips
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: muiTheme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Departure</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.length > 0 ? (
                  trips.map(t => (
                    <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.userId}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.departure}</TableCell>
                      <TableCell>{t.destination}</TableCell>
                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>${t.price}</TableCell>
                      <TableCell>
                        <IconButton aria-label="edit trip" size="small" onClick={() => handleEditTripClick(t)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', color: muiTheme.palette.text.secondary }}>No trips found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {activeTab === 4 && (
        <Paper sx={{ p: 3, boxShadow: muiTheme.shadows[3] }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: muiTheme.palette.primary.main }}>
            All Expenses
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: muiTheme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map(e => (
                    <TableRow key={e.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{e.id}</TableCell>
                      <TableCell>{e.userId}</TableCell>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>${e.amount}</TableCell>
                      <TableCell>{e.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: muiTheme.palette.text.secondary }}>No expenses found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <Dialog open={openAddPackageDialog} onClose={() => setOpenAddPackageDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Package</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleAddPackageSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={newPackage.title} onChange={handleNewPackageFormChange} required fullWidth />
            <TextField label="Description" name="description" value={newPackage.description} onChange={handleNewPackageFormChange} multiline rows={3} required fullWidth />
            <TextField label="Image URL" name="image" value={newPackage.image} onChange={handleNewPackageFormChange} fullWidth />
            <TextField label="Price" name="price" type="number" value={newPackage.price} onChange={handleNewPackageFormChange} required fullWidth inputProps={{ step: "0.01" }} />
            <TextField label="Original Price (optional)" name="originalPrice" type="number" value={newPackage.originalPrice} onChange={handleNewPackageFormChange} fullWidth inputProps={{ step: "0.01" }} />
            <TextField label="Duration (e.g., 5 days)" name="duration" value={newPackage.duration} onChange={handleNewPackageFormChange} fullWidth />
            <TextField label="Category" name="category" value={newPackage.category} onChange={handleNewPackageFormChange} fullWidth />
            <TextField label="Start Date" name="startDate" type="date" value={newPackage.startDate} onChange={handleNewPackageFormChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="End Date" name="endDate" type="date" value={newPackage.endDate} onChange={handleNewPackageFormChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Departure Location" name="departureLocation" value={newPackage.departureLocation} onChange={handleNewPackageFormChange} fullWidth />
            <TextField label="Destination Location" name="destinationLocation" value={newPackage.destinationLocation} onChange={handleNewPackageFormChange} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddPackageDialog(false)}>Cancel</Button>
          <Button type="submit" onClick={handleAddPackageSubmit} variant="contained" color="primary">Add Package</Button>
        </DialogActions>
      </Dialog>
      {editingPackage && (
        <Dialog open={openEditPackageDialog} onClose={() => setOpenEditPackageDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Package</DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleEditPackageSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="ID" name="id" value={editingPackage.id} disabled fullWidth />
              <TextField label="Title" name="title" value={editingPackage.title} onChange={handleEditPackageFormChange} required fullWidth />
              <TextField label="Description" name="description" value={editingPackage.description} onChange={handleEditPackageFormChange} multiline rows={3} required fullWidth />
              <TextField label="Image URL" name="image" value={editingPackage.image} onChange={handleEditPackageFormChange} fullWidth />
              <TextField label="Price" name="price" type="number" value={editingPackage.price} onChange={handleEditPackageFormChange} required fullWidth inputProps={{ step: "0.01" }} />
              <TextField label="Original Price (optional)" name="originalPrice" type="number" value={editingPackage.originalPrice || ''} onChange={handleEditPackageFormChange} fullWidth inputProps={{ step: "0.01" }} />
              <TextField label="Duration (e.g., 5 days)" name="duration" value={editingPackage.duration} onChange={handleEditPackageFormChange} fullWidth />
              <TextField label="Category" name="category" value={editingPackage.category} onChange={handleEditPackageFormChange} fullWidth />
              <TextField label="Start Date" name="startDate" type="date" value={editingPackage.startDate || ''} onChange={handleEditPackageFormChange} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="End Date" name="endDate" type="date" value={editingPackage.endDate || ''} onChange={handleEditPackageFormChange} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Departure Location" name="departureLocation" value={editingPackage.departureLocation} onChange={handleEditPackageFormChange} fullWidth />
              <TextField label="Destination Location" name="destinationLocation" value={editingPackage.destinationLocation} onChange={handleEditPackageFormChange} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditPackageDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditPackageSubmit} variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}
      {editingUser && (
        <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} fullWidth maxWidth="xs">
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleEditUserSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="ID" name="id" value={editingUser.id} disabled fullWidth />
              <TextField label="Username" name="username" value={editingUser.username} onChange={handleEditUserFormChange} required fullWidth />
              <TextField label="Email" name="email" type="email" value={editingUser.email} onChange={handleEditUserFormChange} required fullWidth />
              <TextField label="Phone" name="phone" value={editingUser.phone || ''} onChange={handleEditUserFormChange} fullWidth />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingUser.isAdmin || false}
                    onChange={handleEditUserFormChange}
                    name="isAdmin"
                  />
                }
                label="Is Admin"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditUserDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditUserSubmit} variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}
      {editingTrip && (
        <Dialog open={openEditTripDialog} onClose={() => setOpenEditTripDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Trip</DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleEditTripSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="ID" name="id" value={editingTrip.id} disabled fullWidth />
              <TextField label="User ID" name="userId" value={editingTrip.userId} disabled fullWidth />
              <TextField label="Name" name="name" value={editingTrip.name} onChange={handleEditTripFormChange} required fullWidth />
              <TextField label="Departure" name="departure" value={editingTrip.departure} onChange={handleEditTripFormChange} fullWidth />
              <TextField label="Destination" name="destination" value={editingTrip.destination} onChange={handleEditTripFormChange} fullWidth />
              <TextField label="Date" name="date" type="date" value={editingTrip.date || ''} onChange={handleEditTripFormChange} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Status" name="status" value={editingTrip.status} onChange={handleEditTripFormChange} fullWidth />
              <TextField label="Price" name="price" type="number" value={editingTrip.price} onChange={handleEditTripFormChange} required fullWidth inputProps={{ step: "0.01" }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditTripDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditTripSubmit} variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};
export default AdminDashboard;