const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const KEY_STORAGE = "owm_api_key";
const HISTORY_STORAGE = "weather_history";
const HISTORY_LIMIT = 8;

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const apiKeyInput = document.querySelector("#api-key-input");
const currentWeather = document.querySelector("#current-weather");
const forecast = document.querySelector("#forecast");
const historyList = document.querySelector("#history-list");
const statusText = document.querySelector("#status");

const history = loadHistory();
const storedApiKey = localStorage.getItem(KEY_STORAGE) || "";
apiKeyInput.value = storedApiKey;
renderHistory();

if (history.length > 0 && storedApiKey) {
  fetchAndRenderWeather(history[0]);
}

apiKeyInput.addEventListener("change", () => {
  const key = apiKeyInput.value.trim();
  localStorage.setItem(KEY_STORAGE, key);
  setStatus(key ? "API key saved." : "API key removed.");
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    return;
  }

  fetchAndRenderWeather(city);
});

historyList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const city = target.dataset.city;
  if (!city) {
    return;
  }

  cityInput.value = city;
  fetchAndRenderWeather(city);
});

async function fetchAndRenderWeather(city) {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus("Please add your OpenWeatherMap API key first.", true);
    return;
  }

  setStatus(`Loading weather for ${city}...`);

  const currentUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);

  if (!currentRes.ok || !forecastRes.ok) {
    setStatus("Unable to fetch weather. Check city spelling and API key.", true);
    return;
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  renderCurrentWeather(currentData);
  renderForecast(forecastData);
  addToHistory(currentData.name);
  setStatus(`Showing weather for ${currentData.name}.`);
}

function renderCurrentWeather(data) {
  const icon = data.weather[0].icon;
  const weatherMain = data.weather[0].main;
  const description = data.weather[0].description;

  currentWeather.innerHTML = `
    <div class="weather-main">
      <h2>${data.name}</h2>
      <p>${Math.round(data.main.temp)}°C · ${weatherMain}</p>
      <p>${capitalize(description)}</p>
    </div>
    <div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" width="90" height="90" />
      <div class="weather-meta">
        <span>Humidity: ${data.main.humidity}%</span>
        <span>Wind: ${Math.round(data.wind.speed)} m/s</span>
      </div>
    </div>
  `;

  currentWeather.classList.remove("hidden");
}

function renderForecast(data) {
  const dailyEntries = data.list
    .filter((entry) => entry.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  forecast.innerHTML = dailyEntries
    .map((entry) => {
      const date = new Date(entry.dt * 1000);
      const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      const icon = entry.weather[0].icon;

      return `
        <article class="forecast-card">
          <h3>${label}</h3>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${entry.weather[0].description}" width="50" height="50" />
          <p>${Math.round(entry.main.temp)}°C</p>
          <p>${capitalize(entry.weather[0].description)}</p>
        </article>
      `;
    })
    .join("");
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_STORAGE);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function addToHistory(city) {
  const withoutCity = history.filter((item) => item.toLowerCase() !== city.toLowerCase());
  history.length = 0;
  history.push(city, ...withoutCity);

  if (history.length > HISTORY_LIMIT) {
    history.length = HISTORY_LIMIT;
  }

  localStorage.setItem(HISTORY_STORAGE, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = "<li>No recent searches.</li>";
    return;
  }

  historyList.innerHTML = history
    .map((city) => `<li><button type="button" data-city="${city}">${city}</button></li>`)
    .join("");
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
