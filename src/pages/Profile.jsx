import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper, 
  CircularProgress,
  Alert,
  Stack, 
  useTheme as useMuiTheme 
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext'; 
export default function Profile() {
  const { user, isAuthenticated, login } = useAuth();
  const muiTheme = useMuiTheme(); 
  // const { currentMode, toggleTheme } = useMyCustomTheme(); 
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null); 
    setSuccess(null); 
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const fieldsToUpdate = {
        email: formData.email,
        phone: formData.phone,
      };
      const updatedUserData = { ...user, ...fieldsToUpdate };
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUserData),
      });
      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.message || "Failed to update profile");
      }
      const updatedUser = await res.json();
      login(updatedUser); 
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
        <Typography variant="h6" color="text.secondary">Loading profile...</Typography>
      </Container>
    );
  }
  if (!isAuthenticated) {
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
        <Alert severity="warning">Please log in to view your profile.</Alert>
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 500, width: '100%', mx: "auto", borderRadius: 2, boxShadow: 6 }}>
        <Typography variant="h4" component="h1" color="primary" align="center" gutterBottom>
          Profile Management
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Manage your personal information here.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}> 
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <TextField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              fullWidth
              margin="normal"
              disabled 
              InputProps={{
                readOnly: true, 
              }}
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting} 
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}