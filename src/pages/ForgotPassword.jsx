import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button as MuiButton,
  Container as MuiContainer,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles"; 
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); 
  const muiTheme = useMuiTheme(); 

  const handleChange = (e) => {
    setEmail(e.target.value);
    setStatusMessage(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address.' });
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setLoading(false);
      return;
    }

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      setStatusMessage({
        type: 'success',
        text: `If an account with "${email}" exists, a password reset link has been sent to your email.`,
      });
      setEmail(""); 
    } catch (error) {
      console.error("Forgot password request error:", error);
      setStatusMessage({
        type: 'error',
        text: 'An error occurred. Please check your email and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiContainer
      maxWidth="sm"
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '80vh', 
        justifyContent: 'center', 
      }}
    >
      <Paper 
        elevation={6} 
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: muiTheme.shape.borderRadius, 
          bgcolor: muiTheme.palette.background.paper, 
          color: muiTheme.palette.text.primary, 
          width: '100%',
          maxWidth: 450,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          color="primary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Forgot Password
        </Typography>
        {statusMessage && (
          <Alert severity={statusMessage.type} sx={{ mb: 2 }}>
            {statusMessage.text}
          </Alert>
        )}
        {statusMessage?.type === 'success' ? (
          <Typography variant="body1" sx={{ mt: 2, color: muiTheme.palette.text.secondary }}>
            Please check your email inbox (and spam folder) for further instructions.
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="Enter your email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              required
              variant="outlined"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: muiTheme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: muiTheme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: muiTheme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: muiTheme.palette.text.secondary,
                },
                '& .MuiInputBase-input': {
                  color: muiTheme.palette.text.primary,
                },
              }}
            />
            <MuiButton
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 600 }} 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
            </MuiButton>
          </Box>
        )}
      </Paper>
    </MuiContainer>
  );
}