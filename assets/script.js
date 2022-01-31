let searchButtonEl =  $(".btn");
let APIkey = "c33b2973c6711cf115abe047468b6b6e";
var today = moment().format('L');
let cityName = "oakville"
let cityList = [];

//current time and date
let date = moment().format('dddd, MMMM Do YYYY');
let dateTime = moment().format('YYYY-MM-DD HH:MM:SS')

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function() {
    let searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        let lastSearchedCity = searchHistoryArr[searchHistoryArr.length - 1];
        currentCondition(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
    }
});

function currentCondition(name) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&units=imperial&appid=${APIkey}`;
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
        <p>Temperature: ${weatherResponse.main.temp} °F</p>
        <p>Humidity: ${weatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${weatherResponse.wind.speed} MPH</p>
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
            <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>`);

            $("#today-weather").append(currentUV);
            futureCondition(lat, lon);

            // WHEN I view the UV index
            // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
            // 0-2 green#3EA72D, 3-5 yellow#FFF300, 6-7 orange#F18B00, 8-10 red#E53210, 11+violet#B567A4
            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $("#uvIndexColor").css("background-color", "#FFF300");
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                $("#uvIndexColor").css("background-color", "#F18B00");
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
            } else {
                $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white"); 
            }; 
        })
    })
}

function futureCondition(lat,lon) {
    let futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={current,minutely,hourly,alerts}&appid=${APIkey}`;

    $.ajax({
        url:futureURL,
        method: "GET"
    }).then(function(futureResponse) {

        console.log("futureResponse");
        console.log(futureURL);
        console.log(futureResponse);

        $('#boxes').empty();

        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                wind: futureResponse.daily[i].wind_speed,
                humidity: futureResponse.daily[i].humidity
            };

            let currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            let iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            // displays the date
            // an icon representation of weather conditions
            // the temperature
            // the humidity
            var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#boxes").append(futureCard);
        }
    })
}

$(".btn").on("click", function(event) {
    event.preventDefault();

    let cityName = $("#search-city").val().trim();
    currentCondition(cityName);
    if (!cityList.includes(cityName)) {
        cityList.push(cityName);
        let searchedCity = $(`
            <li class="list-group-item">${cityName}</li>
            `);
        $(".list-group").append(searchedCity);
    };

    localStorage.setItem("city", JSON.stringify(cityList));
    console.log(cityList);
});

$(document).on("click", ".list-group-item", function() {
    let city = $(this).text();
    currentCondition(city);
})