import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Paper, Container,
  useTheme as useMuiTheme,
} from "@mui/material";
import { fetchUserExpenses, fetchExpenseById, createExpense, updateExpense } from "../api/api"; 
import { useAuth } from "../contexts/AuthContext";
export default function ExpenseForm() {
  const { expenseId } = useParams();
  const isEdit = Boolean(expenseId);
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isEdit && user?.id) {
      fetchExpenseById(expenseId) 
        .then((expenseToEdit) => {
          if (expenseToEdit && expenseToEdit.userId === user.id) { 
            setValue("category", expenseToEdit.category);
            setValue("date", expenseToEdit.date);
            setValue("amount", expenseToEdit.amount);
            setValue("description", expenseToEdit.description);
          } else {
            console.warn(`Expense with ID ${expenseId} not found or doesn't belong to user ${user.id}`);
            alert("Expense not found or you don't have permission to edit it.");
            navigate("/expenses");
          }
        })
        .catch((err) => {
          console.error("Error fetching expense for edit:", err);
          alert("Failed to load expense details for editing.");
          navigate("/expenses");
        });
    }
  }, [expenseId, isEdit, setValue, navigate, user]);
  const onSubmit = async (data) => {
    if (!user?.id) {
      alert("User not authenticated.");
      return;
    }
    try {
      const parsedAmount = parseFloat(data.amount);
      if (isNaN(parsedAmount)) {
        alert("Invalid amount entered. Please enter a valid number.");
        return;
      }
      const expenseData = {
        ...data,
        amount: parsedAmount,
        userId: user.id, 
      };
      if (isEdit) {
        await updateExpense(expenseId, expenseData); 
        alert("Expense updated successfully!");
      } else {
        await createExpense(expenseData); 
        alert("Expense added successfully!");
      }
      navigate("/expenses");
    } catch (err) {
      console.error("Failed to save expense:", err);
      alert(err.message || "Failed to save expense. Please try again.");
    }
  };
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: muiTheme.shape.borderRadius,
          bgcolor: muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
          {isEdit ? "Edit Extra Expense" : "Add New Extra Expense"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Category"
            variant="outlined"
            fullWidth
            {...register("category", { required: "Category is required" })}
            error={!!errors.category}
            helperText={errors.category?.message}
            InputLabelProps={{ style: { color: muiTheme.palette.text.secondary } }}
            inputProps={{ style: { color: muiTheme.palette.text.primary } }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.dark },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main, boxShadow: `0 0 5px ${muiTheme.palette.primary.main}` },
            }}
          />
          <TextField
            label="Date"
            type="date"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true, style: { color: muiTheme.palette.text.secondary } }}
            inputProps={{ style: { color: muiTheme.palette.text.primary } }}
            {...register("date", { required: "Date is required" })}
            error={!!errors.date}
            helperText={errors.date?.message}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.dark },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main, boxShadow: `0 0 5px ${muiTheme.palette.primary.main}` },
            }}
          />
          <TextField
            label="Amount"
            type="number"
            step="0.01"
            variant="outlined"
            fullWidth
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be positive" },
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
            InputLabelProps={{ style: { color: muiTheme.palette.text.secondary } }}
            inputProps={{ style: { color: muiTheme.palette.text.primary } }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.dark },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main, boxShadow: `0 0 5px ${muiTheme.palette.primary.main}` },
            }}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            {...register("description", {
              required: "Description is required",
              minLength: { value: 6, message: "Description must be at least 6 characters" },
            })}
            error={!!errors.description}
            helperText={errors.description?.message}
            InputLabelProps={{ style: { color: muiTheme.palette.text.secondary } }}
            inputProps={{ style: { color: muiTheme.palette.text.primary } }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.dark },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: muiTheme.palette.primary.main, boxShadow: `0 0 5px ${muiTheme.palette.primary.main}` },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 600 }}
          >
            {isEdit ? "Update Expense" : "Add Expense"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/expenses")}
            sx={{ mt: 1, py: 1.5, borderRadius: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}