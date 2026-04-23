let input = document.getElementById("cityInput");
let loader = document.getElementById("loader");
let apiKey = "f91cdd2a50354c2a1e1cb66a070caf8f"; 

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

/*  Get weather by city */
async function getWeather() {
    let city = input.value.trim();
    if (!city) return;

    showLoader();

    try {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        let res = await fetch(url);
        let data = await res.json();

        if (!res.ok || data.cod !== 200) {
            alert("City not found ❌");
            return;
        }

        displayWeather(data);
        await getForecast(data.coord.lat, data.coord.lon);
        saveHistory(city);

    } catch (error) {
        console.error(error);
        alert("Something went wrong ❌");
    } finally {
        hideLoader(); // 🔥 always hide
    }
}

/*  Location weather */
function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async pos => {
            showLoader();

            try {
                let lat = pos.coords.latitude;
                let lon = pos.coords.longitude;

                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

                let res = await fetch(url);
                let data = await res.json();

                if (!res.ok || data.cod !== 200) {
                    alert("Location weather error ❌");
                    return;
                }

                displayWeather(data);
                await getForecast(lat, lon);

            } catch (error) {
                console.error(error);
                alert("Error fetching location ❌");
            } finally {
                hideLoader(); // 🔥 fix
            }
        },
        () => {
            alert("Location permission denied ❌");
        }
    );
}

/* Display weather */
function displayWeather(data) {
    if (!data || !data.main || !data.weather) {
        alert("Invalid data ❌");
        return;
    }

    document.getElementById("cityName").innerText = data.name || "N/A";
    document.getElementById("temp").innerText =
        `Temp: ${data.main.temp ?? "--"} °C`;
    document.getElementById("desc").innerText =
        data.weather[0]?.description || "No data";

    /* icon */
    let icon = data.weather[0].icon;
    document.getElementById("icon").src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    /* background */
    let condition = data.weather[0].main.toLowerCase();

    if (condition.includes("cloud"))
        document.body.style.background =
            "linear-gradient(135deg, gray, #bdc3c7)";
    else if (condition.includes("rain"))
        document.body.style.background =
            "linear-gradient(135deg, #2c3e50, #4ca1af)";
    else if (condition.includes("clear"))
        document.body.style.background =
            "linear-gradient(135deg, #f7971e, #ffd200)";
    else
        document.body.style.background =
            "linear-gradient(135deg, #4facfe, #00f2fe)";
}

/*  Forecast */
async function getForecast(lat, lon) {
    try {
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

    } catch (error) {
        console.error("Forecast error:", error);
    }
}

/*  Theme */
function toggleTheme() {
    document.body.classList.toggle("dark");
}

/*  History */
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