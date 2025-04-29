const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables need????

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW

    }

}




// Local Storage Utility Functions
function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Add to Favorites
function addToFavorites() {
    const city = document.querySelector("[data-cityName]").textContent.trim();
    if (!city) {
        alert("City not found!");
        return;
    }

    let favorites = getFavorites();
    if (!favorites.includes(city)) {
        favorites.push(city);
        saveFavorites(favorites);
        alert(`${city} added to favorites!`);
    } else {
        alert(`${city} is already in your favorites!`);
    }
}

// Update Favorites in UI
// Update Favorites in UI (with Temperature)
async function updateFavoritesUI() {
    const favoritesList = document.querySelector("[data-favoritesList]");
    favoritesList.innerHTML = ""; // Clear previous content

    const favorites = getFavorites();
    if (favorites.length === 0) {
        favoritesList.innerHTML = `<p>No favorite locations added.</p>`;
        return;
    }

    for (const city of favorites) {
        const apiKey = "d1845658f92b31c64bd94f06f7188c9c"; 
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error for ${city}: ${response.status}`);
            }

            const data = await response.json();
            const temp = Math.round(data.main.temp); // Get the temperature

            // Create list item with city name and temperature
            const li = document.createElement("li");
            li.classList.add("favorite-item");
            li.innerHTML = `
                <span><b>${city}</b>: ${temp}°C</span>
                <button onclick="removeFavorite('${city}')">Remove</button>
            `;
            favoritesList.appendChild(li);
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error);
        }
    }
}


// Remove from Favorites
function removeFavorite(city) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.toLowerCase() !== city.toLowerCase());
    saveFavorites(favorites);
    updateFavoritesUI();
}


// Function to Check Temperature and Display Reminder
function checkTemperature(temp) {
    const messageContainer = document.querySelector("[data-messageContainer]");

    if (temp > 37) {
        messageContainer.textContent = "🔥 It's hot outside!";
        messageContainer.classList.add("active");
    } else if (temp < 15) {
        messageContainer.textContent = "❄️ It's cold outside!";
        messageContainer.classList.add("active");
    } else {
        messageContainer.classList.remove("active");
    }
}









// Function to fetch 5-day forecast
async function getFiveDayForecast(city) {
    const apiKey = "d1845658f92b31c64bd94f06f7188c9c";  // Replace with your API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastContainer = document.querySelector("[data-forecastContainer]");
    forecastContainer.innerHTML = ""; // Clear previous results

    const forecastList = data.list.filter((_, index) => index % 8 === 0); // Get daily forecasts

    forecastList.forEach(day => {
        const { dt_txt, weather, main } = day;
        const date = new Date(dt_txt).toLocaleDateString("en-US", { weekday: "long" });

        forecastContainer.innerHTML += `
            <div class="forecast-card">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
                <p>${weather[0].description}</p>
                <p>${Math.round(main.temp)}°C</p>
            </div>
        `;
    });
}

// Example usage: call this function when the weather data is successfully fetched
getFiveDayForecast("London");  // Replace with the searched city




function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
    }
}

// Function to Check Temperatures for All Favorites
async function checkAllFavoritesTemperatures() {
    const favorites = getFavorites();
    const reminderContainer = document.querySelector("[data-reminderContainer]");
    reminderContainer.innerHTML = ""; // Clear previous content

    if (favorites.length === 0) {
        reminderContainer.innerHTML = `<p>No reminders to show.</p>`;
        return;
    }

    let remindersFound = false;

    for (const city of favorites) {
        const apiKey = "d1845658f92b31c64bd94f06f7188c9c";  // Replace with your API key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const temp = data.main.temp;

            if (temp > 37) {
                reminderContainer.innerHTML += `
                    <p class="reminder-message"><b>${city}</b>: Hot outside! 🔥</p>
                `;
                remindersFound = true;
            } else if (temp < 15) {
                reminderContainer.innerHTML += `
                    <p class="reminder-message"><b>${city}</b>: Cold outside! ❄️</p>
                `;
                remindersFound = true;
            }
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error);
        }
    }

    if (!remindersFound) {
        reminderContainer.innerHTML = `<p>No reminders to show.</p>`;
    }
}
