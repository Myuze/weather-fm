// OpenWeather API key
const apiKey="0ff878aad5849f57a154ff7fa09e8f1a";

// Page Elements
const searchColEl = $('#search-column');
const cityInputEl = $('#city-input')
const searchBtnEl = $('#search-btn');
const cityBtnsEl = $('#city-btns');

// User
function User(userName = 'default') {
  this.name = userName,
  this.lastCitySearched = "",
  this.lat = 0,
  this.lon = 0,
  this.searchedCities = [],
  this.isNewUser = true,

  this.save = function() {
    // Save User city and saved searched cities to localStorage
    this.isNewUser = false;
    console.log(this)
    localStorage.setItem('user', JSON.stringify(this));
  },

  this.load = function() {
    // Load User city and searched cities from localStorage
    let userData = JSON.parse(localStorage.getItem('user'));
    console.log(userData)
    
    return userData;
  }
}

// Supported Open Weather API Requests
function RequestType(name, urlSegment, params={}) {
  this.name = name,
  this.urlSegment = urlSegment,
  this.params = params,
  this.requestUrl = "",
  this.data = {}
}

// OpenWeather API Objects
const openWeatherApi = {
  baseUrl: "https://api.openweathermap.org/",

  // Create Request URL, takes RequestType objects
  createRequestUrl: function(requestTypeObject) {
    let requestUrl = openWeatherApi.baseUrl;
    let paramCount = 0;
    
    // Add Request specified url
    requestUrl += requestTypeObject.urlSegment;
    
    // Add Request specified parameters
    for (let [key, value] of Object.entries(requestTypeObject.params)) {

      if (paramCount < 1) {
        requestUrl += `?${key}=${value}`;
      } else {
        requestUrl += `&${key}=${value}`;
      }
      paramCount++;
    }

    // Add apiKey as last parameter
    requestUrl += `&appid=${apiKey}`

    // Add requestUrl to RequestType
    requestTypeObject.requestUrl = requestUrl;

    return requestUrl;
  }
}

// City Container Elements
const currentCityEl = $('#city-current-weather');
const currentIconEl = $('#w-icon');
const currentTempEl = $('#current-temp');
const currentWindEl = $('#current-wind');
const currentHumidityEl = $('#current-humidity');
const currentUvindexEl = $('#current-uv-index');

function CurrentWeather(data) {
  this.name = "",
  this.date = data.dt,
  this.icon = "",
  this.temp = 0,
  this.wind = 0,
  this.humidity = 0,
  this.uvi = 0,
  this.uvi_color = ""
}

function ForecastCard(data) {
  this.name = "",
  this.date = data.dt,
  this.icon = "",
  this.temp = 0,
  this.wind = 0,
  this.humidity = 0
}

// Fill city container info
function fillCityContainerInfo(cityData) {
  console.log('cityData::fill: ', cityData)
  let date = moment(cityData.dt * 1000).format('MM/DD/YY')
  let icon = `http://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png`
  currentCityEl.text(cityData.name + ` (${date})`);
  currentIconEl.attr({'src': icon, 'alt': 'Weather Icon'});
  currentTempEl.text('Temp: ' + cityData.main.temp + '°F');
  currentWindEl.text('Wind: ' + cityData.wind.speed + ' mph');
  currentHumidityEl.text('Humidity: ' + cityData.main.humidity + '%');
  currentUvindexEl.text('UV Index: ' + cityData.main.temp);
}

// Fill city container info
function fillCityCurrentContainerInfo(cityData) {
  console.log('cityData::fill: ', cityData)
  let date = moment(cityData.current.dt * 1000).format('MM/DD/YY')
  let icon = `http://openweathermap.org/img/wn/${cityData.current.weather[0].icon}@2x.png`
  currentCityEl.text(user.lastCitySearched + ` (${date})`);
  currentIconEl.attr({'src': icon, 'alt': 'Weather Icon'});
  currentTempEl.text('Temp: ' + cityData.current.temp + '°F');
  currentWindEl.text('Wind: ' + cityData.current.wind_speed + ' mph');
  currentHumidityEl.text('Humidity: ' + cityData.current.humidity + '%');
  currentUvindexEl.text('UV Index: ' + cityData.current.uvi);
}

