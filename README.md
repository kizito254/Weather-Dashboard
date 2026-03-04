# Weather Dashboard

A lightweight weather dashboard that fetches data from the OpenWeatherMap API and renders a dynamic UI.

## Features
- Search for weather by city name.
- Display current conditions (temperature, summary, humidity, wind, icon).
- Show 5-day forecast cards.
- Store API key in local browser storage.
- Keep recent city searches and allow one-click re-search.

## Run locally
1. Get an API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Start a local static server in this project folder:
   ```bash
   python3 -m http.server 4173
   ```
3. Open `http://localhost:4173`.
4. Paste your API key into the dashboard and search for a city.
