import { createContext, useState, useEffect, useContext } from 'react';
import * as recurringExpenseAPI from '../api/recurringExpenses';
import { AuthContext } from './AuthContext';

export const RecurringExpenseContext = createContext();

export const RecurringExpenseProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecurringExpenses();
    }
  }, [user]);

  const fetchRecurringExpenses = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await recurringExpenseAPI.getRecurringExpenses(filters);
      setRecurringExpenses(data || []);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecurringExpense = async (data) => {
    try {
      const newRecurring = await recurringExpenseAPI.createRecurringExpense(data);
      setRecurringExpenses([newRecurring, ...recurringExpenses]);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create recurring expense' 
      };
    }
  };

  const updateRecurringExpense = async (id, data) => {
    try {
      const updated = await recurringExpenseAPI.updateRecurringExpense(id, data);
      const updatedList = recurringExpenses.map(item => 
        item._id === id ? updated : item
      );
      setRecurringExpenses(updatedList);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update recurring expense' 
      };
    }
  };

  const deleteRecurringExpense = async (id) => {
    try {
      await recurringExpenseAPI.deleteRecurringExpense(id);
      const filtered = recurringExpenses.filter(item => item._id !== id);
      setRecurringExpenses(filtered);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete recurring expense' 
      };
    }
  };

  const toggleRecurringExpense = async (id) => {
    try {
      const updated = await recurringExpenseAPI.toggleRecurringExpense(id);
      const updatedList = recurringExpenses.map(item => 
        item._id === id ? updated : item
      );
      setRecurringExpenses(updatedList);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to toggle recurring expense' 
      };
    }
  };

  return (
    <RecurringExpenseContext.Provider
      value={{
        recurringExpenses,
        loading,
        fetchRecurringExpenses,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        toggleRecurringExpense,
      }}
    >
      {children}
    </RecurringExpenseContext.Provider>
  );
};
