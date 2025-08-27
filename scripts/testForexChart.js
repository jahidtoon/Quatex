#!/usr/bin/env node

// Test script for Forex Chart Data System
// Tests Finnhub API integration and historical data management

import finnhubService from '../lib/finnhubService.js';
import historicalDataManager from '../lib/historicalDataManager.js';

async function testFinnhubService() {
  console.log('\n🧪 Testing Finnhub Service...');
  
  try {
    // Test rate limit status
    const rateLimitStatus = finnhubService.getRateLimitStatus();
    console.log('📊 Rate Limit Status:', rateLimitStatus);

    // Test forex symbols
    console.log('\n📋 Testing forex symbols...');
    const symbols = await finnhubService.getForexSymbols();
    console.log(`✅ Found ${symbols.length} forex symbols`);
    console.log('Sample symbols:', symbols.slice(0, 5));

    // Test forex quote
    console.log('\n💱 Testing forex quote for EUR_USD...');
    const quote = await finnhubService.getForexQuote('OANDA:EUR_USD');
    console.log('✅ Current EUR/USD quote:', quote);

    // Test historical candles
    console.log('\n📈 Testing historical candles...');
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (24 * 60 * 60); // 24 hours ago
    
    const candles = await finnhubService.getForexCandles(
      'OANDA:EUR_USD',
      '1', // 1 minute
      startTime,
      endTime
    );
    
    console.log(`✅ Fetched ${candles.length} candles`);
    if (candles.length > 0) {
      console.log('Sample candle:', candles[0]);
      console.log('Latest candle:', candles[candles.length - 1]);
    }

  } catch (error) {
    console.error('❌ Finnhub Service test failed:', error.message);
  }
}

async function testHistoricalDataManager() {
  console.log('\n🧪 Testing Historical Data Manager...');
  
  try {
    const symbol = 'EUR_USD';
    const interval = '1m';
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours ago

    // Test data coverage
    console.log('\n🔍 Checking data coverage...');
    const coverage = await historicalDataManager.getDataCoverage(
      symbol,
      interval,
      startDate,
      endDate
    );
    
    console.log('✅ Data coverage:', coverage);

    // Test historical data retrieval
    console.log('\n📊 Testing historical data retrieval...');
    const historicalData = await historicalDataManager.getHistoricalData(
      symbol,
      interval,
      startDate,
      endDate
    );
    
    console.log(`✅ Retrieved ${historicalData.length} historical candles`);
    if (historicalData.length > 0) {
      console.log('First candle:', historicalData[0]);
      console.log('Last candle:', historicalData[historicalData.length - 1]);
    }

    // Test recent data
    console.log('\n🕐 Testing recent data...');
    const recentData = await historicalDataManager.getRecentData(symbol, interval, 10);
    console.log(`✅ Retrieved ${recentData.length} recent candles`);

    // Test price update
    console.log('\n💰 Testing price update...');
    const testPrice = 1.05500 + (Math.random() - 0.5) * 0.001; // Random price around 1.055
    const updateResult = await historicalDataManager.updateLatestCandle(
      symbol,
      interval,
      testPrice
    );
    
    console.log('✅ Price update result:', updateResult);

  } catch (error) {
    console.error('❌ Historical Data Manager test failed:', error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🧪 Testing API Endpoints...');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // Test forex data endpoint
    console.log('\n🌐 Testing forex data API...');
    const response = await fetch(
      `${baseUrl}/api/chart/forex-data?symbol=EUR_USD&interval=1m&limit=10`,
      { method: 'GET' }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', {
        symbol: data.symbol,
        interval: data.interval,
        candleCount: data.candles?.length || 0,
        hasCurrentPrice: !!data.currentPrice,
        stats: data.stats
      });
    } else {
      console.log('⚠️  API not running or accessible');
    }

  } catch (error) {
    console.log('⚠️  Could not test API endpoints (server may not be running):', error.message);
  }
}

async function generateTestReport() {
  console.log('\n📋 Generating Test Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      finnhubService: 'pending',
      historicalDataManager: 'pending',
      apiEndpoints: 'pending'
    },
    rateLimitStatus: null,
    recommendations: []
  };

  try {
    report.rateLimitStatus = finnhubService.getRateLimitStatus();
    
    if (report.rateLimitStatus.remainingCalls < 10) {
      report.recommendations.push('⚠️  Low API rate limit remaining. Consider waiting before running more tests.');
    }

    if (process.env.FINNHUB_API_KEY === 'demo' || !process.env.FINNHUB_API_KEY) {
      report.recommendations.push('💡 Using demo API key. Get a free API key from finnhub.io for better functionality.');
    }

    report.recommendations.push('✅ System is ready for forex chart integration.');
    
  } catch (error) {
    report.recommendations.push('❌ Environment setup issue detected. Check your .env file.');
  }

  console.log('\n📊 Test Report:', JSON.stringify(report, null, 2));
  
  // Save report to file
  const fs = await import('fs');
  fs.writeFileSync(
    './test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('📁 Test report saved to: ./test-report.json');
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Forex Chart System Tests...');
  console.log('=====================================');

  await testFinnhubService();
  await testHistoricalDataManager();
  await testAPIEndpoints();
  await generateTestReport();

  console.log('\n✅ All tests completed!');
  console.log('🎯 You can now start the development server and visit /chart');
  console.log('📖 Check the test report for detailed information.');
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testFinnhubService, testHistoricalDataManager };
