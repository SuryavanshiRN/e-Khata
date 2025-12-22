import { createContext, useState, useEffect } from 'react';
import * as expenseAPI from '../api/expenses';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const fetchExpenses = async (newFilters = {}) => {
    setLoading(true);
    try {
      const data = await expenseAPI.getExpenses(newFilters);
      setExpenses(data);
      setFilters(newFilters);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const newExpense = await expenseAPI.createExpense(expenseData);
      setExpenses([newExpense, ...expenses]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add expense' };
    }
  };

  const editExpense = async (id, expenseData) => {
    try {
      const updatedExpense = await expenseAPI.updateExpense(id, expenseData);
      setExpenses(expenses.map((exp) => (exp._id === id ? updatedExpense : exp)));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update expense' };
    }
  };

  const removeExpense = async (id) => {
    try {
      await expenseAPI.deleteExpense(id);
      setExpenses(expenses.filter((exp) => exp._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete expense' };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchExpenses();
    }
  }, []);

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        filters,
        totalExpenses,
        fetchExpenses,
        addExpense,
        editExpense,
        removeExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
