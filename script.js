"use strict";

const API = "56002b83be052e41d58e0e1b2261f1ee";
const dayEL = document.querySelector(".default_day");
const dateEL = document.querySelector(".default_date");
const btnEL = document.querySelector(".btn_search");
const inputEL = document.querySelector(".input_field");
const iconsContainer = document.querySelector(".icons");
const dayInfoEL = document.querySelector(".day_info");
const listContentEL = document.querySelector(".list_content ul");
const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Display the day
const day = new Date();
const dayName = days[day.getDay()];
dayEL.textContent = dayName;

// Display date
let month = day.toLocaleDateString("default", { month: "long" });
let date = day.getDate();
let year = day.getFullYear();
dateEL.textContent = date + " " + month + " " + year;

// Event Listener
btnEL.addEventListener("click", (e) => {
    e.preventDefault();
    if (inputEL.value !== "") {
        const search = inputEL.value;
        inputEL.value = "";
        findLocation(search);
    } else {
        console.log("Please enter the city or country name");
    }
});

async function findLocation(name) {
    iconsContainer.innerHTML = "";
    dayInfoEL.innerHTML = "";
    listContentEL.innerHTML = "";
    try {
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}`;
        const data = await fetch(API_URL);
        const result = await data.json();
        if (result.cod !== "404") {
            const ImageContent = displayImageContent(result);
            const rightSide = rightSideContent(result);
            displayForecast(result.coord.lat, result.coord.lon);
            setTimeout(() => {
                iconsContainer.insertAdjacentHTML("afterbegin", ImageContent);
                iconsContainer.classList.add("fadeIn");
                dayInfoEL.insertAdjacentHTML("afterbegin", rightSide);
            });
        } else {
            const message = `<h2 class="weather_temp">${result.cod}</h2>
                             <h3 class="cloudtxt">${result.message}</h3>`;
            iconsContainer.insertAdjacentHTML("afterbegin", message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function displayImageContent(data) {
    return `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="" />
            <h2 class="weather_temp">${Math.round(data.main.temp - 273.15)}℃</h2>
            <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

function rightSideContent(result) {
    return `<div class="content">
                <p class="title">NAME</p>
                <span class="value">${result.name}</span>
            </div>
            <div class="content">
                <p class="title">TEMP</p>
                <span class="value">${Math.round(result.main.temp - 273.15)}℃</span>
            </div>
            <div class="content">
                <p class="title">HUMIDITY</p>
                <span class="value">${result.main.humidity}%</span>
            </div>
            <div class="content">
                <p class="title">WIND SPEED</p>
                <span class="value">${result.wind.speed} km/h</span>
            </div>`;
}

async function displayForecast(lat, lon) {
    const Forecast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}`;
    try {
        const data = await fetch(Forecast_API);
        const result = await data.json();

        if (!result.list || result.list.length === 0) {
            console.error("Forecast data is missing or empty.");
            return;
        }

        // Log the full response for debugging
        console.log("Full API Response:", result);

        // Get the current date
        const currentDate = new Date().toISOString().split("T")[0];
        console.log("Current Date:", currentDate);

        // Collect forecasts for the next days, ensuring one forecast per day
        const forecastByDay = {};
        result.list.forEach((forecast) => {
            const forecastDate = forecast.dt_txt.split(" ")[0]; // Extract date in YYYY-MM-DD format
            if (forecastDate !== currentDate && !forecastByDay[forecastDate]) {
                forecastByDay[forecastDate] = forecast; // Save the first forecast for each day
            }
        });

        console.log("Filtered Forecasts by Day:", forecastByDay);

        // Convert the object to an array of forecasts
        const daysForecast = Object.values(forecastByDay);

        // Clear previous forecast content
        listContentEL.innerHTML = "";

        // Add the forecasts for each day dynamically
        daysForecast.forEach((content) => {
            listContentEL.insertAdjacentHTML("beforeend", forecast(content));
        });
    } catch (error) {
        console.error("Error fetching or processing forecast data:", error);
    }
}


function forecast(forecastContent) {
    const day = new Date(forecastContent.dt_txt);
    const dayName = days[day.getDay()];
    const shortDay = dayName.slice(0, 3);
    return `<li>
                <img src="https://openweathermap.org/img/wn/${forecastContent.weather[0].icon}@2x.png" alt="" />
                <span>${shortDay}</span>
                <span class="day_temp">${Math.round(forecastContent.main.temp - 273.15)}℃</span>
            </li>`;
}
