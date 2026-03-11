const express = require('express');
const app = express();
require("dotenv").config();

// Configuration
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 5000;
const CACHE_DURATION = process.env.CACHE_DURATION || 600000; // 10 minutes in milliseconds
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate API key
if (!API_KEY) {
  console.error('❌ ERROR: API_KEY not found in .env file');
  console.error('Please add your API_KEY to the .env file');
  process.exit(1);
}

// Cache storage for reducing API calls
const weatherCache = new Map();

// Middleware
app.use(express.static('./public'));

// Helper function to get cached data
function getCachedWeather(city) {
  const cached = weatherCache.get(city.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${city}`);
    return cached.data;
  }
  weatherCache.delete(city.toLowerCase());
  return null;
}

// Helper function to cache weather data
function cacheWeather(city, data) {
  weatherCache.set(city.toLowerCase(), {
    data,
    timestamp: Date.now()
  });
}

// Current weather endpoint
app.get('/weather', async (req, res) => {
  try {
    const city = req.query.city?.trim();

    if (!city) {
      return res.status(400).json({
        error: "City name is required",
        details: "Please provide a city name in the query parameter"
      });
    }

    // Check cache first
    const cachedData = getCachedWeather(city);
    if (cachedData) {
      return res.json({ ...cachedData, fromCache: true });
    }

    // Fetch from API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: "City not found",
          details: "Please check the city name and try again"
        });
      }
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();
    cacheWeather(city, data);

    res.json({ ...data, fromCache: false });
  } catch (error) {
    console.error('❌ Weather API Error:', error.message);
    res.status(500).json({
      error: "Failed to fetch weather data",
      details: NODE_ENV === 'development' ? error.message : "Please try again later"
    });
  }
});

// Multi-day forecast endpoint (5-day forecast)
app.get('/forecast', async (req, res) => {
  try {
    const city = req.query.city?.trim();

    if (!city) {
      return res.status(400).json({
        error: "City name is required",
        details: "Please provide a city name in the query parameter"
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: "City not found",
          details: "Please check the city name and try again"
        });
      }
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Forecast API Error:', error.message);
    res.status(500).json({
      error: "Failed to fetch forecast data",
      details: NODE_ENV === 'development' ? error.message : "Please try again later"
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    environment: NODE_ENV,
    cacheSize: weatherCache.size
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: "Internal server error",
    details: NODE_ENV === 'development' ? err.message : "Please try again later"
  });
});

// Start server with graceful handling
const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🌤️  Weather App Server');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`⏱️  Cache duration: ${CACHE_DURATION / 1000 / 60} minutes`);
  console.log('═══════════════════════════════════════');
  console.log('');
});

// Handle EADDRINUSE error (port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('Try one of these solutions:');
    console.error(`  1. Change PORT in .env file (currently: ${PORT})`);
    console.error(`  2. Kill the process using port ${PORT}`);
    console.error(`  3. Use: netstat -ano | findstr :${PORT} (Windows)`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
