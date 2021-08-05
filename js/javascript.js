// OpenWeather API key
const apiKey="0ff878aad5849f57a154ff7fa09e8f1a";

// Page Elements
const searchColEl = $('#search-column');
const cityInputEl = $('#city-input')
const searchBtnEl = $('#search-btn');
const cityBtnsEl = $('#city-btns');

// User Object
var user = {
  lastCitySearched: "",
  lat: 0,
  lon: 0,
  searchedCities: [],

  save: function() {
    // Save user city and saved searched cities to localStorage
    console.log(this)
    localStorage.setItem('user', JSON.stringify(this));
  },

  load: function() {
    // Load user city and searched cities from localStorage
    user = JSON.parse(localStorage.getItem('user'));
    console.log(user)
    
    return user;
  }
}

// Supported Open Weather API Request Constructor
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

// Fill city container info
function fillCityContainerInfo(cityData) {
  let date = moment(cityData.dt * 1000).format('MM/DD/YY')
  let icon = `http://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png`
  console.log('cityData: ', cityData)
  currentCityEl.text(cityData.name + ` (${date})`);
  currentIconEl.attr({'src': icon, 'alt': 'Weather Icon'});
  currentTempEl.text('Temp: ' + cityData.main.temp + '°F');
  currentWindEl.text('Wind: ' + cityData.wind.speed + 'mph');
  currentHumidityEl.text('Humidity: ' + cityData.main.humidity + '%');
  currentUvindexEl.text('UV Index: ' + cityData.main.temp);
}

// Create a Geocoding request
function getCoords(cityName) {
  let params = {
    q: cityName,
    limit: 1
  } 
  const cityRequest = new RequestType('getCoords', 'geo/1.0/direct', params);
  openWeatherApi.createRequestUrl(cityRequest);

  fetch(cityRequest.requestUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        console.log('getCoords: ', data[0])
        user.lastCitySearched = data[0].name;
        user.lat = data[0].lat;
        user.lon = data[0].lon;
        if (!user.searchedCities.includes(data[0].name)) {
          user.searchedCities.push(data[0].name)
          oneCallRequest(user.lat, user.lon)
        }
        user.save();
      });
    } else {
      alert('Error: ' + response.statusText);
    }
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

  fetch(cityRequest.requestUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        fillCityContainerInfo(data);
        user.lastCitySearched = data.name;
        user.lat = data.coord.lat;
        user.lon = data.coord.lon;
        if (!user.searchedCities.includes(data.name)) {
          user.searchedCities.push(data.name)
        }
        user.save();
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  });
}

// Create a oneCallRequest
function oneCallRequest(lat, lon) { 
  let params = {
    lat: lat,
    lon: lon,
    units: 'imperial'
  } 
  const cityRequest = new RequestType('oneCall', 'data/2.5/onecall', params);
  openWeatherApi.createRequestUrl(cityRequest);

  fetch(cityRequest.requestUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        fillCityContainerInfo(data);
        console.log('oneCall: ', data)
        user.lastCitySearched = data.name;
        user.lat = data.coord.lat;
        user.lon = data.coord.lon;
        if (!user.searchedCities.includes(data.name)) {
          user.searchedCities.push(data.name)
        }
        user.save();
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  });
}

// Add listener to new city button list
cityBtnsEl.on('click', function(event) {
  event.preventDefault();
  let request = createCityRequest($(event.target).text());
  fillCityContainerInfo(request.data)
  console.log('CityBtnClickRequest: ', request)
});

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function(event) {
  event.preventDefault();
  let newListItem = $('<li>').addClass('list-group-item list-group-item-action text-center');
  
  if (cityInputEl.val().replace(/\s+/g, '') != "" || !user.searchedCities.includes(cityInputEl.val())) {
    // Create searched city button and clear field
    // createCityRequest(cityInputEl.val());
    getCoords(cityInputEl.val());
    newListItem.text(cityInputEl.val());
    
    // if (storedData.cod === 404) {
    //   cityInputEl.attr('placeholder', 'City Does Not Exist!')
    // } else if (request.data.cod == 200) {
    cityBtnsEl.prepend(newListItem);
    // } else {
    //   return;
    // }
    // console.log(storedData)

    cityInputEl.val("");
  }
})

// Modal Functions
const currentBtn = $('#current-btn');

currentBtn.on('click', function(event) {
  
  // Check if the user allows finding location to get current weather
  if(!navigator.geolocation) {
    // Default Location
    console.log('Geolocation is not supported by your browser.')
  } else {
    // Use user's current location
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

  oneCallRequest(user.lat, user.lon);
}

function geolocationError() {
  console.log('Unable to retrieve your location');
}
console.log(user)
user.load()