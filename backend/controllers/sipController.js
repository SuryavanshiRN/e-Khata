const SIP = require('../models/SIP');
const sipService = require('../services/sipService');

// @desc    Create a new SIP
// @route   POST /api/sips
// @access  Private
exports.createSIP = async (req, res) => {
  try {
    const { name, fundSymbol, fundName, monthlyAmount, startDate, autoTopup, topupPercentage, notes } = req.body;

    // Validate required fields
    if (!name || !fundSymbol || !monthlyAmount || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate start date (should not be in future)
    if (new Date(startDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the future'
      });
    }

    // Create SIP
    const sip = await SIP.create({
      user: req.user.id,
      name,
      fundSymbol: fundSymbol.toUpperCase(),
      fundName,
      monthlyAmount,
      startDate,
      autoTopup: autoTopup || false,
      topupPercentage: topupPercentage || 10,
      notes
    });

    // Calculate initial values
    try {
      const valuation = await sipService.computeCurrentValue(sip);
      
      sip.currentValue = valuation.currentValue;
      sip.totalInvested = valuation.totalInvested;
      sip.returns = valuation.returns;
      sip.xirr = valuation.xirr;
      sip.cagr = valuation.cagr;
      sip.lastNav = valuation.currentNav;
      sip.lastNavDate = valuation.lastNavDate;
      sip.lastUpdated = new Date();
      
      await sip.save();
    } catch (error) {
      console.error('Error calculating initial SIP values:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'SIP created successfully',
      data: sip
    });
  } catch (error) {
    console.error('Create SIP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create SIP'
    });
  }
};

// @desc    Get all SIPs for a user with current valuations
// @route   GET /api/sips
// @access  Private
exports.getSIPs = async (req, res) => {
  try {
    const { active } = req.query;
    
    const query = { user: req.user.id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const sips = await SIP.find(query).sort({ createdAt: -1 });

    // Update valuations for all SIPs (in parallel)
    const updatedSips = await Promise.all(
      sips.map(async (sip) => {
        try {
          // Only update if last update was more than 1 hour ago
          const hoursSinceUpdate = (new Date() - new Date(sip.lastUpdated)) / (1000 * 60 * 60);
          
          if (hoursSinceUpdate > 1) {
            const valuation = await sipService.computeCurrentValue(sip);
            
            sip.currentValue = valuation.currentValue;
            sip.totalInvested = valuation.totalInvested;
            sip.returns = valuation.returns;
            sip.xirr = valuation.xirr;
            sip.cagr = valuation.cagr;
            sip.lastNav = valuation.currentNav;
            sip.lastNavDate = valuation.lastNavDate;
            sip.lastUpdated = new Date();
            
            await sip.save();

            // Check performance vs benchmark
            const performance = await sipService.checkPerformance(
              valuation.returnsPercentage,
              sip.startDate
            );

            return {
              ...sip.toObject(),
              performance
            };
          }

          return sip.toObject();
        } catch (error) {
          console.error(`Error updating SIP ${sip._id}:`, error.message);
          return sip.toObject();
        }
      })
    );

    // Calculate portfolio summary
    const summary = {
      totalSIPs: updatedSips.length,
      activeSIPs: updatedSips.filter(s => s.isActive).length,
      totalInvested: updatedSips.reduce((sum, s) => sum + (s.totalInvested || 0), 0),
      currentValue: updatedSips.reduce((sum, s) => sum + (s.currentValue || 0), 0),
      totalReturns: updatedSips.reduce((sum, s) => sum + (s.returns || 0), 0),
      averageXIRR: updatedSips.length > 0 
        ? updatedSips.reduce((sum, s) => sum + (s.xirr || 0), 0) / updatedSips.length
        : 0
    };

    summary.returnsPercentage = summary.totalInvested > 0
      ? (summary.totalReturns / summary.totalInvested) * 100
      : 0;

    res.json({
      success: true,
      count: updatedSips.length,
      summary,
      data: updatedSips
    });
  } catch (error) {
    console.error('Get SIPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SIPs'
    });
  }
};

