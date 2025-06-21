import React, { useEffect, useState } from "react";
import {
  Grid, Paper, Typography, Box, Avatar,
  CircularProgress, Alert, Container, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useTheme as useMuiTheme 
} from "@mui/material";
import { motion } from "framer-motion";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flight as FlightIcon,
  AttachMoney as AttachMoneyIcon,
  LocalMall as LocalMallIcon,
  AccountBalanceWalletOutlined as ExpenseIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; 
import { fetchUserBookings, fetchPackages, fetchUserExpenses, fetchUserTrips } from "../api/api"; 
import { useAuth } from "../contexts/AuthContext";
import { useTheme as useMyCustomTheme } from '../contexts/Themecontext';
import { Link } from "react-router-dom";
ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const muiTheme = useMuiTheme(); 
  // const { currentMode, toggleTheme } = useMyCustomTheme();
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
    const [trips, setTrips] = useState([]);
  const [packagesMap, setPackagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchUserBookings(user.id),
      fetchPackages(),
      fetchUserExpenses(user.id) ,
      fetchUserTrips(user.id)
    ])
      .then(([userBookings, allPackages, userExpenses,userTrips]) => {
        setBookings(userBookings);
        setExpenses(userExpenses); 
        setTrips(userTrips);
        const map = {};
        allPackages.forEach((pkg) => {
          map[pkg.id] = {
            id: pkg.id,
            title: pkg.title,
            price: pkg.price || 0, 
            imageUrl: pkg.image || `https://source.unsplash.com/random/300x200?travel,${pkg.title}`
          };
        });
        setPackagesMap(map);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      });
  }, [isAuthenticated, user]);
  const fadeSlide = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const getMyTrips = () => {
    return trips.filter(trip => trip.userId === user.id) 
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3); 
};
const myRecentTrips = getMyTrips(); 
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const totalBookingExpense = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const getTotalMonthlyExpense = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    return expenses.reduce((sum, exp) => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        return sum + (exp.amount || 0);
      }
      return sum;
    }, 0);
  };
  const currentMonthExpense = getTotalMonthlyExpense();
  const getUpcomingBookings = () => {
    const selectedDate = new Date(date); 
    selectedDate.setHours(0, 0, 0, 0); 
    // const nextDay = new Date(selectedDate);
    // nextDay.setDate(selectedDate.getDate() + 1);

    return bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= selectedDate &&  b.status !== "cancelled"; 
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); 
  };
  
  const upcomingBookings = getUpcomingBookings();
  const getMonthlyExpensesForChart = () => {
    const monthlyData = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const monthYear = `${expDate.getFullYear()}-${expDate.getMonth()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + exp.amount;
    });
    const labels = [];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYearKey = `${date.getFullYear()}-${date.getMonth()}`;
      labels.push(date.toLocaleString('en-US', { month: 'short', year: '2-digit' }));
      data.push(monthlyData[monthYearKey] || 0);
    }
    return { labels, data };
  };
  const { labels: expenseLabels, data: expenseValues } = getMonthlyExpensesForChart();
  const expenseChartData = {
    labels: expenseLabels,
    datasets: [{
      label: 'Other Monthly Expenses (₹)',
      data: expenseValues,
      borderColor: muiTheme.palette.primary.main,
      backgroundColor: muiTheme.palette.primary.light,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: muiTheme.palette.primary.main,
      pointBorderColor: muiTheme.palette.background.paper,
      pointHoverBackgroundColor: muiTheme.palette.background.paper,
      pointHoverBorderColor: muiTheme.palette.primary.dark,
    }]
  };
  const getMonthlyBookingExpensesForChart = () => {
    const monthlyData = {};
    bookings
      .filter(b => b.status !== "cancelled") 
      .forEach(booking => {
      const bookingDate = new Date(booking.date);
      const monthYear = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (booking.amount || 0);
    });
    const labels = [];
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYearKey = `${date.getFullYear()}-${date.getMonth()}`;
      labels.push(date.toLocaleString('en-US', { month: 'short', year: '2-digit' }));
      data.push(monthlyData[monthYearKey] || 0);
    }
    return { labels, data };
  };
  const { labels: bookingExpenseLabels, data: bookingExpenseValues } = getMonthlyBookingExpensesForChart();
  const bookingExpenseChartData = {
    labels: bookingExpenseLabels,
    datasets: [{
      label: 'Booking Expenses (₹)',
      data: bookingExpenseValues,
      borderColor: muiTheme.palette.secondary.main,
      backgroundColor: muiTheme.palette.secondary.light,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: muiTheme.palette.secondary.main,
      pointBorderColor: muiTheme.palette.background.paper,
      pointHoverBackgroundColor: muiTheme.palette.background.paper,
      pointHoverBorderColor: muiTheme.palette.secondary.dark,
    }]
  };
  const bookingSummaryChartData = {
    labels: ["Total", "Pending", "Confirmed"],
    datasets: [{
      label: "Bookings",
      data: [totalBookings, pendingBookings, confirmedBookings],
      backgroundColor: [
        muiTheme.palette.primary.main,
        muiTheme.palette.warning.main,
        muiTheme.palette.success.main
      ],
      borderColor: muiTheme.palette.background.paper,
      borderWidth: 1,
    }]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          color: muiTheme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: muiTheme.palette.grey[800],
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 8,
        borderRadius: 6,
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += '₹' + context.parsed.y.toLocaleString('en-IN');
                }
                return label;
            }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: muiTheme.palette.text.secondary, font: { size: 10 } },
      },
      y: {
        grid: { color: muiTheme.palette.divider },
        ticks: {
            color: muiTheme.palette.text.secondary,
            font: { size: 10 },
            callback: function(value) {
                return value.toLocaleString('en-IN');
            }
        },
      },
    },
  };

  const calendarDynamicStyles = {
    '& .react-calendar': {
      width: '100%', 
      maxWidth: '320px', 
      backgroundColor: 'inherit',
      border: `none`,
      borderRadius: '12px',
      
      fontFamily: `'Roboto', sans-serif`,
      lineHeight: '1.125em',
      padding: '10px',
      color: muiTheme.palette.text.primary,
    },
    '@media (max-width: 900px)': {
    '& .react-calendar': {
      height: '80%',
      fontSize:'13px'
    },
  },
    '& .react-calendar--doubleView': {
      width: '700px', 
    },
    '& .react-calendar--doubleView .react-calendar__viewContainer': {
      display: 'flex',
      margin: '-0.5em',
    },
    '& .react-calendar--doubleView .react-calendar__viewContainer > *': {
      width: '50%',
      margin: '0.5em',
    },
    '& .react-calendar button': {
      margin: 0,
      border: 0,
      outline: 'none',
    },
    '& .react-calendar button:enabled:hover': {
      cursor: 'pointer',
    },
    '& .react-calendar__navigation': {
      display: 'flex',
      height: '44px',
      marginBottom: '1em',
    },
    '& .react-calendar__navigation button': {
      minWidth: '44px',
      background: 'none',
      fontSize: '1em',
      fontWeight: 'bold',
      color: muiTheme.palette.primary.main,
    },
    '& .react-calendar__navigation button:enabled:hover, & .react-calendar__navigation button:enabled:focus': {
      backgroundColor: muiTheme.palette.action.hover,
      borderRadius: '8px',
    },
    '& .react-calendar__navigation button[disabled]': {
      backgroundColor: muiTheme.palette.action.disabledBackground,
      color: muiTheme.palette.action.disabled,
    },
    '& .react-calendar__month-view__weekdays': {
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      fontSize: '0.70em',
      color: muiTheme.palette.text.secondary,
    },
    '& .react-calendar__month-view__weekdays__weekday': {
      padding: '0.5em',
    },
    '& .react-calendar__month-view__weekdays__weekday abbr': {
      textDecoration: 'none',
    },
    '& .react-calendar__month-view__days__day--weekend': {
      color: muiTheme.palette.error.main,
    },
    '& .react-calendar__tile': {
      maxWidth: '100%',
      textAlign: 'center',
      padding: '0.5em 0.625em',
      background: 'none',
      borderRadius: '8px',
      color: muiTheme.palette.text.primary,
    },
    '& .react-calendar__tile:disabled': {
      backgroundColor: muiTheme.palette.action.disabledBackground,
      color: muiTheme.palette.action.disabled,
    },
    '& .react-calendar__tile:enabled:hover, & .react-calendar__tile:enabled:focus': {
      backgroundColor: muiTheme.palette.action.selected,
    },
    '& .react-calendar__tile--now': {
      background: muiTheme.palette.info.light,
      borderRadius: '10px',
      color: muiTheme.palette.info.dark,
      fontWeight: 'bold',
      border: `1px solid ${muiTheme.palette.info.main}`,
    },
    '& .react-calendar__tile--now:enabled:hover, & .react-calendar__tile--now:enabled:focus': {
      background: muiTheme.palette.info.main,
      color: muiTheme.palette.info.contrastText,
    },
    '& .react-calendar__tile--hasActive': {
      background: muiTheme.palette.success.light,
      color: muiTheme.palette.success.dark,
    },
    '& .react-calendar__tile--hasActive:enabled:hover, & .react-calendar__tile--hasActive:enabled:focus': {
      background: muiTheme.palette.success.main,
      color: muiTheme.palette.success.contrastText,
    },
    '& .react-calendar__tile--active': {
      background: muiTheme.palette.primary.main,
      color: muiTheme.palette.primary.contrastText,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    '& .react-calendar__tile--active:enabled:hover, & .react-calendar__tile--active:enabled:focus': {
      background: muiTheme.palette.primary.dark,
    },
    '& .react-calendar--selectRange .react-calendar__tile--hover': {
      backgroundColor: muiTheme.palette.action.hover,
    },
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4,
          backgroundColor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary,
        }}
      >
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Loading dashboard...</Typography>
      </Container>
    );
  }
  if (!isAuthenticated) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4,
          backgroundColor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary,
        }}
      >
        <Alert severity="warning">Please log in to view your dashboard.</Alert>
      </Container>
    );
  }
  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4,
          backgroundColor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  return (
    <Box sx={{
      p: { xs: 1, md: 2 },
      paddingTop:5,
      bgcolor: muiTheme.palette.background.default,
      minHeight: '100vh',
      color: muiTheme.palette.text.primary,
      alignContent:'space-around'
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 3, md: 4 }, fontWeight: 700, color: 'text.primary' }}>
        Travel Dashboard for {user.username}
      </Typography>
      <Grid container spacing={{ xs: 1, md: 2 }} x={{ align:"center" }}>
        {[
          { label: "Total Bookings", value: totalBookings, color: muiTheme.palette.primary.main, icon: <FlightIcon /> },
          { label: "Pending", value: pendingBookings, color: muiTheme.palette.warning.main, icon: <ScheduleIcon /> },
          { label: "Confirmed", value: confirmedBookings, color: muiTheme.palette.success.main, icon: <CheckCircleIcon /> },
          { label: "Cancelled", value: cancelledBookings, color: muiTheme.palette.error.main, icon: <CancelIcon /> }, 
          { label: "Total Booking Expenses", value: `₹${totalBookingExpense.toLocaleString('en-IN')}`, color: muiTheme.palette.info.dark, icon: <AttachMoneyIcon /> },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={2} key={stat.label}> 
            <Paper
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                boxShadow: 3,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
                height: '100%',
              }}
            >
              <Avatar sx={{ bgcolor: stat.color, color: muiTheme.palette.common.white, width: 48, height: 48 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1rem', md: '1.25rem' } }}>{stat.value}</Typography> 
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3,width:{xs:'50vh',sm:'90vh',md:'90vh'}, height: '44vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Monthly Booking Expenses</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, '& canvas': { width: '100% !important', height: '95% !important' } }}>
              <Line data={bookingExpenseChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
           <Grid item xs={12} md={5}>
           <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: 3, width:'40vh', height: {xs:'90%',md:'94%'}, display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
             <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>Calendar</Typography>
             <Box sx={{
               display: 'flex',
               justifyContent: 'center',
               width: '100%', 
               height: 'auto', 
               '& .react-calendar': { border: 'none', borderRadius: muiTheme.shape.borderRadius, width: '100%' },
               ...calendarDynamicStyles 
             }}>
               <Calendar value={date} onChange={setDate} className="react-calendar" />
             </Box>
           </Paper>
         </Grid>        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, width:'50vh', height: '50vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Booking Summary</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, '& canvas': { width: '100% !important', height: '100% !important' } }}>
              <Bar data={bookingSummaryChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, width:'50vh', height: '50vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Monthly Other Expenses</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, '& canvas': { width: '100% !important', height: '100% !important' } }}>
              <Line data={expenseChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, height: "100%", display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Upcoming Bookings</Typography>
            <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
              

{upcomingBookings.length > 0 ? (
  upcomingBookings.map(trip => ( 
    <Paper
      key={trip.id}
      sx={{
        p: 2,
        mb: 2,
        width:{sm:'80vh',md:'35vh'},
        borderRadius: 2,
        borderLeft: `5px solid ${trip.status === 'pending' ? muiTheme.palette.warning.main : muiTheme.palette.success.main}`,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        boxShadow: 1,
        '&:last-child': { mb: 0 },
      }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}>{trip.route || packagesMap[trip.packageId]?.title || 'Unknown Trip'}</Typography>
        <Typography variant="body2" color="text.secondary">Date: {trip.date}</Typography>
        {trip.travelers && <Typography variant="body2" color="text.secondary">Travelers: {trip.travelers}</Typography>}
      </Box>
      <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, mt: { xs: 1, sm: 0 } }}>
        <Typography variant="body1" fontWeight="bold" color="primary.main">₹{trip.amount?.toLocaleString('en-IN') || 'N/A'}</Typography>
        <Typography
          variant="caption"
          sx={{
            bgcolor: trip.status === 'pending' ? 'warning.light' : 'success.light',
            color: trip.status === 'pending' ? 'warning.dark' : 'success.dark',
            px: 1, py: 0.5, borderRadius: 1, textTransform: 'capitalize', fontWeight: 'bold',
          }}
        >
          {trip.status}
        </Typography>
        {trip.packageId && ( 
          <Button
            component={Link}
            to={`/packages/${trip.packageId}`} 
            variant="contained"
            size="small"
            sx={{ mt: 1, ml: { sm: 1 }, borderRadius: 8 }}
          >
            View Details
          </Button>
        )}
      </Box>
    </Paper>
  ))
) : (
  <Typography variant="body2" color="text.secondary">No upcoming bookings found.</Typography>
)}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 },flexDirection:"row", borderRadius: 3, boxShadow: 3,width:{xs:'50vh', md:'105vh'}, flex:1,height: {xs:'60vh',md:'50vh'},overflowX: "auto",overflowY: "auto"}}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Recommended Packages</Typography>
            <Grid container spacing={3} sx={{overflowX: "auto"}}>
              {Object.values(packagesMap).length > 0 ? (
                Object.values(packagesMap).slice(0, 4).map((pkg) => (
                  <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                    <Paper sx={{
                      p: 2, borderRadius: 2, height: "100%", display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', boxShadow: 1, transition: 'transform 0.2s ease-in-out',
                      overflowX: "auto",overflowY: "auto",
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 },
                    }}>
                      <Box sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}>
  <img
    src={pkg.imageUrl}
    alt={pkg.title}
    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
  />
</Box>

                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>{pkg.title}</Typography>
                        <Typography color="success.main" variant="h6" sx={{ mt: 1 }}>₹{pkg.price?.toLocaleString('en-IN') || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          href={`/packages/${pkg.id}`}
                          fullWidth
                          sx={{ borderRadius: 8, fontSize: '0.85rem' }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">No recommended packages available.</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
<Grid item xs={12}>
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, height: "100%", display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>My Trips</Typography>
    <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
      {myRecentTrips.length > 0 ? ( 
        myRecentTrips.map(trip => ( 
          <Paper
            key={trip.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              borderLeft: `5px solid ${muiTheme.palette.info.main}`, 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              boxShadow: 1,
              '&:last-child': { mb: 0 },
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}>{trip.name || 'Untitled Trip'}</Typography> 
              <Typography variant="body2" color="text.secondary">Date: {trip.date}</Typography>
              {trip.destination && <Typography variant="body2" color="text.secondary">Destination: {trip.destination}</Typography>}
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, mt: { xs: 1, sm: 0 } }}>
              <Typography variant="body1" fontWeight="bold" color="primary.main">₹{trip.price?.toLocaleString('en-IN') || 'N/A'}</Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: muiTheme.palette.info.light,
                  color: muiTheme.palette.info.dark,
                  px: 1, py: 0.5, borderRadius: 1, textTransform: 'capitalize', fontWeight: 'bold',
                }}
              >
                {trip.status}
              </Typography>
              {/* <Button
                component={Link} 
                to={`/plan/${trip.id}`} 
                variant="contained"
                size="small"
                sx={{ mt: 1, ml: { sm: 1 }, borderRadius: 8 }}
              >
                Show Details
              </Button> */}
            </Box>
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">No custom trips found. Start planning a new trip!</Typography>
      )}
    </Box>
  </Paper>
</Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3,width:{xs:'50vh',sm:'90vh',md:'70vh',lg:'70rem'}, flex:1,height: '50vh' }}>
  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>
    All Bookings
  </Typography>

<TableContainer sx={{ overflowX: "auto", overflowY: "auto", maxHeight: "40vh" }}>
  <Table>
    <TableHead sx={{ bgcolor: muiTheme.palette.primary.light }}>
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.contrastText }}>Title</TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.contrastText }}>Date</TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.contrastText }}>Amount</TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.contrastText }}>Status</TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.contrastText }}>Actions</TableCell> 
      </TableRow>
    </TableHead>
    <TableBody>
      {bookings.length > 0 ? (
        bookings.map((trip) => ( 
          <TableRow
            key={trip.id}
            sx={{
              '&:nth-of-type(odd)': { bgcolor: muiTheme.palette.action.hover },
              '&:hover': { bgcolor: muiTheme.palette.action.selected }
            }}
          >
            <TableCell>{trip.route || packagesMap[trip.packageId]?.title || 'Unknown Trip'}</TableCell>
            <TableCell>{trip.date}</TableCell>
            <TableCell>₹{trip.amount?.toLocaleString('en-IN') || 'N/A'}</TableCell>
            <TableCell>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: trip.status === 'pending'
                    ? muiTheme.palette.warning.light
                    : trip.status === 'cancelled'
                    ? muiTheme.palette.error.light
                    : muiTheme.palette.success.light,
                  color: trip.status === 'pending'
                    ? muiTheme.palette.warning.dark
                    : trip.status === 'cancelled'
                    ? muiTheme.palette.error.dark
                    : muiTheme.palette.success.dark,
                  px: 1, py: 0.5, borderRadius: 1, textTransform: 'capitalize', fontWeight: 'bold',
                }}
              >
                {trip.status}
              </Typography>
            </TableCell>
            <TableCell> 
              {trip.packageId && ( 
                <Button
                  component={Link}
                  to={`/packages/${trip.packageId}`} 
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 8 }}
                >
                  View Details
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} align="center">No bookings to display.</TableCell> {/* Updated colspan */}
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
          </Paper>

        </Grid>
      </Grid>
    </Box>
  );
}