// Create a Geocoding request
function getCoords(cityName) {
  let params = {
    q: cityName,
    limit: 1
  } 
  const cityRequest = new RequestType('getCoords', 'geo/1.0/direct', params);
  openWeatherApi.createRequestUrl(cityRequest);

  fetch(cityRequest.requestUrl).then(async (response) => {
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert('Error: ' + response.statusText);
    }

  }).then((data) => {
    console.log('getCoords: ', data);
    console.log(user)
    user.lastCitySearched = data[0].name;
    console.log('user::Fetch: ', user.lastCitySearched)
    user.lat = data[0].lat;
    user.lon = data[0].lon;
    if (!user.searchedCities.includes(data[0].name)) {
      user.searchedCities.push(data[0].name);
    }
    oneCallRequest(user.lat, user.lon);
    user.save();
  }).catch((err) => {
    console.log(err);
  });
}

// Create a city weather request
function createCityRequest(city) { 
  let params = {
    q: city,
    units: 'imperial'
  } 
  const cityRequest = new RequestType('cityCurrentWeather', 'data/2.5/weather', params);
  openWeatherApi.createRequestUrl(cityRequest);

  fetch(cityRequest.requestUrl).then(async (response) => {
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert('Error: ' + response.statusText);
    }
    
  }).then((data) => {
    console.log(user)
    console.log('data', data, "data Name: ", data.name)
    user.lastCitySearched = data.name;
    console.log('user::Fetch: ', user.lastCitySearched)
    user.lat = data.coord.lat;
    user.lon = data.coord.lon;
    if (!user.searchedCities.includes(data.name)) {
      user.searchedCities.push(data.name);
    }
    fillCityContainerInfo(data);
    console.log('before save: ', user)
    user.save();
    }).catch((err) => {
      console.log(err)
    });
}

// Create a oneCallRequest
function oneCallRequest(lat, lon) { 
  let params = {
    'lat': lat,
    'lon': lon,
    units: 'imperial'
  } 
  const cityRequest = new RequestType('oneCall', 'data/2.5/onecall', params);
  openWeatherApi.createRequestUrl(cityRequest);

  return fetch(cityRequest.requestUrl).then(async function (response) {
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert('Error: ' + response.statusText);
    }
  }).then((data) => {
    console.log('oneCall: data', data)
    fillCityCurrentContainerInfo(data)
  }).catch((err) => {
    console.log(err);
  });
}

// Add listener to new city button list
cityBtnsEl.on('click', function(event) {
  event.preventDefault();
  createCityRequest($(event.target).text());
});

function createCitySearchBtn(cityName) {
  let newListItem = $('<li>').addClass('list-group-item list-group-item-action text-center');
  getCoords(cityName);
  newListItem.text(cityName);
  cityBtnsEl.prepend(newListItem);
}

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function(event) {
  event.preventDefault();
  let cityInput = cityInputEl.val().replace(/\s+/g, '');
  
  if (cityInput != null || cityInput != "") {
    // if (user.searchedCities.length < 1 
    //   && !user.searchedCities.includes(cityInputEl.val())) {
    //   console.log("user", user.searchedCities)
    createCitySearchBtn(cityInputEl.val());
      
      // Create searched city button and clear field
      // if (storedData.cod === 404) {
      //   cityInputEl.attr('placeholder', 'City Does Not Exist!')
      // } else if (request.data.cod == 200) {
      // } else {
      //   return;
      // }
      // console.log(storedData)

      cityInputEl.val("");
    // }
  }
})

// Modal Functions
const currentBtn = $('#current-btn');

currentBtn.on('click', function(event) {
  
  // Check if the User allows finding location to get current weather
  if(!navigator.geolocation) {
    // Default Location
    console.log('Geolocation is not supported by your browser.')
  } else {
    // Use User's current location
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
  }
})

// Set Current location, or default location if geolocation unavailable
function displayCurrentForecast(data) {
  // TODO: Add logic to fill out City Container
  // TODO: Add logic to fill out 5-Day Forecast cards
  console.log(data)
}

// Geolocation functions
function geolocationSuccess(position) {
  user.lat = position.coords.latitude;
  user.lon = position.coords.longitude;

  let request = new RequestType('oneCallRequest', 'data')
  request.params.lat = user.lat;
  request.params.lon = user.lon;
  
  var myModal = new bootstrap.Modal(document.getElementById('myModal'))
  myModal.show()
  
  $('#modal-txt').text(`Lat: ${user.lat}, Lon: ${user.lon}`)

  var myModalEl = document.getElementById('myModal')
  myModalEl.addEventListener('hidden.bs.modal', function (event) {
    myModal.hide()
  })

  var oneCallData = getCoords(user.lat, user.lon);
  console.log('oneCallData: ', oneCallData)

}

function geolocationError() {
  console.log('Unable to retrieve your location');
}

// Get existing search data on load
var user = JSON.parse(localStorage.getItem('user'));
console.log(user)
if (user === null) {
  user = new User();
} else {
  user.searchedCities.forEach(city => {
    createCitySearchBtn(city);
  });
}