// @desc    Get single SIP with detailed analysis
// @route   GET /api/sips/:id
// @access  Private
exports.getSIP = async (req, res) => {
  try {
    const sip = await SIP.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: 'SIP not found'
      });
    }

    // Get detailed valuation with chart data
    const valuation = await sipService.computeCurrentValue(sip);
    
    // Check performance
    const performance = await sipService.checkPerformance(
      valuation.returnsPercentage,
      sip.startDate
    );

    res.json({
      success: true,
      data: {
        ...sip.toObject(),
        valuation,
        performance
      }
    });
  } catch (error) {
    console.error('Get SIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SIP details'
    });
  }
};

// @desc    Update SIP
// @route   PUT /api/sips/:id
// @access  Private
exports.updateSIP = async (req, res) => {
  try {
    const { name, monthlyAmount, autoTopup, topupPercentage, notes, isActive } = req.body;

    const sip = await SIP.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: 'SIP not found'
      });
    }

    // Update fields
    if (name) sip.name = name;
    if (monthlyAmount) sip.monthlyAmount = monthlyAmount;
    if (autoTopup !== undefined) sip.autoTopup = autoTopup;
    if (topupPercentage) sip.topupPercentage = topupPercentage;
    if (notes !== undefined) sip.notes = notes;
    if (isActive !== undefined) sip.isActive = isActive;

    // Recalculate values if amount changed
    if (monthlyAmount || autoTopup !== undefined || topupPercentage) {
      try {
        const valuation = await sipService.computeCurrentValue(sip);
        
        sip.currentValue = valuation.currentValue;
        sip.totalInvested = valuation.totalInvested;
        sip.returns = valuation.returns;
        sip.xirr = valuation.xirr;
        sip.cagr = valuation.cagr;
        sip.lastNav = valuation.currentNav;
        sip.lastNavDate = valuation.lastNavDate;
        sip.lastUpdated = new Date();
      } catch (error) {
        console.error('Error recalculating SIP values:', error.message);
      }
    }

    await sip.save();

    res.json({
      success: true,
      message: 'SIP updated successfully',
      data: sip
    });
  } catch (error) {
    console.error('Update SIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SIP'
    });
  }
};

// @desc    Delete SIP
// @route   DELETE /api/sips/:id
// @access  Private
exports.deleteSIP = async (req, res) => {
  try {
    const sip = await SIP.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: 'SIP not found'
      });
    }

    await sip.deleteOne();

    res.json({
      success: true,
      message: 'SIP deleted successfully'
    });
  } catch (error) {
    console.error('Delete SIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SIP'
    });
  }
};

// @desc    Search for fund symbols
// @route   GET /api/sips/search-funds
// @access  Private
exports.searchFunds = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const funds = await sipService.searchFunds(query);

    res.json({
      success: true,
      count: funds.length,
      data: funds
    });
  } catch (error) {
    console.error('Search funds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search funds'
    });
  }
};

// @desc    Refresh SIP valuations
// @route   POST /api/sips/:id/refresh
// @access  Private
exports.refreshSIP = async (req, res) => {
  try {
    const sip = await SIP.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!sip) {
      return res.status(404).json({
        success: false,
        message: 'SIP not found'
      });
    }

    // Force recalculate
    const valuation = await sipService.computeCurrentValue(sip);
    
    sip.currentValue = valuation.currentValue;
    sip.totalInvested = valuation.totalInvested;
    sip.returns = valuation.returns;
    sip.xirr = valuation.xirr;
    sip.cagr = valuation.cagr;
    sip.lastNav = valuation.currentNav;
    sip.lastNavDate = valuation.lastNavDate;
    sip.lastUpdated = new Date();
    
    await sip.save();

    res.json({
      success: true,
      message: 'SIP valuation refreshed',
      data: {
        ...sip.toObject(),
        valuation
      }
    });
  } catch (error) {
    console.error('Refresh SIP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh SIP'
    });
  }
};
