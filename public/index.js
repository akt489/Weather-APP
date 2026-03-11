const button = document.querySelector('.searchButton');
const input = document.querySelector('input');
const loadArea = document.querySelector('.loadArea');
const themeToggle = document.querySelector('.themeToggle');
const unitBtns = document.querySelectorAll('.unitBtn');

const { default: imageTeller } = await import('./imageTeller.js');

// ============================================
// STATE MANAGEMENT
// ============================================
let currentWeatherData = null;
let currentUnit = 'celsius'; // 'celsius' or 'fahrenheit'

// ============================================
// THEME FUNCTIONALITY
// ============================================
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

themeToggle.addEventListener('click', toggleTheme);
initializeTheme();

// ============================================
// UNIT SWITCHING FUNCTIONALITY
// ============================================
function initializeUnit() {
  const savedUnit = localStorage.getItem('unit') || 'celsius';
  setUnit(savedUnit);
}

function setUnit(unit) {
  currentUnit = unit;
  localStorage.setItem('unit', unit);

  // Update button states
  unitBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.unit === unit) {
      btn.classList.add('active');
    }
  });

  // Re-display current weather with new unit
  if (currentWeatherData) {
    displayWeatherWithUnit(currentWeatherData);
  }
}

function convertToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

function convertToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function tempToDisplay(kelvin) {
  const celsius = kelvin - 273.15;
  if (currentUnit === 'fahrenheit') {
    return convertToFahrenheit(celsius).toFixed(1);
  }
  return celsius.toFixed(1);
}

function getUnitSymbol() {
  return currentUnit === 'celsius' ? '°C' : '°F';
}

unitBtns.forEach(btn => {
  btn.addEventListener('click', () => setUnit(btn.dataset.unit));
});

// ============================================
// UI STATE MANAGEMENT
// ============================================
function clearDisplay() {
  const cityArea = document.querySelector('.city');
  const degreeArea = document.querySelector('.degree');
  const discArea = document.querySelector('.disc');
  const imageArea = document.querySelector('.imageArea');

  cityArea.innerHTML = "";
  degreeArea.innerHTML = "";
  discArea.innerHTML = "";
  imageArea.innerHTML = "";
}

function clearLoader() {
  loadArea.innerHTML = "";
  input.value = "";
  input.focus(); // Return focus for accessibility
}

function displayWeatherWithUnit(data) {
  currentWeatherData = data;

  const {
    main: { temp, feels_like, humidity, pressure },
    weather: [{ description, main }],
    name,
    sys: { country }
  } = data;

  const tempDisplay = tempToDisplay(temp);
  const feelsLikeDisplay = tempToDisplay(feels_like);
  const unitSymbol = getUnitSymbol();

  const cityDisplay = document.createElement("h2");
  const tempElement = document.createElement("p");
  const discDisplay = document.createElement("p");
  const feelsDisplay = document.createElement("p");

  cityDisplay.textContent = `${name}, ${country}`;
  cityDisplay.setAttribute('role', 'heading');
  cityDisplay.setAttribute('aria-level', '2');

  tempElement.innerHTML = `<strong>${tempDisplay}${unitSymbol}</strong> <span style="opacity: 0.8;">| Feels like ${feelsLikeDisplay}${unitSymbol}</span>`;
  tempElement.setAttribute('aria-label', `Temperature ${tempDisplay} degrees ${currentUnit}`);

  discDisplay.innerHTML = `<span style="text-transform: capitalize;">${description}</span> ${main}`;
  feelsDisplay.innerHTML = `💧 Humidity: ${humidity}% | 🌡️ Pressure: ${pressure}mb`;

  const cityArea = document.querySelector('.city');
  const degreeArea = document.querySelector('.degree');
  const discArea = document.querySelector('.disc');

  clearDisplay();

  cityArea.appendChild(cityDisplay);
  degreeArea.appendChild(tempElement);
  discArea.appendChild(discDisplay);
  discArea.appendChild(feelsDisplay);

  imageTeller(temp);
}

function warningMessage(message, details = null) {
  clearDisplay();
  const errorContainer = document.createElement("div");
  errorContainer.setAttribute('role', 'alert');

  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.style.fontSize = "1.1rem";
  errorDisplay.style.color = "#ff6b6b";
  errorDisplay.style.fontWeight = "500";
  errorDisplay.style.padding = "20px";
  errorDisplay.style.textAlign = "center";
  errorDisplay.style.marginBottom = "10px";

  errorContainer.appendChild(errorDisplay);

  if (details) {
    const detailsDisplay = document.createElement("p");
    detailsDisplay.textContent = details;
    detailsDisplay.style.fontSize = "0.95rem";
    detailsDisplay.style.color = "var(--text-secondary)";
    detailsDisplay.style.padding = "0 20px 20px";
    detailsDisplay.style.textAlign = "center";
    errorContainer.appendChild(detailsDisplay);
  }

  loadArea.innerHTML = '';
  loadArea.appendChild(errorContainer);

  document.querySelector("input").value = "";
}

function showLoading() {
  clearDisplay();
  loadArea.innerHTML = "";

  const container = document.createElement("div");
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');

  const loadingDisplay = document.createElement("h2");
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");

  loadingDisplay.textContent = "Fetching Weather Data";
  loadingDisplay.style.margin = "0";
  loadingDisplay.style.fontSize = "1.2rem";

  container.appendChild(spinner);
  container.appendChild(loadingDisplay);
  loadArea.appendChild(container);
}

// ============================================
// API INTERACTION
// ============================================
async function fetchWeather() {
  const city = input.value.trim();

  if (!city) {
    warningMessage("Please enter a city name", "City name is required to fetch weather information.");
    return;
  }

  if (city.length < 2) {
    warningMessage("City name too short", "Please enter at least 2 characters.");
    return;
  }

  const url = `/weather?city=${encodeURIComponent(city)}`;
  showLoading();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const data = await response.json();

    if (!response.ok) {
      warningMessage(
        data.error || "Failed to fetch weather",
        data.details || "Please try again later."
      );
      return;
    }

    displayWeatherWithUnit(data);
    clearLoader();

    // Show cache status
    if (data.fromCache) {
      console.log('✅ Data retrieved from cache');
    }
  } catch (error) {
    console.error('❌ Weather fetch error:', error);

    if (error.name === 'AbortError') {
      warningMessage(
        "Request timeout",
        "The request took too long. Please check your connection and try again."
      );
    } else if (!navigator.onLine) {
      warningMessage(
        "No internet connection",
        "Please check your internet connection and try again."
      );
    } else {
      warningMessage(
        "Failed to fetch weather data",
        "An unexpected error occurred. Please try again later."
      );
    }
  }
}

// ============================================
// EVENT LISTENERS
// ============================================
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather();
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    input.value = "";
    clearDisplay();
  }
});

button.addEventListener('click', () => {
  fetchWeather();
});

button.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    fetchWeather();
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('✅ Back online');
});

window.addEventListener('offline', () => {
  console.warn('❌ Gone offline');
});

// ============================================
// INITIALIZATION
// ============================================
initializeUnit();
console.log('🌤️ Weather App loaded successfully');
