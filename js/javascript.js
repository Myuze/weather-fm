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
    },
    data: {}
  },

  // One Call API Request
  oneCallRequest: {
    urlSegment: 'onecall',
    params: {
      lat: 0,
      lon: 0,
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

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function(event) {
  let newListItem = $('<li>').addClass('list-group-item text-center');
  
  if (cityInputEl.val().replace(/\s+/g, '') != "") {
    // Create searched city button and clear field
    newListItem.text(cityInputEl.val());
    cityBtnsEl.prepend(newListItem);
    
    // Create a city weather request
    let request = openWeatherApi.currentWeatherRequest;
    request.params.q = cityInputEl.val();
    console.log('click:request', request)    
    openWeatherApi.getRequestData(request);
    cityInputEl.val("")
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

// Set Current location, or default location if geolocation unavailable
function displayCurrentWeather() {
  // TODO: Add logic to fill out City Container
  // TODO: Add logic to fill out 5-Day Forecast cards
}

// Geolocation functions
function geolocationSuccess(position) {
  user.lat = position.coords.latitude;
  user.lon = position.coords.longitude;

  let request = openWeatherApi.oneCallRequest;
  request.params.lat = user.lat;
  request.params.lon = user.lon;

  openWeatherApi.getRequestData(request);
}

function geolocationError() {
  console.log('Unable to retrieve your location');
}

// Main
// Check if the user allows finding location to get current weather
if(!navigator.geolocation) {
  // Default Location
  console.log('Geolocation is not supported by your browser.')
} else {
  // Use user's current location
  navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
}

console.log(openWeatherApi.oneCallRequest)