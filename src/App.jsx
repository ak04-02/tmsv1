import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { useTheme, CustomThemeProvider } from "./contexts/Themecontext";
import { useAuth } from "./contexts/AuthContext";
import {
  Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Drawer,
  List, ListItem, ListItemIcon, ListItemText, InputBase, Button
} from "@mui/material";
import {
  Menu as MenuIcon, Brightness4, Brightness7, Search as SearchIcon,
  Dashboard, CalendarToday, AccountBox, Info, ContactPage, AddLocation, History,
  Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon,
  AdminPanelSettings as AdminPanelSettingsIcon, 
  AttachMoney as AttachMoneyIcon, AddCard
} from "@mui/icons-material";
import { styled, alpha } from '@mui/material/styles';
const Hero = lazy(() => import("./components/Hero"));
const Features = lazy(() => import("./components/Features"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const Packages = lazy(() => import("./pages/Packages"));
const PackageDetail = lazy(() => import("./pages/PackageDetail"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingHistory = lazy(() => import("./pages/BookingHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PlanTrip = lazy(() => import("./pages/Plan"));
const Footer = lazy(() => import("./components/Footer"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ExpenseList = lazy(() => import("./pages/ExpenseList")); 
const ExpenseForm = lazy(() => import("./pages/ExpenseForm")); 
const drawerWidth = 240;
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));
function AppContent() {
  const { toggleColorMode, mode } = useTheme();
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]); 
  const mainNavLinks = [
    { to: "/dashboard", icon: <Dashboard />, label: "Dashboard", protected: true, userOnly: true }, 
    { to: "/packages", icon: <CalendarToday />, label: "Packages", protected: true },
    { to: "/plan", icon: <AddLocation />, label: "Plan", protected: true },
    { to: "/booking-history", icon: <History />, label: "History", protected: true },
    { to: "/profile", icon: <AccountBox />, label: "Profile", protected: true },
    { to: "/expenses/new", icon: <AddCard/>, label: "Add New Expense", protected: true },
    { to: "/expenses", icon: <AttachMoneyIcon />, label: "Expenses", protected: true },
    { to: "/admin-dashboard", icon: <AdminPanelSettingsIcon />, label: "Admin Panel", protected: true, adminOnly: true },
    { to: "/about", icon: <Info />, label: "About" },
    { to: "/contact", icon: <ContactPage />, label: "Contact" },
  ];
  const drawerContent = (
    <Box sx={{ overflowX: 'hidden' }}>
      <Toolbar />
      <List>
        {mainNavLinks
          .filter(link => {
            if (!link.protected) {
              return true;
            }
            if (!isAuthenticated) {
              return false;
            }
            if (link.adminOnly) {
              return isAdmin;
            }
            if (link.userOnly) {
              return !isAdmin;
            }
            return true;
          })
          .map(({ to, icon, label }) => (
            <ListItem
              button
              key={to}
              component={NavLink}
              to={to}
              onClick={handleDrawerToggle}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&.hover':{
                  color: (theme) => theme.palette.primary.main, 
                  bgcolor: (theme) => 'white', 
                },
                '&.active': {
                  color: (theme) => theme.palette.primary.main, 
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), 
                  '& .MuiListItemIcon-root': {
                    color: (theme) => theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        {isAuthenticated && (
          <ListItem
            button
            onClick={logout}
            sx={{ mt: 2 }}
          >
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
        {!isAuthenticated && (
          <>
            <ListItem
              button
              component={NavLink}
              to="/login"
              onClick={handleDrawerToggle}
              sx={{ textDecoration: 'none', mt: 2 }}
            >
              <ListItemIcon><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              button
              component={NavLink}
              to="/signup"
              onClick={handleDrawerToggle}
              sx={{ textDecoration: 'none' }}
            >
              <ListItemIcon><PersonAddIcon /></ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  return (
    <Box sx={{ display: 'flex',background:(theme)=>theme.palette.appBar.main }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background:(theme) => mode=="light"?theme.palette.primary.main:'rgb(53, 51, 51)', color:'white'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component={NavLink} to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            Travel Management System
          </Typography>
          <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {!isAuthenticated ? (
              <>
                <Button color="inherit" component={NavLink} to="/login" sx={{ mx: 1 }}>
                  Login
                </Button>
                <Button variant="contained" color="primary" component={NavLink} to="/signup" sx={{ mx: 1 }}>
                  Sign Up
                </Button>
              </>
            ) : (
              isAdmin ? (
                <Button color="inherit" component={NavLink} to="/admin-dashboard" sx={{ mx: 1 }}>
                  Admin Panel
                </Button>
              ) : (
                <Button color="inherit" component={NavLink} to="/dashboard" sx={{ mx: 1 }}>
                  Dashboard
                </Button>
              )
            )}
            {isAuthenticated && (
              <Button color="inherit" onClick={logout} sx={{ mx: 1 }}>
                Logout
              </Button>
            )}
          </Box>
          <IconButton color="inherit" onClick={toggleColorMode} sx={{ ml: 1 }}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          background:(theme)=>theme.palette.sidebar.main,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
          display: { xs: 'none', md: 'block' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
          },
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 0, md: 0 },
          background:(theme)=>theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            width: '100%',
            maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '100%', xl: 1200 },
            pb: 4,
          }}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<div style={{flexDirection:"column"}}><Hero /><Features /></div>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/booking-history" element={<BookingHistory />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/plan" element={<PlanTrip />} />
                <Route path="/expenses" element={<><ExpenseList /></>} />
                <Route path="/expenses/new" element={<><ExpenseForm /></>} />
                <Route path="/expenses/edit/:id" element={<><ExpenseForm /></>} />
              </Route>
              <Route element={<ProtectedRoute isAdminOnly={true} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<p>404 - Page Not Found</p>} />
            </Routes>
          </Suspense>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
export default function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}