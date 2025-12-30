const PDFDocument = require('pdfkit');
const { format } = require('fast-csv');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// @desc    Export transactions as PDF
// @route   GET /api/export/pdf
// @access  Private
const exportPDF = async (req, res) => {
  try {
    const { month, year, category, type = 'both' } = req.query;
    
    // Build filters
    let filter = { user: req.user._id };
    
    if (category) {
      filter.category = category;
    }
    
    // Date filter for specific month/year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    // Fetch data
    let expenses = [];
    let incomes = [];
    
    if (type === 'both' || type === 'expenses') {
      expenses = await Expense.find(filter).sort({ date: -1 });
    }
    
    if (type === 'both' || type === 'income') {
      const incomeFilter = { ...filter };
      if (incomeFilter.category) {
        incomeFilter.source = incomeFilter.category;
        delete incomeFilter.category;
      }
      incomes = await Income.find(incomeFilter).sort({ date: -1 });
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add header
    doc.fontSize(20).text('Expense Manager - Transaction Report', { align: 'center' });
    doc.moveDown();
    
    // Add metadata
    doc.fontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.text(`User: ${req.user.name}`, { align: 'right' });
    
    if (month && year) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
      doc.text(`Period: ${monthNames[month - 1]} ${year}`, { align: 'right' });
    }
    
    if (category) {
      doc.text(`Category: ${category}`, { align: 'right' });
    }
    
    doc.moveDown(2);
    
    // Add Expenses Section
    if (expenses.length > 0) {
      doc.fontSize(16).fillColor('#DC2626').text('Expenses', { underline: true });
      doc.moveDown();
      
      let totalExpenses = 0;
      
      expenses.forEach((expense, index) => {
        doc.fontSize(10).fillColor('#000000');
        
        const y = doc.y;
        
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
        }
        
        // Date
        doc.text(new Date(expense.date).toLocaleDateString(), 50, doc.y);
        
        // Title and Category
        doc.text(`${expense.title}`, 150, y);
        doc.fontSize(8).fillColor('#666666');
        doc.text(`[${expense.category}]`, 150, doc.y);
        
        // Tags
        if (expense.tags && expense.tags.length > 0) {
          doc.text(`Tags: ${expense.tags.join(', ')}`, 150, doc.y);
        }
        
        // Amount
        doc.fontSize(10).fillColor('#DC2626');
        doc.text(`₹${expense.amount.toFixed(2)}`, 450, y, { align: 'right', width: 100 });
        
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        // Description
        if (expense.description) {
          doc.fontSize(9).fillColor('#666666');
          doc.text(expense.description, 150, doc.y, { width: 350 });
          doc.moveDown(0.5);
        }
        
        // Divider
        doc.strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        
        totalExpenses += expense.amount;
      });
      
      doc.moveDown();
      doc.fontSize(12).fillColor('#DC2626');
      doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);
    }
    
    // Add Income Section
    if (incomes.length > 0) {
      doc.fontSize(16).fillColor('#16A34A').text('Income', { underline: true });
      doc.moveDown();
      
      let totalIncome = 0;
      
      incomes.forEach((income, index) => {
        doc.fontSize(10).fillColor('#000000');
        
        const y = doc.y;
        
        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
        }
        
        // Date
        doc.text(new Date(income.date).toLocaleDateString(), 50, doc.y);
        
        // Title and Source
        doc.text(`${income.title}`, 150, y);
        doc.fontSize(8).fillColor('#666666');
        doc.text(`[${income.source}]`, 150, doc.y);
        
        // Amount
        doc.fontSize(10).fillColor('#16A34A');
        doc.text(`₹${income.amount.toFixed(2)}`, 450, y, { align: 'right', width: 100 });
        
        doc.fillColor('#000000');
        doc.moveDown(0.5);
        
        // Description
        if (income.description) {
          doc.fontSize(9).fillColor('#666666');
          doc.text(income.description, 150, doc.y, { width: 350 });
          doc.moveDown(0.5);
        }
        
        // Divider
        doc.strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        
        totalIncome += income.amount;
      });
      
      doc.moveDown();
      doc.fontSize(12).fillColor('#16A34A');
      doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);
    }
    
    // Summary
    if (expenses.length > 0 || incomes.length > 0) {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
      const netBalance = totalIncome - totalExpenses;
      
      doc.addPage();
      doc.fontSize(18).fillColor('#000000').text('Summary', { align: 'center', underline: true });
      doc.moveDown(2);
      
      doc.fontSize(14);
      doc.fillColor('#16A34A').text(`Total Income: ₹${totalIncome.toFixed(2)}`);
      doc.fillColor('#DC2626').text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`);
      doc.moveDown();
      
      doc.fillColor(netBalance >= 0 ? '#16A34A' : '#DC2626');
      doc.fontSize(16).text(`Net Balance: ₹${netBalance.toFixed(2)}`);
    }
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res) => {
  try {
    const { month, year, category, type = 'both' } = req.query;
    
    // Build filters
    let filter = { user: req.user._id };
    
    if (category) {
      filter.category = category;
    }
    
    // Date filter for specific month/year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    // Fetch data
    let expenses = [];
    let incomes = [];
    
    if (type === 'both' || type === 'expenses') {
      expenses = await Expense.find(filter).sort({ date: -1 });
    }
    
    if (type === 'both' || type === 'income') {
      const incomeFilter = { ...filter };
      if (incomeFilter.category) {
        incomeFilter.source = incomeFilter.category;
        delete incomeFilter.category;
      }
      incomes = await Income.find(incomeFilter).sort({ date: -1 });
    }
    
    // Prepare CSV data
    const csvData = [];
    
    // Add header
    csvData.push(['Type', 'Date', 'Title', 'Category/Source', 'Amount', 'Tags', 'Description']);
    
    // Add expenses
    expenses.forEach(expense => {
      csvData.push([
        'Expense',
        new Date(expense.date).toLocaleDateString(),
        expense.title,
        expense.category,
        expense.amount,
        expense.tags ? expense.tags.join('; ') : '',
        expense.description || ''
      ]);
    });
    
    // Add incomes
    incomes.forEach(income => {
      csvData.push([
        'Income',
        new Date(income.date).toLocaleDateString(),
        income.title,
        income.source,
        income.amount,
        '',
        income.description || ''
      ]);
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    
    // Create CSV stream
    const csvStream = format({ headers: false });
    csvStream.pipe(res);
    
    // Write data
    csvData.forEach(row => {
      csvStream.write(row);
    });
    
    csvStream.end();
    
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportPDF,
  exportCSV,
};
