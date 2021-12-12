// OpenWeather API key
var apiKey = '6096ef2cb3daada49a2eef39c101f0e4';

// Declare a variable to store the searched city
var city = '';

// variable
var searchCityEl = $('#search-city');
var uvInputEl = $('#uv-input');
var sCity = [];

// searches city to see if it exits in the enters from the storage
function findCity(c) {
  for (var i = 0; i < sCity.length; i++) {
    if (c === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

// Display the current and future weather to the user
function displayWeather(event) {
  event.preventDefault();
  if (searchCityEl.val()) {
    city = searchCityEl.val();
    currentWeather(city);
  }
}

function currentWeather(city) {
  // Here we build the url so we can get data from server-side
  var queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  // created the AJAX call
  $.ajax(queryUrl, { method: 'GET' }).then(function (response) {
    // parse the response to display the current weather including the city name, date and the weather icon
    console.log(response);

    // weather icon
    var weatherIcon = response.weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

    // current date
    var date = moment().format('L');
    $('#current-date').text(`(${date})`);

    // current city and concanating the date and icon
    var currentCity = $('#current-city');
    $(currentCity).html(`${response.name} (${date})<img src=${iconUrl}>`);

    // temperature, converted to fahrenheit
    var tempInputEl = $('#temp-input');
    var tempF = response.main.temp;
    $(tempInputEl).html(tempF + ' °F');

    // wind-speed, converted to MPH
    var windInputEl = $('#wind-input');
    var ws = response.wind.speed;
    $(windInputEl).html(ws + ' MPH');

    // humidity
    var humidityInputEl = $('#humidity-input');
    $(humidityInputEl).html(response.main.humidity + '%');

    // Display UVIndex.
    // By Geographic coordinates method and using appid and coordinates as a parameter, we are going to build uv query url inside the function below
    uvIndex(response.coord.lon, response.coord.lat);
    forecast(response.id);
    if (response.cod == 200) {
      sCity = JSON.parse(localStorage.getItem('cityname'));
      console.log(sCity);
      if (sCity == null) {
        sCity = [];
        sCity.push(city.toUpperCase());
        localStorage.setItem('cityname', JSON.stringify(sCity));
        addToList(city);
      } else {
        if (findCity(city) > 0) {
          sCity.push(city.toUpperCase());
          localStorage.setItem('cityname', JSON.stringify(sCity));
          addToList(city);
        }
      }
    }
  });
}

// This function returns the uvIndex response
function uvIndex(lon, lat) {
  // url for uvIndex
  var uvUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;
  $.ajax(uvUrl, {
    method: 'GET',
  }).then(function (response) {
    $(uvInputEl).html(response.value);
  });
}

// Display 5 days forecast for the current city
function forecast(cityid) {
  var queryForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?id=${cityid}&units=imperial&appid=${apiKey}`;
  $.ajax(queryForecastUrl, {
    method: 'GET',
  }).then(function (response) {
    for (i = 0; i < 5; i++) {
      var date = new Date(
        response.list[(i + 1) * 8 - 1].dt * 1000
      ).toLocaleDateString();
      var iconCode = response.list[(i + 1) * 8 - 1].weather[0].icon;
      var iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
      var tempK = response.list[(i + 1) * 8 - 1].main.temp;
      var tempF = tempK;
      var winds = response.list[(i + 1) * 8 - 1].wind.speed;
      var humidity = response.list[(i + 1) * 8 - 1].main.humidity;

      $(`#date${i}`).html(date);
      $(`#img${i}`).html(`<img src = ${iconUrl}>`);
      $(`#temp${i}`).html(`${tempF} °F`);
      $(`#wind${i}`).html(`${winds} MPH`);
      $(`#humidity${i}`).html(`${humidity}%`);
    }
  });
}

// dynamically add the passed city on the search history
function addToList(c) {
  var listEl = $(`<li>${c}</li>`);
  $(listEl).attr('class', 'list-group-item');
  $(listEl).attr('data-value', c);
  $('.list-group').append(listEl);
}

// display past search
function invokePastSearch(event) {
  var liEl = event.target;
  if (event.target.matches('li')) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

// render function
function loadLastCity() {
  $('ul').empty();
  var sCity = JSON.parse(localStorage.getItem('cityname'));
  if (sCity !== null) {
    sCity = JSON.parse(localStorage.getItem('cityname'));
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    city = sCity[i - 1];
    currentWeather(city);
  }
}

// clear search history
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem('cityname');
  document.location.reload();
}

// Click Handlers
$('#search-button').on('click', displayWeather);
$(document).on('click', invokePastSearch);
$(window).on('load', loadLastCity);
$('#clear-history').on('click', clearHistory);
