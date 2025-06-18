import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
const ProtectedRoute = ({ isAdminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading authentication...</Typography>
      </Box>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isAdminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />; // Or '/'
  }
  return <Outlet />;
};

export default ProtectedRoute;