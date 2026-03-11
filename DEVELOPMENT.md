# 🛠️ Development Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Code Architecture](#code-architecture)
- [Adding Features](#adding-features)
- [Debugging](#debugging)
- [Best Practices](#best-practices)

---

## Getting Started

### Development Environment Setup

```bash
# 1. Clone and install
git clone https://github.com/akt489/Weather-APP.git
cd Weather-APP
npm install

# 2. Create .env for development
cat > .env << EOF
API_KEY=your_dev_api_key
PORT=5000
NODE_ENV=development
DEBUG=true
CACHE_DURATION=600000
EOF

# 3. Start with auto-reload
npm run dev

# 4. In another terminal, run tests
npm test
```

### VS Code Setup (Recommended)

**Extensions to Install:**
- Prettier - Code formatter
- ESLint - Code quality
- REST Client - API testing
- Thunder Client - API testing

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Project Structure

### Backend Architecture
```
app.js (126 lines)
├── Configuration
│   ├── Environment variables
│   ├── Port management
│   └── Cache settings
├── Middleware
│   ├── Static files
│   └── Error handling
├── Routes
│   ├── GET /weather - Current weather
│   ├── GET /forecast - 5-day forecast
│   ├── GET /health - Health check
│   └── Error handlers
└── Server Management
    ├── Graceful shutdown
    ├── EADDRINUSE handling
    └── Error logging
```

### Frontend Architecture
```
public/index.html (60 lines)
├── HTML structure
├── Theme toggle
├── Unit toggle
└── Weather display

public/index.js (200 lines)
├── State management
├── Theme functionality
├── Unit switching
├── API interaction
└── Event listeners

public/index.css (400+ lines)
├── CSS variables
├── Dark mode support
├── Animations
├── Responsive design
└── Accessibility

public/imageTeller.js (Simple router)
└── Weather icon selector
```

### Test Architecture
```
app.test.js (250+ lines)
├── Health endpoint tests
├── Weather endpoint tests
├── Forecast endpoint tests
├── Error handling tests
├── Data validation tests
└── Cache tests
```

---

## Code Architecture

### Backend Flow

```
Request → Validation → Cache Check → API/Cache → Response
```

#### 1. Request Validation
```javascript
const city = req.query.city?.trim();
if (!city) {
  return res.status(400).json({ error: "City name is required" });
}
```

#### 2. Cache Check
```javascript
const cachedData = getCachedWeather(city);
if (cachedData) {
  return res.json({ ...cachedData, fromCache: true });
}
```

#### 3. API Fetch
```javascript
const response = await fetch(url);
const data = await response.json();
cacheWeather(city, data);
res.json({ ...data, fromCache: false });
```

### Frontend Flow

```
User Input → Fetch API → Parse Response → Display → Store Preference
```

#### 1. State Management
```javascript
let currentWeatherData = null;
let currentUnit = 'celsius'; // or 'fahrenheit'
```

#### 2. Unit Conversion
```javascript
function tempToDisplay(kelvin) {
  const celsius = kelvin - 273.15;
  if (currentUnit === 'fahrenheit') {
    return convertToFahrenheit(celsius).toFixed(1);
  }
  return celsius.toFixed(1);
}
```

#### 3. API Interaction
```javascript
async function fetchWeather() {
  const city = input.value.trim();
  showLoading();
  try {
    const response = await fetch(`/weather?city=${city}`);
    const data = await response.json();
    displayWeatherWithUnit(data);
  } catch (error) {
    warningMessage("Error", error.message);
  }
}
```

---

## Adding Features

### Add a New Weather Metric

#### 1. Backend (app.js)
```javascript
// In displayWeather/displayWeatherWithUnit
const { main: { temp, ..., windSpeed } } = data;

// Add to response
const windDisplay = `💨 Wind: ${data.wind.speed} m/s`;
```

#### 2. Frontend (index.js)
```javascript
// Create display element
const windElement = document.createElement("p");
windElement.textContent = `💨 Wind: ${data.wind.speed} m/s`;

// Add to display area
discArea.appendChild(windElement);
```

#### 3. Test (app.test.js)
```javascript
test('Response should include wind data', async () => {
  const response = await request(app)
    .get('/weather?city=London')
    .expect(200);

  expect(response.body).toHaveProperty('wind');
  expect(response.body.wind).toHaveProperty('speed');
});
```

### Add a New Endpoint

#### 1. Backend (app.js)
```javascript
// Add new route
app.get('/history', async (req, res) => {
  const city = req.query.city?.trim();
  
  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  try {
    // Your logic here
    res.json(/* your data */);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Frontend (index.js)
```javascript
// Add new function to call endpoint
async function getWeatherHistory(city) {
  const response = await fetch(`/history?city=${city}`);
  return await response.json();
}
```

#### 3. Test (app.test.js)
```javascript
describe('History Endpoint', () => {
  test('GET /history should return historical data', async () => {
    const response = await request(app)
      .get('/history?city=London')
      .expect(200);

    expect(response.body).toHaveProperty('history');
  });
});
```

---

## Debugging

### Browser DevTools

1. **Console Errors**
   ```javascript
   // Check for JavaScript errors
   console.log('Debug info:', data);
   console.error('Error:', error);
   ```

2. **Network Tab**
   - Check API calls
   - View request/response
   - Check cache hits
   - Monitor timing

3. **Application Tab**
   - View localStorage (theme, unit)
   - Check cookies
   - Debug service workers

### Server Debugging

```javascript
// Enable debug logging
DEBUG=true npm run dev

// Or in code
console.log('📦 Cache hit for:', city);
console.log('❌ Weather API Error:', error.message);
```

### Testing Specific Cases

```bash
# Test single test file
npm test -- app.test.js

# Test specific describe block
npm test -- --testNamePattern="Health Check"

# Debug tests
node --inspect-brk node_modules/jest/bin/jest.js --runInBand

# Verbose output
npm test -- --verbose
```

### Common Issues

#### Issue: Cache not working
```javascript
// Check cache is enabled
if (process.env.ENABLE_CACHE !== 'false') {
  const cached = getCachedWeather(city);
  console.log('Cache status:', cached ? 'HIT' : 'MISS');
}
```

#### Issue: Port still in use
```bash
# Check what's using the port
netstat -ano | findstr :5000

# Or use different port
PORT=3001 npm start
```

#### Issue: API quota exceeded
```javascript
// Check response status
if (response.status === 429) {
  // Too many requests
}
```

---

## Best Practices

### Code Organization

✅ **Good:**
```javascript
// Clear function names
function convertTempToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}
```

❌ **Bad:**
```javascript
// Unclear function name
function convert(c) {
  return (c * 9/5) + 32;
}
```

### Error Handling

✅ **Good:**
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Weather fetch failed:', error.message);
  throw error;
}
```

❌ **Bad:**
```javascript
const data = await fetch(url).then(r => r.json());
```

### Naming Conventions

```javascript
// Variables: camelCase
const currentWeatherData = null;

// Functions: camelCase
function fetchWeather() {}

// Constants: UPPER_CASE
const CACHE_DURATION = 600000;

// Classes: PascalCase (if using)
class WeatherManager {}
```

### Comments

✅ **Good:**
```javascript
// Cache weather data for 10 minutes to reduce API calls
function cacheWeather(city, data) {
  weatherCache.set(city.toLowerCase(), {
    data,
    timestamp: Date.now()
  });
}
```

❌ **Bad:**
```javascript
// Cache the weather
function cache(c, d) {
  w.set(c, { d, t: Date.now() });
}
```

### Testing Best Practices

```javascript
describe('Feature', () => {
  // Descriptive test names
  test('should convert Celsius to Fahrenheit correctly', () => {
    expect(convertToFahrenheit(0)).toBe(32);
  });

  // Test edge cases
  test('should handle extreme temperatures', () => {
    expect(convertToFahrenheit(-273)).toBeLessThan(0);
  });

  // Test error cases
  test('should throws error for invalid input', () => {
    expect(() => convertToFahrenheit(null)).toThrow();
  });
});
```

---

## Performance Optimization

### Caching Strategy
```javascript
// Current: 10-minute cache
CACHE_DURATION=600000

// Optimize for more hits
CACHE_DURATION=1800000  // 30 minutes

// Optimize for freshness
CACHE_DURATION=300000   // 5 minutes
```

### Request Optimization
```javascript
// Use abort signal for timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);
```

### Bundle Size
- SVG icons (scalable)
- Minified CSS
- Optimized JavaScript

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/temperature-alerts

# Make changes and commit
git add .
git commit -m "Add temperature alerts feature"

# Push and create PR
git push origin feature/temperature-alerts

# After PR merge, delete branch
git branch -d feature/temperature-alerts
```

---

**Happy Coding!** 🚀
