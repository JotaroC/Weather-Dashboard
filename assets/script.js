let searchButtonEl =  $(".btn");
let weatherAPI = "c33b2973c6711cf115abe047468b6b6e";
let city = [];

//current time and date
var date = moment().format('dddd, MMMM Do YYYY');
var dateTime = moment().format('YYYY-MM-DD HH:MM:SS')

function init() {

} 

function searchApi(target_City) {
    let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + weatherAPI;

    fetch(queryURL)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            console.log(data);
        })
}

function printResult() {

}

function handleSearchSubmit(event) {

}

searchButtonEl.on("click", searchApi(testcity));
