const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { startRecurringExpensesCron } = require('./services/cronService');
const reminderScheduler = require('./services/reminderScheduler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Start cron jobs
startRecurringExpensesCron();
reminderScheduler.startAll();

const app = express();
const server = http.createServer(app);

// 🔥 Socket.IO for real-time updates
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // frontend URL
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes/controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring-expenses', require('./routes/recurringExpenseRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/insights', require('./routes/insightsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use("/api/ocr", require("./routes/ocrRoutes"));
app.use('/api/calculators', require('./routes/calculatorRoutes'));
app.use('/api/sips', require('./routes/sipRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));

// ⭐ STOCK & PORTFOLIO ROUTES
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/portfolios', require('./routes/portfolioRoutes'));

// Socket connection
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Expense Manager API (Real-time Enabled)' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
