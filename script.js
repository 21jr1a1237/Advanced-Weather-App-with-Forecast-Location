let input = document.getElementById("cityInput");
let loader = document.getElementById("loader");
let apiKey = "YOUR_API_KEY_HERE";

/* Load history */
window.onload = function () {
    showHistory();
};

/* Enter key */
input.addEventListener("keypress", e => {
    if (e.key === "Enter") getWeather();
});

/* Loader */
function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

/* Get weather */
async function getWeather() {
    let city = input.value.trim();
    if (!city) return;

    showLoader();

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    let res = await fetch(url);
    let data = await res.json();

    if (data.cod === "404") {
        alert("City not found");
        hideLoader();
        return;
    }

    displayWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
    saveHistory(city);

    hideLoader();
}

/* Location */
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(async pos => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        showLoader();

        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        let res = await fetch(url);
        let data = await res.json();

        displayWeather(data);
        getForecast(lat, lon);

        hideLoader();
    });
}

/* Display weather */
function displayWeather(data) {
    document.getElementById("cityName").innerText = data.name;
    document.getElementById("temp").innerText = `Temp: ${data.main.temp} °C`;
    document.getElementById("desc").innerText = data.weather[0].description;

    let icon = data.weather[0].icon;
    document.getElementById("icon").src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    /* Background change */
    let condition = data.weather[0].main.toLowerCase();

    if (condition.includes("cloud"))
        document.body.style.background = "linear-gradient(135deg, gray, #bdc3c7)";
    else if (condition.includes("rain"))
        document.body.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
    else if (condition.includes("clear"))
        document.body.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
}

/* Forecast */
async function getForecast(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    let res = await fetch(url);
    let data = await res.json();

    let forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) {
        let item = data.list[i];

        let card = document.createElement("div");
        card.className = "card";

        let date = new Date(item.dt_txt).getDate();

        card.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
            <p>${Math.round(item.main.temp)}°C</p>
        `;

        forecastDiv.appendChild(card);
    }
}

/* Theme */
function toggleTheme() {
    document.body.classList.toggle("dark");
}

/* History */
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (!history.includes(city)) history.unshift(city);

    history = history.slice(0, 5);
    localStorage.setItem("history", JSON.stringify(history));

    showHistory();
}

function showHistory() {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    let div = document.getElementById("history");

    div.innerHTML = "<b>Recent:</b> ";

    history.forEach(city => {
        let span = document.createElement("span");
        span.innerText = city + " ";
        span.style.cursor = "pointer";

        span.onclick = () => {
            input.value = city;
            getWeather();
        };

        div.appendChild(span);
    });
}