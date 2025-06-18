import { Box, Typography, Link, IconButton, Grid, Stack } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        padding: "3rem 2rem", 
        borderTop: (theme) => `2px solid ${theme.palette.primary.main}`,
        mt: "auto",
      }}
    >
      <Grid container spacing={4} justifyContent="space-around" alignItems="flex-start">
        <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" gutterBottom>
            TravelMS
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Your ultimate travel companion for unforgettable journeys. We connect you to the best destinations and experiences worldwide.
          </Typography>
          <Typography variant="body2">
            Explore. Dream. Discover.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" gutterBottom>
            Quick Links
          </Typography>
          <Stack direction="column" spacing={0.5} sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Link href="/" color="inherit" underline="hover" variant="body2">Home</Link>
            <Link href="/packages" color="inherit" underline="hover" variant="body2">Packages</Link>
            <Link href="/about" color="inherit" underline="hover" variant="body2">About Us</Link>
            <Link href="/contact" color="inherit" underline="hover" variant="body2">Contact</Link>
            {/* <Link href="/privacy-policy" color="inherit" underline="hover" variant="body2">Privacy Policy</Link> */}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" gutterBottom>
            Contact Us
          </Typography>
          <Stack direction="column" spacing={0.5} sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, fontSize: '1rem' }} /> +91 98765 43210
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} /> info@travelms.com
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1, fontSize: '1rem' }} /> 123 Travel Lane, City Name, <br /> Ahmedabad, India - 380001
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12} md={3} sx={{ textAlign: { xs: 'center', sm: 'center', md: 'left' } }}>
          <Typography variant="h6" gutterBottom>
            Follow Us
          </Typography>
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'center', md: 'flex-start' }}>
            <IconButton color="inherit" aria-label="Facebook" href="https://facebook.com/travelms" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Twitter" href="https://twitter.com/travelms" target="_blank" rel="noopener noreferrer">
              <TwitterIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Instagram" href="https://instagram.com/travelms" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="LinkedIn" href="https://linkedin.com/company/travelms" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, pt: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} TravelMS. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}