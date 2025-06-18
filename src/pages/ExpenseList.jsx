import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Button, Box,
  CircularProgress, Alert, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Divider,
  useTheme as useMuiTheme,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { fetchUserExpenses, deleteExpense } from "../api/api"; 
import { useAuth } from "../contexts/AuthContext";
export default function ExpenseList() {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadExpenses = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      setError("Please log in to view your expenses.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserExpenses(user.id); 
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]); 
  useEffect(() => {
    loadExpenses(); 
  }, [loadExpenses]); 
  const handleDelete = async (expenseId) => {
    if (!user?.id) return;
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expenseId); 
        alert("Expense deleted successfully!");
        loadExpenses(); 
      } catch (err) {
        console.error("Failed to delete expense:", err);
        alert(err.message || "Failed to delete expense. Please try again.");
      }
    }
  };
  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4,
          bgcolor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary,
        }}
      >
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">Loading expenses...</Typography>
      </Container>
    );
  }
  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4,
          bgcolor: muiTheme.palette.background.default, color: muiTheme.palette.text.primary,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: muiTheme.shape.borderRadius,
          bgcolor: muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 700 }}>
          My Extra Expenses
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          <Box component="strong" sx={{ color: muiTheme.palette.primary.main }}>Total:</Box> ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/expenses/new")}
          sx={{ mb: 3, py: 1.5, px: 3, borderRadius: 2, fontWeight: 600 }}
        >
          Add New Expense
        </Button>
        {expenses.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 3, color: muiTheme.palette.text.secondary }}>
            No extra expenses recorded yet.
          </Typography>
        ) : (
          <List sx={{ mt: 3 }}>
            {expenses.map(({ id, date, category, amount, description }) => (
              <React.Fragment key={id}>
                <ListItem
                  sx={{
                    bgcolor: muiTheme.palette.background.default,
                    borderRadius: 2,
                    mb: 1.5,
                    boxShadow: muiTheme.shadows[1],
                    p: { xs: 1.5, md: 2 },
                    alignItems: 'flex-start',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                        {category} - {new Date(date).toLocaleDateString('en-IN')} - ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {description}
                      </Typography>
                    }
                    sx={{ flexGrow: 1, mb: { xs: 1, sm: 0 } }}
                  />
                  <ListItemSecondaryAction sx={{ mt: { xs: 1, sm: 0 } }}>
                    {/* <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => navigate(`/expenses/edit/${id}`)}
                      color="info"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton> */}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/dashboard')}
            sx={{ py: 1, px: 2, borderRadius: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}