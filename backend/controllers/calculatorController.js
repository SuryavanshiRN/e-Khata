const CalculatorResult = require('../models/CalculatorResult');

exports.calculateSIP = async (req, res) => {
  try {
    const { monthly, rate, years } = req.body;
    
    if (!monthly || !rate || !years) {
      return res.status(400).json({ success: false, message: 'Please provide monthly, rate, and years' });
    }
    
    const monthlyInvestment = parseFloat(monthly);
    const annualRate = parseFloat(rate);
    const totalYears = parseFloat(years);
    const totalMonths = totalYears * 12;
    const monthlyRate = annualRate / 12 / 100;
    
    let futureValue;
    if (monthlyRate === 0) {
      futureValue = monthlyInvestment * totalMonths;
    } else {
      futureValue = monthlyInvestment * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    }
    
    const totalInvested = monthlyInvestment * totalMonths;
    const totalReturns = futureValue - totalInvested;
    const cagr = totalYears > 0 ? (Math.pow(futureValue / totalInvested, 1 / totalYears) - 1) * 100 : 0;
    
    const monthlyBreakdown = [];
    for (let year = 1; year <= totalYears; year++) {
      const months = year * 12;
      let yearlyFV;
      if (monthlyRate === 0) {
        yearlyFV = monthlyInvestment * months;
      } else {
        yearlyFV = monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
      }
      const yearlyInvested = monthlyInvestment * months;
      const yearlyReturns = yearlyFV - yearlyInvested;
      
      monthlyBreakdown.push({
        year,
        invested: Math.round(yearlyInvested),
        futureValue: Math.round(yearlyFV),
        returns: Math.round(yearlyReturns)
      });
    }
    
    const result = {
      type: 'SIP',
      monthlyInvestment,
      annualRate,
      years: totalYears,
      months: totalMonths,
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns),
      cagr: parseFloat(cagr.toFixed(2)),
      monthlyBreakdown
    };
    
    if (req.user) {
      const calculatorResult = new CalculatorResult({
        user: req.user.id,
        type: 'SIP',
        monthlyInvestment,
        annualRate,
        years: totalYears,
        months: totalMonths,
        futureValue: Math.round(futureValue),
        totalInvested: Math.round(totalInvested),
        cagr: parseFloat(cagr.toFixed(2))
      });
      await calculatorResult.save();
      result.saved = true;
      result.resultId = calculatorResult._id;
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('SIP calculation error:', error);
    res.status(500).json({ success: false, message: 'Error calculating SIP', error: error.message });
  }
};

exports.calculateEMI = async (req, res) => {
  try {
    const { principal, rate, months } = req.body;
    
    if (!principal || !rate || !months) {
      return res.status(400).json({ success: false, message: 'Please provide principal, rate, and months' });
    }
    
    const principalAmount = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const totalMonths = parseInt(months);
    const monthlyRate = annualRate / 12 / 100;
    
    let emi;
    if (monthlyRate === 0) {
      emi = principalAmount / totalMonths;
    } else {
      emi = (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principalAmount;
    
    const amortizationSchedule = [];
    let balance = principalAmount;
    
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      
      amortizationSchedule.push({
        month,
        emi: Math.round(emi),
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment),
        balance: Math.round(Math.max(0, balance))
      });
    }
    
    const result = {
      type: 'EMI',
      totalPrincipal: principalAmount,
      annualRate,
      months: totalMonths,
      years: parseFloat((totalMonths / 12).toFixed(1)),
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      amortizationSchedule
    };
    
    if (req.user) {
      const calculatorResult = new CalculatorResult({
        user: req.user.id,
        type: 'EMI',
        principal: principalAmount,
        annualRate,
        months: totalMonths,
        emi: Math.round(emi),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest)
      });
      await calculatorResult.save();
      result.saved = true;
      result.resultId = calculatorResult._id;
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('EMI calculation error:', error);
    res.status(500).json({ success: false, message: 'Error calculating EMI', error: error.message });
  }
};

exports.getCalculatorHistory = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { user: req.user.id };
    if (type && ['SIP', 'EMI'].includes(type)) {
      query.type = type;
    }
    const history = await CalculatorResult.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Get calculator history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
};

exports.deleteCalculatorResult = async (req, res) => {
  try {
    const result = await CalculatorResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    if (result.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    await result.deleteOne();
    res.json({ success: true, message: 'Result deleted' });
  } catch (error) {
    console.error('Delete calculator result error:', error);
    res.status(500).json({ success: false, message: 'Error deleting result', error: error.message });
  }
};
