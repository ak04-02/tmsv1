import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Container,
  Pagination,
  useTheme as useMuiTheme 
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Sort as SortIcon } from '@mui/icons-material';
import { fetchPackages, createTrip } from "../api/api";
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext';
export default function Packages() {
  const { user } = useAuth();
  const muiTheme = useMuiTheme(); 
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("title_asc"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null); 
  const { currentMode, toggleTheme } = useMyCustomTheme(); 
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6); 
  useEffect(() => {
    fetchPackages()
      .then((data) => {
        setPackages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch packages:", err);
        setError("Failed to load packages. Please try again.");
        setLoading(false);
      });
  }, []);
  const categories = useMemo(() => {
    return Array.from(new Set(packages.map((pkg) => pkg.category))).filter(Boolean);
  }, [packages]);
  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages;
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(lowerSearch) ||
          (pkg.description && pkg.description.toLowerCase().includes(lowerSearch))
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((pkg) => pkg.category === categoryFilter);
    }
    filtered.sort((a, b) => {
      if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "title_desc") {
        return b.title.localeCompare(a.title);
      } else if (sortBy === "price_asc") {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === "price_desc") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });
    return filtered;
  }, [searchTerm, categoryFilter, sortBy, packages]);
  const paginatedPackages = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedPackages.slice(startIndex, endIndex);
  }, [page, rowsPerPage, filteredAndSortedPackages]);
  const pageCount = Math.ceil(filteredAndSortedPackages.length / rowsPerPage);
  const handleChangePage = (event, value) => {
    setPage(value);
  };
  const handleCreateTrip = async (packageData) => {
    if (!user?.id) {
      setAlertInfo({ type: 'error', message: 'Please log in to create a trip.' });
      return;
    }
    try {
      const tripName = `Trip to ${packageData.title}`; 
      const tripDetails = {
        name: tripName,
        userId: user.id,
        status: "planning",
        packageId: packageData.id, 
        departure: packageData.departure || '', 
        destination: packageData.destination || '',
        date: packageData.startDate || new Date().toISOString().split('T')[0], 
        price: packageData.price || 0,
        createdAt: new Date().toISOString(),
      };
      const newTrip = await createTrip(tripDetails);
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
        maxWidth="xl"
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading packages...</Typography>
      </Container>
    );
  }
  if (error) {
    return (
      <Container
        maxWidth="xl"
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
      maxWidth="xl"
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
      <Typography variant="h4" component="h1" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
        Travel Packages
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <TextField
          label="Search packages..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' } }}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180, flexShrink: 0 }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1); 
            }}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180, flexShrink: 0 }}>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1); 
            }}
            label="Sort By"
            startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            <MenuItem value="title_asc">Title (A-Z)</MenuItem>
            <MenuItem value="title_desc">Title (Z-A)</MenuItem>
            <MenuItem value="price_asc">Price (Low to High)</MenuItem>
            <MenuItem value="price_desc">Price (High to Low)</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {paginatedPackages.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No packages found matching your criteria.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {paginatedPackages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: '100%',
                  width:"70vh",
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                  backgroundColor: muiTheme.palette.background.paper,
                  color: muiTheme.palette.text.primary,
                }}
              >
                {pkg.image && ( 
                  <Box
                    component="img"
                    src={pkg.image}
                    alt={pkg.title}
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 1.5,
                    }}
                  />
                )}
                <Typography variant="h6" component="h3" color="primary" sx={{ mb: 1 }}>
                  {pkg.title}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1, mb: 1.5 }}>
                  {pkg.description}
                </Typography>
                {pkg.price && ( 
                  <Typography variant="body1" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                    Price: ₹{pkg.price.toLocaleString()}
                  </Typography>
                )}
                {pkg.duration && ( 
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Duration: {pkg.duration}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
                  <Button
                    component={Link}
                    to={`/packages/${pkg.id}`}
                    variant="outlined"
                    color="primary"
                    sx={{ flexGrow: 1 }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateTrip(pkg)}
                    sx={{ flexGrow: 1 }}
                  >
                    Create Trip
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}