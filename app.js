const express = require('express');
const app = express();
require("dotenv").config();


const apikey = process.env.API_KEY;

app.use(express.static('./public'));

app.get('/weather', async (req, res) => {
  const city = req.query.city?.trim();
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(404).json({ error: "City not found" });
    }
  } catch (error) {
    const message = "An error occurred while fetching the weather data. app.js";
    res.status(500).json({ error: message + error });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
