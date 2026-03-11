# Weather App

A simple and elegant weather application that provides real-time weather information for any city around the world.

## Features

- **Real-time Weather Data**: Get current weather conditions including temperature, description, and more
- **City Search**: Enter any city name to fetch weather information
- **Responsive Design**: Clean, glass-morphism UI that works on all devices
- **Fast API Integration**: Powered by OpenWeatherMap API for accurate data

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **API**: OpenWeatherMap API
- **Styling**: Custom CSS with glass-morphism effects

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory
   - Get your free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Add your API key to the `.env` file:
     ```
     API_KEY=your_openweathermap_api_key_here
     PORT=5000
     ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## Usage

1. Enter a city name in the search box
2. Click the "submit" button
3. View the current weather information including:
   - City name
   - Temperature
   - Weather description
   - Weather icon

## Project Structure

```
weather-app/
├── app.js                 # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # Project documentation
├── .env                  # Environment variables (create this)
└── public/
    ├── index.html        # Main HTML page
    ├── index.css         # Stylesheet
    ├── index.js          # Frontend JavaScript
    └── image/
        └── icon.png      # App icon
```

## API Reference

The app uses the OpenWeatherMap Current Weather API endpoint:
```
GET /weather?city={city_name}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)