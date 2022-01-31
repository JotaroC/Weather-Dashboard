let searchButtonEl =  $(".btn");
let APIkey = "c33b2973c6711cf115abe047468b6b6e";
let today = moment().format('L');
let cityList = [];

//current time and date
let date = moment().format('dddd, MMMM Do YYYY');
let dateTime = moment().format('YYYY-MM-DD HH:MM:SS')

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function() {
    let searchHistory = JSON.parse(localStorage.getItem("city"));

    if (searchHistory !== null) {
        let lastSearchedCity = searchHistory[searchHistory.length - 1];
        currentWeather(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
    }
});

function currentWeather(name) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&units=metric&appid=${APIkey}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(weatherResponse) {
        console.log("weatherResponse");
        console.log(weatherResponse);

        $('#today-weather').empty();
        let iconCode = weatherResponse.weather[0].icon;
        let iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        let currentCity = $(`
        <h2 id="currentCity">
        ${weatherResponse.name} ${today} 
        <img src="${iconURL}" alt="${weatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${weatherResponse.main.temp} °C</p>
        <p>Humidity: ${weatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${weatherResponse.wind.speed} m/s</p>
        `);  

        $("#today-weather").append(currentCity);
    
        let lat = weatherResponse.coord.lat;
        let lon = weatherResponse.coord.lon;
        let uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${APIkey}`;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function(uvResponse) {
            console.log("UVResponse");
            console.log(uvResponse);

            let uvIndex = uvResponse.value;
            let currentUV = $(`<p>UV Index: 
            <span id="uvColor" class="px-2 py-1 rounded">${uvIndex}</span>
            </p>`);

            $("#today-weather").append(currentUV);
            futureWeather(lat, lon);

            // WHEN I view the UV index
            // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
            // 0-2 green#3EA72D, 3-5 yellow#FFF300, 6-7 orange#F18B00, 8-10 red#E53210, 11+violet#B567A4
            if (uvIndex >= 0 && uvIndex <= 4) {
                $("#uvColor").addClass("badge bg-success")
            } else if (uvIndex >= 5 && uvIndex <= 8) {
                $("#uvColor").addClass("badge bg-warning text-dark");
            } else {
                $("#uvColor").addClass("badge bg-danger")
            }; 
        })
    })
}

function futureWeather(lat,lon) {
    let futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={current,minutely,hourly,alerts}&units=metric&appid=${APIkey}`;

    $.ajax({
        url:futureURL,
        method: "GET"
    }).then(function(futureResponse) {

        console.log("futureResponse");
        console.log(futureURL);
        console.log(futureResponse);

        $('#boxes').empty();

        for (let i = 1; i < 6; i++) {
            let weatherInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                wind: futureResponse.daily[i].wind_speed,
                humidity: futureResponse.daily[i].humidity
            };

            let date = moment.unix(weatherInfo.date).format("MM/DD/YYYY");
            let iconURL = `<img src="https://openweathermap.org/img/w/${weatherInfo.icon}.png"/>`;

            // displays the date
            let futureCard = $(`
                    <div class="card pl-3 pt-3 mx-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${date}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${weatherInfo.temp} °C</p>
                            <p>Wind: ${weatherInfo.wind} m/s</p>
                            <p>Humidity: ${weatherInfo.humidity}\%</p>
                        </div>
                    </div>`);

            $("#boxes").append(futureCard);
        }
    })
}

$(".btn").on("click", function(event) {
    event.preventDefault();

    let cityName = $("#search-city").val().trim();
    currentWeather(cityName);
    if (!cityList.includes(cityName)) {
        cityList.push(cityName);
        let searchedCity = $(`<li class="list-group-item">${cityName}</li>`);
        $(".list-group").append(searchedCity);
    };

    localStorage.setItem("city", JSON.stringify(cityList));
    console.log(cityList);
});

$(document).on("click", ".list-group-item", function() {
    let city = $(this).text();
    currentWeather(city);
})