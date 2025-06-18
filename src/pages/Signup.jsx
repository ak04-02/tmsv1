import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Link, Alert, CircularProgress
} from "@mui/material"; 
export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({}); 
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null); 
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: null })); 
  };
  const validateForm = () => {
    let isValid = true;
    let errors = {};
    if (!formData.username) {
      errors.username = "Username is required.";
      isValid = false;
    }
    if (!formData.email) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) { 
      errors.email = "Email is not valid.";
      isValid = false;
    }
    if (!formData.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 6) { 
      errors.password = "Password must be at least 6 characters.";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    setFieldErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({}); 
    if (!validateForm()) {
      return;
    }
    setLoading(true); 
    try {
      const resCheckUsername = await fetch(
        `http://localhost:5000/users?username=${encodeURIComponent(formData.username)}`
      );
      const existingUsers = await resCheckUsername.json();
      if (existingUsers.length > 0) {
        setFieldErrors((prev) => ({ ...prev, username: "Username already taken." }));
        setLoading(false);
        return;
      }
      const resCheckEmail = await fetch(
        `http://localhost:5000/users?email=${encodeURIComponent(formData.email)}`
      );
      const existingEmails = await resCheckEmail.json();
      if (existingEmails.length > 0) {
        setFieldErrors((prev) => ({ ...prev, email: "Email already registered." }));
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!res.ok) {
        setError("Failed to create account. Please try again.");
        return;
      }
      alert(`Account created for ${formData.username}!`);
      navigate("/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false); 
    }
  };
  return (
    <Box 
          sx={{
            width: '100%', 
            minHeight: '80vh', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center', 
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: { xs: '2rem 1.5rem', sm: '3rem 2rem' },
              borderRadius: '10px',
              width: { xs: '90%', sm: '350px',md:'500px' }, 
              maxWidth: '500px', 
            }}
          >
      <Typography variant="h4" component="h2" gutterBottom 
                sx={{
                  color: 'primary.main', 
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                }}
              >
        Sign Up
      </Typography>
      {error && ( 
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          error={!!fieldErrors.username} 
          helperText={fieldErrors.username} 
          disabled={loading} 
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
          disabled={loading}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
          disabled={loading}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={!!fieldErrors.confirmPassword}
          helperText={fieldErrors.confirmPassword}
          disabled={loading}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 3, mb: 1 }} 
          disabled={loading} 
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
        </Button>
      </Box>
      <Link
                component={Link} 
                to="/signup"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  mt: 3,
                  textAlign: 'center',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
        Already have an account? Login
      </Link>
      </Paper>
    </Box>
  );
}