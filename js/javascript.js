// OpenWeather API key
const apiKey="";

// Page Elements
const searchColEl = $('#search-column');
const cityInputEl = $('#city-input')
const searchBtnEl = $('#search-btn');
const cityBtnsEl = $('#city-btns');

// User Object
const user = {
  city: "",
  lat: 0,
  lon: 0,
  searchedCities: [],

  save: function() {
    // Save user city and saved searched cities to localStorage
    localStorage.setItem('user', JSON.stringify(this.user));
  },

  load: function() {
    // Load user city and searched cities from localStorage
    this.user = localStorage.getItem('user');
    return this.user;
  }
}

// OpenWeather API Objects
const openWeatherApi = {
  baseUrl: "https://api.openweathermap.org/data/2.5/",

  // Supported Open Weather API Request Objects
  // Current Weather Data Request
  currentWeatherRequest: {
    urlSegment: 'weather',
    params: {
      q: 'cityName',
      units: 'imperial'
    },
    data: {}
  },

  // One Call API Request
  oneCallRequest: {
    urlSegment: 'onecall',
    params: {
      lat: 0,
      lon: 0,
      units: 'imperial'
    },
    data: {}
  },

  forecastRequest: {
    urlSegment: 'forecast',
    params: {
      q: 'cityName',
      units: 'imperial'
    },
    data: {}
  },

  createRequestUrl: function(openWeatherRequestObject) {
    let requestUrl = openWeatherApi.baseUrl;
    let paramCount = 0;
    
    // Add Request specified url
    requestUrl += openWeatherRequestObject.urlSegment;
    
    // Add Request specified parameters
    for (let [key, value] of Object.entries(openWeatherRequestObject.params)) {

      if (paramCount < 1) {
        requestUrl += `?${key}=${value}`;
      } else {
        requestUrl += `&${key}=${value}`;
      }
      paramCount++;
    }

    // Add apiKey as last parameter
    requestUrl += `&appid=${apiKey}`

    return requestUrl;
  },

  getRequestData: function(openWeatherRequestObject) {
    let requestUrl = openWeatherApi.createRequestUrl(openWeatherRequestObject);
    
    apiCall(requestUrl).then(data => {
      openWeatherRequestObject.data = data;
    });
  }
}

// City Container Elements
const currentCityEl = $('#city-current-weather');
const currentTempEl = $('#current-temp');
const currentWindEl = $('#current-wind');
const currentHumidityEl = $('#current-humidity');
const currentUvindexEl = $('#current-uv-index');

// Fill city container info
function fillCityContainerInfo(cityData) {
  // TODO: Fill city container info
  console.log('cityData: ', cityData)
  currentCityEl.text(cityData.name);
  currentTempEl.text('Temp: ' + cityData.main.temp + '°F');
  currentWindEl.text('Wind: ' + cityData.wind.speed + 'mph');
  currentHumidityEl.text('Humidity: ' + cityData.main.humidity + '%');
  currentUvindexEl.text('UV Index: ' + cityData.main.temp);
  
  console.log('CITY INFO FILLED');
}

// Create a city weather request
function createCityRequest(request) {  
  openWeatherApi.getRequestData(request);

  return request;
}

// Add listener to new city button list
cityBtnsEl.on('click', function(event) {
  createCityRequest($(event.target).text());
});

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function() {
  let newListItem = $('<li>').addClass('list-group-item list-group-item-action text-center');
  let request = openWeatherApi.forecastRequest;
  request.params.q = cityInputEl.val();

  if (cityInputEl.val().replace(/\s+/g, '') != "") {
    // Create searched city button and clear field
    newListItem.text(cityInputEl.val());
    
    // createCityRequest(cityInputEl.val());
    openWeatherApi.getRequestData(request);

    console.log('cod', request.data.cod)
    
    if (request.data.cod === 404) {
      cityInputEl.attr('placeholder', 'City Does Not Exist!')
    } else if (request.data.cod == 200) {
      cityBtnsEl.prepend(newListItem);
    } else {
      return;
    }

    fillCityContainerInfo(request.data);

    cityInputEl.val("");
  }
})

// Function to create API call using fetch
async function apiCall(baseUrl, params = {}) {
  let paramsString = ""

  // Add additional params if provided
  if (params != null) {
    for (let [key, value] of Object.entries(params)) {
      paramsString += `&${key}=${value}`;
    }
  };

  let requestUrl = baseUrl + paramsString;

  try {
    const response = await fetch(requestUrl);
    if (!response.status == 200) {
      console.log(response.status)
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

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

  let request = openWeatherApi.oneCallRequest;
  request.params.lat = user.lat;
  request.params.lon = user.lon;
  
  var myModal = new bootstrap.Modal(document.getElementById('myModal'))
  myModal.show()
  
  $('#modal-txt').text(`Lat: ${user.lat}, Lon: ${user.lon}`)

  var myModalEl = document.getElementById('myModal')
  myModalEl.addEventListener('hidden.bs.modal', function (event) {
    myModal.hide()
  })

  openWeatherApi.getRequestData(request);
}

function geolocationError() {
  console.log('Unable to retrieve your location');
}

// Main
displayCurrentForecast(openWeatherApi.oneCallRequest.data);
