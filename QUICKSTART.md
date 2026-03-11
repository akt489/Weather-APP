# 🚀 Quick Setup Guide

## 5-Minute Quick Start

### 1. Prerequisites
```bash
# Check versions (need Node 14+ and npm 6+)
node --version
npm --version
```

### 2. Clone & Install
```bash
git clone https://github.com/akt489/Weather-APP.git
cd Weather-APP
npm install
```

### 3. Get API Key
1. Go to https://openweathermap.org/api
2. Sign up (free)
3. Copy your API key

### 4. Configure
```bash
# Edit .env file and add your API key
API_KEY=paste_your_api_key_here
PORT=5000
```

### 5. Run
```bash
npm start
# Opens at http://localhost:5000
```

---

## Troubleshooting Quick Fix

### Port Already in Use?
```bash
# Change PORT in .env to 3001 or 8000
PORT=3001
```

### API Key Error?
```bash
# Make sure it's in .env file
API_KEY=your_actual_key_not_placeholder
```

### Slow First Load?
- First request hits API (~500ms)
- Subsequent requests use cache (~10ms)

---

## Available Commands

```bash
npm start           # Run production
npm run dev         # Development with auto-reload
npm test            # Run tests
npm run test:watch  # Tests watch mode
npm run lint        # Code quality check
```

---

## Features

- ✅ Real-time weather anywhere
- ✅ Light/Dark mode
- ✅ °C/°F conversion
- ✅ Beautiful modern UI
- ✅ 5-day forecast
- ✅ Smart caching
- ✅ Works offline
- ✅ Mobile friendly

---

**Need Help?**
- Read [README.md](README.md) for full docs
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
- Open GitHub issues for problems
