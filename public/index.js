const button = document.querySelector('.searchButton');
const input = document.querySelector('input');
const loadArea = document.querySelector('.loadArea');
const themeToggle = document.querySelector('.themeToggle');

const { default: imageTeller } = await import('./imageTeller.js');

// Theme Toggle Functionality
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
}

function displayWeather(data) {
  const { main: { temp, feels_like, humidity, pressure }, weather: [{ description, main }], name, sys: { country } } = data;
  const tempC = (temp - 273.15).toFixed(1);
  const feelsLike = (feels_like - 273.15).toFixed(1);

  const cityDisplay = document.createElement("h2");
  const tempDisplay = document.createElement("p");
  const discDisplay = document.createElement("p");
  const feelsDisplay = document.createElement("p");

  cityDisplay.textContent = `${name}, ${country}`;
  tempDisplay.innerHTML = `<strong>${tempC}°C</strong> <span style="opacity: 0.8;">| Feels like ${feelsLike}°C</span>`;
  discDisplay.innerHTML = `<span style="text-transform: capitalize;">${description}</span> ${main}`;
  feelsDisplay.innerHTML = `💧 Humidity: ${humidity}% | 🌡️ Pressure: ${pressure}mb`;

  const cityArea = document.querySelector('.city');
  const degreeArea = document.querySelector('.degree');
  const discArea = document.querySelector('.disc');

  clearDisplay();

  cityArea.appendChild(cityDisplay);
  degreeArea.appendChild(tempDisplay);
  discArea.appendChild(discDisplay);
  discArea.appendChild(feelsDisplay);

  imageTeller(temp);
}

function warningMessage(message) {
  clearDisplay();
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.style.fontSize = "1.1rem";
  errorDisplay.style.color = "#ff6b6b";
  errorDisplay.style.fontWeight = "500";
  errorDisplay.style.padding = "20px";
  errorDisplay.style.textAlign = "center";

  loadArea.innerHTML = '';
  loadArea.appendChild(errorDisplay);

  document.querySelector("input").value = "";
  return;
}

function showLoading() {
  clearDisplay();
  loadArea.innerHTML = "";
  const loadingDisplay = document.createElement("h2");
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  loadingDisplay.textContent = "Fetching Weather Data";
  loadingDisplay.style.margin = "0";
  loadArea.appendChild(spinner);
  loadArea.appendChild(loadingDisplay);
}

async function fetchWeather() {
  const city = document.querySelector("input").value;
  if (city === "") {
    const message = "Please enter a city name";
    warningMessage(message);
    return;
  }
  const url = `/weather?city=${encodeURIComponent(city)}`;
  showLoading();
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      displayWeather(data);
      clearLoader();
    } else {
      const message = "City not found. Please check the city name and try again.";
      warningMessage(message);
    }
  } catch (error) {
    alert(error)
    const message = "An error occurred while fetching the weather data.";
    warningMessage(message);
  }
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather();
  }
});

button.addEventListener('click', () => {
  fetchWeather();
})


