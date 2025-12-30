import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { IncomeProvider } from './context/IncomeContext';
import { RecurringExpenseProvider } from './context/RecurringExpenseContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecurringExpenses from './pages/RecurringExpenses';
import AdvisorChat from './pages/AdvisorChat';
import Calculators from './pages/Calculators';
import SIPTracker from './pages/SIPTracker';
import Reminders from './pages/Reminders';
import StockAnalyzer from './pages/StockAnalyzer';
import Portfolio from './pages/Portfolio';

import './i18n/i18n'; // Initialize i18n

// ------------------ Layout Component ------------------
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">{children}</main>
      </div>
    </div>
  );
};

// ------------------ Route Guards ------------------
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

// ------------------ App Routes ------------------
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Private Routes wrapped in Layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/recurring-expenses"
        element={
          <PrivateRoute>
            <Layout>
              <RecurringExpenses />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <PrivateRoute>
            <Layout>
              <AdvisorChat />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/calculators"
        element={
          <PrivateRoute>
            <Layout>
              <Calculators />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/sip-tracker"
        element={
          <PrivateRoute>
            <Layout>
              <SIPTracker />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <PrivateRoute>
            <Layout>
              <Reminders />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <PrivateRoute>
            <Layout>
              <StockAnalyzer />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/portfolio"
        element={
          <PrivateRoute>
            <Layout>
              <Portfolio />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

// ------------------ App Component ------------------
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ExpenseProvider>
            <IncomeProvider>
              <RecurringExpenseProvider>
                <AppRoutes />
              </RecurringExpenseProvider>
            </IncomeProvider>
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;