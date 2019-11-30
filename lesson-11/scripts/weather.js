// date
let daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let monthsOfTheYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

let date = new Date();
let day = date.getDate();
let dayName = daysOfTheWeek[date.getDay()];
let month = monthsOfTheYear[date.getMonth()];
let year = date.getFullYear();

let lastUpdated = dayName + ", " + day + " " + month + " " + year;

let lastUpdatedElement = document.getElementById("last-updated");
lastUpdatedElement.textContent = lastUpdated;

function toggleMenu() {
    let menu = document.getElementById("menu");
    menu.classList.toggle("expanded");
}

if (dayName != "Friday" && document.title == "Preston Weather") {
    document.getElementById("alert").style.display = "none";
}

// get city ID

let cityID = "5604473";
let townsIndex = 4;

if (document.title == "Soda Springs Weather") {
    cityID = "5607916";
    townsIndex = 5;
} else if (document.title == "Fish Haven Weather") {
    //console.log("Fish Haven");
    cityID = "5585010";
    townsIndex = 1;
}

// get upcoming events

const eventsJSON = "https://byui-cit230.github.io/weather/data/towndata.json";
fetch(eventsJSON) .then((response) => response.json()) .then((eventsObject) => {
    //console.log(eventsObject.towns[townsIndex]);
    let eventsSection = document.createElement("section");
    for (let i = 0; i < eventsObject.towns[townsIndex].events.length; i++) {
        //console.log(eventsObject.towns[townsIndex].events[i]);
        let newEvent = document.createElement("p");
        newEvent.textContent = eventsObject.towns[townsIndex].events[i];
        eventsSection.appendChild(newEvent);
    }
    document.getElementById("upcoming-events").appendChild(eventsSection);
});

// get API weather

const weatherAPI = "https://api.openweathermap.org/data/2.5/weather?id=" + cityID + "&units=imperial&APPID=cf17f7fb8e6568c2c0a9652f9b7dfda9";
fetch(weatherAPI) .then((response) => response.json()) .then((weatherObject) => {
    //console.log(weatherObject);
    let currentTemperature = document.getElementById("current-temp");
    let windSpeed = document.getElementById("wind-speed");
    let highTemperature = document.getElementById("high-temp");
    let humidity = document.getElementById("humidity");
    let weatherOverview = document.getElementById("currently");

    weatherOverview.textContent = titleCase(weatherObject.weather[0].description);
    currentTemperatureValue = weatherObject.main.temp;
    currentTemperature.textContent = currentTemperatureValue;
    windSpeedValue = weatherObject.wind.speed;
    windSpeed.textContent = windSpeedValue;
    highTemperature.textContent = weatherObject.main.temp_max;
    humidity.textContent = weatherObject.main.humidity;

    calculateWindChill(currentTemperatureValue, windSpeedValue);
});


// get API five-day

for (let i = 0; i < 8; i++) {
    //console.log("Attempt");
    if (daysOfTheWeek[i] == dayName) {
        //console.log("Found it");
        document.getElementById("one-day").innerHTML = daysOfTheWeek[i+1];
        document.getElementById("two-day").innerHTML = daysOfTheWeek[i+2];
        document.getElementById("three-day").innerHTML = daysOfTheWeek[i+3];
        document.getElementById("four-day").innerHTML = daysOfTheWeek[i+4];
        document.getElementById("five-day").innerHTML = daysOfTheWeek[i+5];
        break;
    }
}

const forecastAPI = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&APPID=cf17f7fb8e6568c2c0a9652f9b7dfda9";
fetch(forecastAPI) .then((response) => response.json()) .then((forecastObject) => {
    //console.log(forecastObject);
    let cells = document.getElementsByClassName('forecast-cell');
    let cell = 0
    for (i = 0; i < forecastObject.list.length; i++) {
        if (forecastObject.list[i].dt_txt.substring(11, 19) == "18:00:00" && cell < cells.length) {
            let text = document.createElement('p')
            text.innerHTML = forecastObject.list[i].main.temp + " &#176;F";
            let image = document.createElement('img');
            image.setAttribute('alt', forecastObject.list[i].weather[0].description);   
            image.setAttribute('src', "https://openweathermap.org/img/wn/" + forecastObject.list[i].weather[0].icon + ".png");       
            cells[cell].appendChild(image);
            cells[cell].appendChild(text);
            cell++;
        }
    }
});



// windchill
function calculateWindChill(temp, speed){

    let result = "N/A";

    if (temp <= 50 && speed > 3) {
        let windChill = 35.74 + (0.6215 * temp)
        - (35.75 * Math.pow(speed, 0.16))
        + (0.4275 * temp * Math.pow(speed, 0.16));
        result = Math.round(windChill);;
    }

    document.getElementById("wind-chill").innerHTML = result;

    //console.log(result);
}

function titleCase(str) {
    str = str.toLowerCase();
    str = str.split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }