import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button as MuiButton, 
  Container as MuiContainer, 
  CircularProgress, 
  Alert 
} from "@mui/material";
export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); 
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatusMessage(null); 
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    if (!formData.name || !formData.email || !formData.message) {
      setStatusMessage({ type: 'error', text: 'All fields are required.' });
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setLoading(false);
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setStatusMessage({ type: 'success', text: `Thank you, ${formData.name}! Your message has been received.` });
      setFormData({ name: "", email: "", message: "" }); 
    } catch (error) {
      console.error("Contact form submission error:", error);
      setStatusMessage({ type: 'error', text: 'An error occurred while sending your message. Please try again.' });
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
      }}
    >
      <Box 
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper, 
          padding: { xs: 3, sm: 4 }, 
          borderRadius: 2,
          boxShadow: 3,
          width: '100%', 
          maxWidth: 450, 
        }}
      >
        <Typography
          variant="h4" 
          component="h2" 
          color="primary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          Contact Us
        </Typography>
        {statusMessage && (
          <Alert severity={statusMessage.type} sx={{ mb: 2 }}>
            {statusMessage.text}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            margin="normal"
            label="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined" 
            disabled={loading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            disabled={loading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Your Message"
            name="message"
            multiline 
            rows={5} 
            value={formData.message}
            onChange={handleChange}
            required
            variant="outlined"
            disabled={loading}
            sx={{
              '& .MuiInputBase-root': {
                resize: 'vertical',
              },
            }}
          />
          <MuiButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
          </MuiButton>
        </Box>
      </Box>
    </MuiContainer>
  );
}