const cron = require('node-cron');
const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');

// Function to process recurring expenses
const processRecurringExpenses = async () => {
  try {
    console.log('Running recurring expenses cron job...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find all active recurring expenses where nextDate is today
    const recurringExpenses = await RecurringExpense.find({
      isActive: true,
      nextDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });
    
    console.log(`Found ${recurringExpenses.length} recurring expenses to process`);
    
    for (const recurringExpense of recurringExpenses) {
      try {
        // Create a new expense entry
        await Expense.create({
          user: recurringExpense.user,
          title: recurringExpense.title,
          amount: recurringExpense.amount,
          category: recurringExpense.category,
          date: new Date(),
          description: `Recurring: ${recurringExpense.notes || ''}`,
        });
        
        // Calculate and update nextDate
        const nextDate = recurringExpense.calculateNextDate();
        recurringExpense.nextDate = nextDate;
        await recurringExpense.save();
        
        console.log(`Processed recurring expense: ${recurringExpense.title} - Next date: ${nextDate}`);
      } catch (error) {
        console.error(`Error processing recurring expense ${recurringExpense._id}:`, error.message);
      }
    }
    
    console.log('Recurring expenses cron job completed');
  } catch (error) {
    console.error('Error in recurring expenses cron job:', error.message);
  }
};

// Schedule cron job to run daily at midnight (00:00)
const startRecurringExpensesCron = () => {
  // Run at midnight every day
  cron.schedule('0 0 * * *', processRecurringExpenses, {
    scheduled: true,
    timezone: 'Asia/Kolkata', // Change to your timezone
  });
  
  console.log('Recurring expenses cron job scheduled (runs daily at midnight)');
  
  // Optionally run immediately on startup for testing
  // processRecurringExpenses();
};

module.exports = {
  startRecurringExpensesCron,
  processRecurringExpenses, // Export for manual testing
};
