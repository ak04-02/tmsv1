import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../api/api"; 
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link as MuiLink
} from "@mui/material"

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await loginUser(formData.username, formData.password); 
      if (user) {
        login(user);
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login API error:", err); 
      setError("Login failed. Please check your credentials or try again later.");
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
          maxWidth: '400px', 
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom 
          sx={{
            color: 'primary.main', 
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Login
        </Typography>

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%', 
          }}
        >
          <TextField
            label="Username" 
            variant="outlined" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            fullWidth 
            margin="normal" 
            sx={{ mb: 2 }} 
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            sx={{ mb: 1 }} 
          />
          <MuiLink
            component={Link} 
            to="/forgot-password"
            variant="body2" 
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              mt: 1,
              mb: 3, 
              textAlign: 'center',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot Password?
          </MuiLink>
          <Button
            type="submit"
            variant="contained" 
            color="primary"
            fullWidth
            size="large" 
            sx={{
              mt: 2, 
              py: 1.25,
            }}
          >
            Login
          </Button>
        </Box>
        <MuiLink
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
          Don't have an account? Sign up
        </MuiLink>
      </Paper>
    </Box>
  );
}