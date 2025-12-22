import { createContext, useState, useEffect, useContext } from 'react';
import * as incomeAPI from '../api/incomes';
import { AuthContext } from './AuthContext';

export const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user]);

  const fetchIncomes = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await incomeAPI.getIncomes(filters);
      setIncomes(data || []);
      calculateTotal(data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (incomeList) => {
    const total = incomeList.reduce((sum, income) => sum + income.amount, 0);
    setTotalIncome(total);
  };

  const addIncome = async (incomeData) => {
    try {
      const data = await incomeAPI.createIncome(incomeData);
      setIncomes([data, ...incomes]);
      calculateTotal([data, ...incomes]);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add income' 
      };
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      const data = await incomeAPI.updateIncome(id, incomeData);
      const updatedIncomes = incomes.map(income => 
        income._id === id ? data : income
      );
      setIncomes(updatedIncomes);
      calculateTotal(updatedIncomes);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update income' 
      };
    }
  };

  const deleteIncome = async (id) => {
    try {
      await incomeAPI.deleteIncome(id);
      const filteredIncomes = incomes.filter(income => income._id !== id);
      setIncomes(filteredIncomes);
      calculateTotal(filteredIncomes);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete income' 
      };
    }
  };

  const getMonthlyIncome = (month, year) => {
    return incomes
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() + 1 === month && 
               incomeDate.getFullYear() === year;
      })
      .reduce((sum, income) => sum + income.amount, 0);
  };

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        loading,
        totalIncome,
        fetchIncomes,
        addIncome,
        updateIncome,
        deleteIncome,
        getMonthlyIncome
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};
