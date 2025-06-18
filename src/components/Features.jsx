import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
const features = [
  {
    title: "Easy Booking",
    desc: "Book flights, hotels, and tours all in one place.",
  },
  {
    title: "Itinerary Management",
    desc: "Keep your travel plans organized and accessible.",
  },
  {
    title: "Real-time Updates",
    desc: "Receive notifications about your bookings and travel alerts.",
  },
];
export default function Features() {
  return (
    <Box
      sx={{
        padding: "3rem 2rem",
        backgroundColor: (theme) => theme.palette.background.default,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        {features.map(({ title, desc }) => (
          <Grid item key={title} xs={12} sm={6} md={4}>
            <Card
              sx={{
                border: (theme) => `2px solid ${theme.palette.primary.main}`,
                borderRadius: "10px",
                boxShadow: 3,
                textAlign: "center",
                backgroundColor: (theme) => theme.palette.background.paper,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: (theme) => theme.palette.primary.main, mb: 1 }}
                >
                  {title}
                </Typography>
                <Typography variant="body1">{desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
