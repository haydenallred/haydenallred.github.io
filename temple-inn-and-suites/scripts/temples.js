

const requestURL = "scripts/temples.json";

fetch(requestURL) .then(function (response) {
    return response.json();
}) .then(function (jsonObject) {

    //console.table(jsonObject); // test data from json object

    const temples = jsonObject['temples'];

    for (let i = 0; i < temples.length; i++) {
        let temple = document.createElement('article');
        let templeName = document.createElement('h2');
        let information = document.createElement('section');
        let information2 = document.createElement('p');
        let information3 = document.createElement('p');
        let information4 = document.createElement('p');
        let information5 = document.createElement('p');
        let h2 = document.createElement('h2');
        let h5 = document.createElement('h4');
        let h6 = document.createElement('h4');
        let image = document.createElement('img');

        templeName.textContent = temples[i].name;
        information.appendChild(templeName);
        h2.textContent = temples[i].location;
        image.setAttribute('src', 'images/' + temples[i].photo);
        image.setAttribute('alt', temples[i].location + " temple");
        image.classList.add('fit-picture');
        information.appendChild(h2);

        // weather
        const openWeatherAPI = "https://api.openweathermap.org/data/2.5/weather?id=" + temples[i].weather + "&units=imperial&APPID=cf17f7fb8e6568c2c0a9652f9b7dfda9";

        fetch(openWeatherAPI)
                .then((response) => response.json())
                .then((weatherObject) => {
                    console.log(weatherObject);
                    let weather = document.createElement('h4');
                    weather.textContent = "Currently: " + weatherObject.weather[0].description;
                    
                    let temperature = document.createElement('h4');
                    temperature.innerHTML = "Temperature: " + weatherObject.main.temp + "&#176;F";

                    let humidity = document.createElement('h4');
                    humidity.innerHTML = "Humidity: " + weatherObject.main.humidity + "%";

                    let windSpeed = document.createElement('h4');
                    windSpeed.innerHTML = "Wind Speed: " + weatherObject.wind.speed + "mph";

                    information.appendChild(weather);
                    information.appendChild(temperature);
                    information.appendChild(humidity);
                    information.appendChild(windSpeed);

                });

        temple.appendChild(information);

        temple.appendChild(image);
        h5.textContent = temples[i].address;
        information.appendChild(h5);
        h6.textContent = "Phone Number: " + temples[i].phone;
        information.appendChild(h6);

        information2.textContent = "Services Offered: ";
        information.appendChild(information2);
        for (let x = 0; x < temples[i].services.length; x++) {
            let service = document.createElement('p');
            service.textContent = temples[i].services[x];
            information.appendChild(service);
        }

        information3.textContent = "Temple History";
        information.appendChild(information3);
        for (let h = 0; h < temples[i].history.length; h++) {
            let history = document.createElement('p');
            history.textContent = temples[i].history[h];
            information.appendChild(history);
        }

        information4.textContent = "Initiatories Offered: ";
        information.appendChild(information4);
        for (let o = 0; o < temples[i].initiatory.length; o++) {
            let initiatory = document.createElement('p');
            initiatory.textContent = temples[i].initiatory[o];
            information.appendChild(initiatory);
        }

        information5.textContent = "Temple Closures: ";
        information.appendChild(information5);
        for (let c = 0; c < temples[i].closure.length; c++) {
            let closure = document.createElement('p');
            closure.textContent = temples[i].closure[c];
            information.appendChild(closure);
        }

        temple.classList.add("main-content");
        document.getElementById("temples").appendChild(temple);
    }
});
