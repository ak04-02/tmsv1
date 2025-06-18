import React from "react";
import { Box, Typography, Container as MuiContainer } from "@mui/material"; 

export default function About() {
  return (
    <MuiContainer
      sx={{
        py: { xs: 4, md: 6 }, 
        px: { xs: 2, sm: 3, md: 4 }, 
        backgroundColor: (theme) => theme.palette.background.default, 
        color: (theme) => theme.palette.text.primary, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        textAlign: 'center', 
        marginTop:'5vh',
        borderRadius: 2, 
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h3" 
        component="h1" 
        color="primary" 
        sx={{ mb: 4 }} 
      >
        About TravelMS
      </Typography>
      <Typography
        variant="body1" 
        sx={{
          maxWidth: 700, 
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, 
          lineHeight: 1.6,
          mb: 3, 
        }}
      >
        TravelMS is your all-in-one travel management system designed to make
        trip planning effortless and enjoyable. Whether you are booking flights,
        hotels, or managing your itinerary, our platform provides a seamless
        experience tailored to your needs.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          maxWidth: 700,
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
          lineHeight: 1.6,
        }}
      >
        Our mission is to empower travelers with easy-to-use tools and real-time
        updates, ensuring every journey is smooth and memorable.
      </Typography>
    </MuiContainer>
  );
}