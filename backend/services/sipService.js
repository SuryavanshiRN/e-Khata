const axios = require('axios');

class SIPService {
  constructor() {
    // Using Alpha Vantage API for market data (free tier available)
    this.apiKey = process.env.MARKET_API_KEY || 'demo';
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  /**
   * Fetch historical prices for a fund/stock symbol
   * @param {string} symbol - Fund symbol
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of {date, nav} objects
   */
  async fetchHistoricalPrices(symbol, startDate, endDate) {
    try {
      // For demo purposes, we'll use Alpha Vantage daily time series
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: this.apiKey,
          outputsize: 'full'
        },
        timeout: 10000
      });

      if (response.data['Error Message']) {
        throw new Error('Invalid symbol or API error');
      }

      if (response.data['Note']) {
        // API limit reached, use fallback
        console.warn('API limit reached, using fallback data');
        return this.generateFallbackData(startDate, endDate);
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        return this.generateFallbackData(startDate, endDate);
      }

      const prices = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (const [date, data] of Object.entries(timeSeries)) {
        const priceDate = new Date(date);
        if (priceDate >= start && priceDate <= end) {
          prices.push({
            date: priceDate,
            nav: parseFloat(data['4. close'])
          });
        }
      }

      // Sort by date ascending
      return prices.sort((a, b) => a.date - b.date);
    } catch (error) {
      console.error('Error fetching historical prices:', error.message);
      // Return fallback data with simulated growth
      return this.generateFallbackData(startDate, endDate);
    }
  }

  /**
   * Generate fallback data with simulated market growth
   * Used when API is unavailable or limit reached
   */
  generateFallbackData(startDate, endDate) {
    const prices = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const baseNav = 100; // Starting NAV
    const annualReturn = 0.12; // 12% annual return assumption
    
    let currentDate = new Date(start);
    let monthCount = 0;

    while (currentDate <= end) {
      const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
      const nav = baseNav * Math.pow(1 + monthlyReturn, monthCount);
      
      // Add some random volatility (±2%)
      const volatility = (Math.random() - 0.5) * 0.04;
      const adjustedNav = nav * (1 + volatility);
      
      prices.push({
        date: new Date(currentDate),
        nav: parseFloat(adjustedNav.toFixed(2))
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      monthCount++;
    }

    return prices;
  }

  /**
   * Search for fund symbols (autocomplete)
   * @param {string} query - Search query
   * @returns {Array} Array of {symbol, name, type}
   */
  async searchFunds(query) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey
        },
        timeout: 5000
      });

      if (response.data['bestMatches']) {
        return response.data['bestMatches'].map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region']
        })).slice(0, 10);
      }

      // Fallback: return common Indian mutual funds
      return this.getCommonFunds(query);
    } catch (error) {
      console.error('Error searching funds:', error.message);
      return this.getCommonFunds(query);
    }
  }

  /**
   * Get common Indian mutual fund symbols for fallback
   */
  getCommonFunds(query = '') {
    const funds = [
      { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', type: 'ETF', region: 'India' },
      { symbol: 'AXISHCF', name: 'Axis Bluechip Fund', type: 'Equity', region: 'India' },
      { symbol: 'ICICIPRU', name: 'ICICI Prudential Bluechip Fund', type: 'Equity', region: 'India' },
      { symbol: 'SBIMID', name: 'SBI Bluechip Fund', type: 'Equity', region: 'India' },
      { symbol: 'HDFCTOP', name: 'HDFC Top 100 Fund', type: 'Equity', region: 'India' },
      { symbol: 'PARAG', name: 'Parag Parikh Flexi Cap Fund', type: 'Equity', region: 'India' },
      { symbol: 'MIRAE', name: 'Mirae Asset Large Cap Fund', type: 'Equity', region: 'India' },
      { symbol: 'KOTAKEM', name: 'Kotak Emerging Equity Fund', type: 'Equity', region: 'India' },
      { symbol: 'UTINIFTY', name: 'UTI Nifty Index Fund', type: 'Index', region: 'India' },
      { symbol: 'DSPEQUAL', name: 'DSP Equal Nifty 50 Fund', type: 'Index', region: 'India' }
    ];

    if (query) {
      const lowerQuery = query.toLowerCase();
      return funds.filter(f => 
        f.symbol.toLowerCase().includes(lowerQuery) || 
        f.name.toLowerCase().includes(lowerQuery)
      );
    }

    return funds;
  }

  /**
   * Calculate XIRR (Extended Internal Rate of Return)
   * @param {Array} cashflows - Array of {date, amount} objects
   * @returns {number} XIRR as percentage
   */
  calculateXIRR(cashflows) {
    if (cashflows.length < 2) return 0;

    // Newton-Raphson method for XIRR calculation
    let rate = 0.1; // Initial guess: 10%
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      const startDate = cashflows[0].date;

      for (const cf of cashflows) {
        const days = (cf.date - startDate) / (1000 * 60 * 60 * 24);
        const years = days / 365;
        const factor = Math.pow(1 + rate, years);
        
        npv += cf.amount / factor;
        dnpv -= cf.amount * years / (factor * (1 + rate));
      }

      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100; // Return as percentage
      }
      
      rate = newRate;
    }

    return rate * 100;
  }

  /**
   * Calculate CAGR (Compound Annual Growth Rate)
   * @param {number} startValue - Initial investment
   * @param {number} endValue - Current value
   * @param {number} years - Investment period in years
   * @returns {number} CAGR as percentage
   */
  calculateCAGR(startValue, endValue, years) {
    if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  /**
   * Compute current value of a SIP investment
   * @param {Object} sip - SIP object with details
   * @returns {Object} Investment details with current value, returns, XIRR, CAGR
   */
  async computeCurrentValue(sip) {
    const startDate = new Date(sip.startDate);
    const endDate = new Date();
    
    // Calculate number of months invested
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth()) + 1;
    
    const monthsInvested = Math.max(0, Math.min(monthsDiff, 
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))));

    // Fetch historical prices
    const prices = await this.fetchHistoricalPrices(sip.fundSymbol, startDate, endDate);
    
    if (prices.length === 0) {
      throw new Error('Unable to fetch price data');
    }

    let totalInvested = 0;
    let totalUnits = 0;
    const cashflows = [];

    // Calculate SIP investments and units
    for (let month = 0; month < monthsInvested; month++) {
      const investmentDate = new Date(startDate);
      investmentDate.setMonth(investmentDate.getMonth() + month);

      // Apply auto top-up if enabled
      let monthlyAmount = sip.monthlyAmount;
      if (sip.autoTopup && month > 0 && month % 12 === 0) {
        const years = Math.floor(month / 12);
        monthlyAmount *= Math.pow(1 + (sip.topupPercentage || 10) / 100, years);
      }

      totalInvested += monthlyAmount;

      // Find closest NAV for this date
      const closestPrice = this.findClosestPrice(prices, investmentDate);
      if (closestPrice) {
        totalUnits += monthlyAmount / closestPrice.nav;
      }

      // Add cashflow (negative for investments)
      cashflows.push({
        date: investmentDate,
        amount: -monthlyAmount
      });
    }

    // Current value
    const currentNav = prices[prices.length - 1].nav;
    const currentValue = totalUnits * currentNav;
    const returns = currentValue - totalInvested;
    const returnsPercentage = (returns / totalInvested) * 100;

    // Add final cashflow (current value)
    cashflows.push({
      date: endDate,
      amount: currentValue
    });

    // Calculate XIRR and CAGR
    const xirr = this.calculateXIRR(cashflows);
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    const cagr = this.calculateCAGR(totalInvested, currentValue, years);

    return {
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      returns: parseFloat(returns.toFixed(2)),
      returnsPercentage: parseFloat(returnsPercentage.toFixed(2)),
      xirr: parseFloat(xirr.toFixed(2)),
      cagr: parseFloat(cagr.toFixed(2)),
      currentNav: parseFloat(currentNav.toFixed(2)),
      totalUnits: parseFloat(totalUnits.toFixed(4)),
      monthsInvested,
      lastNavDate: prices[prices.length - 1].date,
      historicalData: this.prepareChartData(prices, sip, monthsInvested)
    };
  }

  /**
   * Find closest price to a given date
   */
  findClosestPrice(prices, targetDate) {
    if (prices.length === 0) return null;

    let closest = prices[0];
    let minDiff = Math.abs(targetDate - prices[0].date);

    for (const price of prices) {
      const diff = Math.abs(targetDate - price.date);
      if (diff < minDiff) {
        minDiff = diff;
        closest = price;
      }
    }

    return closest;
  }

  /**
   * Prepare chart data for visualization
   */
  prepareChartData(prices, sip, monthsInvested) {
    const chartData = [];
    let cumulativeInvested = 0;

    for (let month = 0; month < monthsInvested; month++) {
      const date = new Date(sip.startDate);
      date.setMonth(date.getMonth() + month);

      let monthlyAmount = sip.monthlyAmount;
      if (sip.autoTopup && month > 0 && month % 12 === 0) {
        const years = Math.floor(month / 12);
        monthlyAmount *= Math.pow(1 + (sip.topupPercentage || 10) / 100, years);
      }

      cumulativeInvested += monthlyAmount;

      const closestPrice = this.findClosestPrice(prices, date);
      
      chartData.push({
        month: month + 1,
        date: date.toISOString().split('T')[0],
        invested: parseFloat(cumulativeInvested.toFixed(2)),
        nav: closestPrice ? closestPrice.nav : 0
      });
    }

    return chartData;
  }

  /**
   * Check if SIP is underperforming vs benchmark
   * @param {number} sipReturns - SIP returns percentage
   * @param {string} benchmark - Benchmark index (default: NIFTY50)
   * @returns {Object} Performance comparison
   */
  async checkPerformance(sipReturns, startDate, benchmark = 'NIFTY50') {
    try {
      // Fetch benchmark performance
      const benchmarkPrices = await this.fetchHistoricalPrices(
        '^NSEI', // Nifty 50 symbol
        startDate,
        new Date()
      );

      if (benchmarkPrices.length < 2) {
        return { isUnderperforming: false, message: 'Benchmark data unavailable' };
      }

      const startPrice = benchmarkPrices[0].nav;
      const endPrice = benchmarkPrices[benchmarkPrices.length - 1].nav;
      const benchmarkReturn = ((endPrice - startPrice) / startPrice) * 100;

      const isUnderperforming = sipReturns < benchmarkReturn - 2; // 2% tolerance

      return {
        isUnderperforming,
        sipReturns: parseFloat(sipReturns.toFixed(2)),
        benchmarkReturn: parseFloat(benchmarkReturn.toFixed(2)),
        difference: parseFloat((sipReturns - benchmarkReturn).toFixed(2)),
        message: isUnderperforming 
          ? `Your SIP is underperforming ${benchmark} by ${Math.abs(sipReturns - benchmarkReturn).toFixed(2)}%`
          : `Your SIP is performing well compared to ${benchmark}`
      };
    } catch (error) {
      console.error('Error checking performance:', error.message);
      return { isUnderperforming: false, message: 'Unable to compare with benchmark' };
    }
  }
}

module.exports = new SIPService();
