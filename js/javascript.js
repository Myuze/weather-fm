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
    data: {},
  },

  // One Call API Request
  oneCallRequest: {
    urlSegment: 'onecall',
    params: {
      lat: 0,
      lon: 0,
    },
    data: {},
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

  getData: function(openWeatherRequestUrl) {

  }
}

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function(event) {
  var cityName = cityInputEl.val()
  var baseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  let newListItem = $('<li>').addClass('list-group-item text-center');
  
  if (cityInputEl.val().replace(/\s+/g, '') != "") {
    newListItem.text(cityInputEl.val());
    cityBtnsEl.prepend(newListItem);
    
    apiCall(baseUrl).then(data => {
      oneCallObject.data = data;
      console.log(data)
    });
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

// Geolocation functions
function geolocationSuccess(position) {
  user.lat = position.coords.latitude;
  user.lon = position.coords.longitude;

  let request = openWeatherApi.oneCallRequest;
  request.params.lat = user.lat;
  request.params.lon = user.lon;

  var requestUrl = openWeatherApi.createRequestUrl(request);

  apiCall(requestUrl).then(data => {
    request.data = data;
  });
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