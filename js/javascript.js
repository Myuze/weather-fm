// OpenWeather API key
const apiKey="0ff878aad5849f57a154ff7fa09e8f1a";

// Page Elements
const searchColEl = $('#search-column');
const cityInputEl = $('#city-input');
const searchBtnEl = $('#search-btn');
const cityBtnsEl = $('#city-btns');
const cityContainer = $('#city-container');
const forecastContainerEl = $('#forecast-container');

// User
class User {
  constructor(userName = 'default') {
    this.name = userName,
    this.lastCitySearched = "",
    this.lat = 0,
    this.lon = 0,
    this.searchedCities = [],
    this.isNewUser = true
  }
}

function save(user) {
  // Save User city and saved searched cities to localStorage
  user.isNewUser = false;
  console.log(user, ' SAVED')
  localStorage.setItem('userWeather', JSON.stringify(user));
}

function load() {
  // Load User city and searched cities from localStorage
  let userData = JSON.parse(localStorage.getItem('userWeather'));
  console.log(userData, ' LOADED')
  
  return userData;
}

// Supported Open Weather API Requests
class RequestType {
  constructor(name, urlSegment, params={}) {
    this.name = name;
    this.urlSegment = urlSegment;
    this.params = params;
    this.requestUrl = "";
  }
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

class CurrentWeather {
  constructor(data, name = 'default') {
    this.name = name;
    this.date = data.current.dt;
    this.icon = data.current.weather[0].icon;
    this.temp = data.current.temp;
    this.wind = data.current.wind_speed;
    this.humidity = data.current.humidity;
    this.uvi = data.current.uvi;
    this.uvi_color = this.getUviColor(this.uvi);
  }

  // Fill city container info
  fillCityCurrentContainerInfo() {
    let date = moment(this.date * 1000).format('MM/DD/YY');
    let icon = `http://openweathermap.org/img/wn/${this.icon}@4x.png`
    // Card Elements
    let currentDiv = $('<div>').addClass('current-card-1 card m-2 p-2 border border-1 border-dark');
    let currentDate = $('<h3>').addClass('current-date').text(`${this.name} ${date}`);
    let currentIcon = $('<img>').addClass('current-weather-icon').attr({'src': icon, 'alt': 'Weather Icon', 'width': '10%'});
    let currentTemp = $('<p>').addClass('current-temp').text(`Temp: ${this.temp}°F`);
    let currentWind = $('<p>').addClass('current-wind').text(`Wind: ${this.wind} mph`);
    let currentHumidity = $('<p>').addClass('current-humidity').text(`Humidity: ${this.humidity}%`);
    // Add Uvi with background color
    let currentUvi = $('<p>').addClass('current-uvi').text('UV Index: ');
    let currentUviSpan = $('<span>').text(this.uvi).css({'color': 'white', 'background-color': this.uvi_color, 'padding': '3px 10px', 'border-radius': '5px'});
    currentUvi.append(currentUviSpan);
    // Append Elements to Div
    currentDiv.append(currentDate);
    currentDiv.append(currentIcon);
    currentDiv.append(currentTemp);
    currentDiv.append(currentWind);
    currentDiv.append(currentHumidity);
    currentDiv.append(currentUvi);
    
    return currentDiv;
  }

  getUviColor(uvi) {
    if (uvi < 2) {
      return "green";
      
    } else if (uvi > 2 && uvi < 6) {
      return "yellow";
    
    } else if (uvi > 6 && uvi < 8) {
      return "orange";
    
    } else if (uvi > 7) {
      return "red";
    }
  }
}

// Forecast Card
class ForecastCard {
  constructor(cardName, daily, index) {
    this.name = cardName;
    this.date = daily[index].dt;
    this.icon = daily[index].weather[0].icon;
    this.temp = daily[index].temp.max;
    this.wind = daily[index].wind_speed;
    this.humidity = daily[index].humidity;
  }

  createCard() {
    let date = moment(this.date * 1000).format('MM/DD/YY');
    let icon = `http://openweathermap.org/img/wn/${this.icon}@4x.png`
    // Card Elements
    let cardDiv = $('<div>').addClass('h-100 forecast-card-1 card m-2 border border-1 border-dark').attr('style', "width: 10rem;");
    let cardDate = $('<h3>').addClass('forecast-date').text(date);
    let cardIcon = $('<img>').addClass('card-weather-icon').attr({'src': icon, 'alt': 'Weather Icon'});
    let cardTemp = $('<p>').addClass('card-temp').text(`Temp: ${this.temp}°F`);
    let cardWind = $('<p>').addClass('card-wind').text(`Wind: ${this.wind} mph`);
    let cardHumidity = $('<p>').addClass('card-humidity').text(`Humidity: ${this.humidity}%`);
    // Append Elements to Div
    cardDiv.append(cardDate);
    cardDiv.append(cardIcon);
    cardDiv.append(cardTemp);
    cardDiv.append(cardWind);
    cardDiv.append(cardHumidity);
    
    return cardDiv;
  }
}

// Fill city container info
function fillCityCurrentContainerInfo(cityData) {
  cityContainer.empty();
  let currentCity = new CurrentWeather(cityData, user.lastCitySearched);
  let cityCard = currentCity.fillCityCurrentContainerInfo()
  cityContainer.append(cityCard);
}

// Fill Forecast Data
function fillForecastContainer(data) {
  forecastContainerEl.empty();
  for (day = 0; day < 5; day++) {
    let forecastCard = new ForecastCard(`day${day}`, data.daily, day);
    forecastContainerEl.append(forecastCard.createCard());
  }
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
      return response;
    }

  }).then((data) => {
    console.log('getCoords: ', data);
    console.log(user)
    
    if (data.length < 1 || null == data || data[0].name == undefined) {
      console.log('City Not Found');
      // If not a valid city notify user
      cityInputEl.val("");
      cityInputEl.attr('placeholder', 'Not a valid city');
      setTimeout(() => cityInputEl.attr('placeholder', 'Enter City'), 2000);
      
    } else {
      user.lastCitySearched = data[0].name;
      user.lat = data[0].lat;
      user.lon = data[0].lon;
      if (!user.searchedCities.includes(user.lastCitySearched)) {
        createCitySearchBtn(cityInputEl.val());
        user.searchedCities.push(user.lastCitySearched)
      }
      
      save(user);
      cityInputEl.val("");
      return oneCallRequest(user.lat, user.lon);
    }
  }).catch((err) => {
    console.log(err);
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

  fetch(cityRequest.requestUrl).then(async function (response) {
    if (response.ok) {
      const data = await response.json();
      return data;

    } else {
      alert('Error: ' + response.statusText);
    }
    
  }).then((data) => {
    console.log('oneCall: data', data)
    fillCityCurrentContainerInfo(data)
    fillForecastContainer(data);
    
  }).catch((err) => {
    console.log(err);
  });
}

// Add listener to new city button list
cityBtnsEl.on('click', function(event) {
  event.preventDefault();
  getCoords($(event.target).text());
});

function createCitySearchBtn(cityName) {
  let newListItem = $('<li>').addClass('list-group-item list-group-item-action text-center');
  newListItem.text(cityName);
  cityBtnsEl.prepend(newListItem);
}

// Make OpenWeather API call when search button pressed
searchBtnEl.on('click', function(event) {
  event.preventDefault();
  let cityInput = cityInputEl.val().trim();
  if (cityInput) {
    user.lastCitySearched = cityInput;
    getCoords(cityInput); 

  } else {
    cityInputEl.attr('placeholder', 'Enter a city first!')
    setTimeout(() => cityInputEl.attr('placeholder', 'Enter City'), 2000);
  }
});

// Modal Functions
function verifyGeolocation() {
  var myModal = new bootstrap.Modal(document.getElementById('myModal'))
  myModal.show()
  
  // Modal Geolocation Allow Event
  var allowGeolocationBtn = $('#allow');
  var myModalEl = $('#myModal')
  var closeGeolocationBtn = $('#close');
  
  myModalEl.on('hidden.bs.modal', function (event) {
    myModal.hide()
  });
  
  allowGeolocationBtn.on('click', function (event) {
    // Check if the User allows finding location to get current weather
    if(!navigator.geolocation) {
      // Default Location
      console.log('Geolocation is not supported by your browser.')
  
    } else {
      // Use User's current location
      navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    }
  });

  closeGeolocationBtn.on('click', function (event) {
    myModal.hide();
  })
};

// Geolocation functions
function geolocationSuccess(position) {
  user.lat = position.coords.latitude;
  user.lon = position.coords.longitude;

  $('#modal-txt').text(`Lat: ${user.lat}, Lon: ${user.lon}`)

  oneCallRequest(user.lat, user.lon);
}

function geolocationError() {
  console.log('Unable to retrieve your location');
  cityContainer.text("Allow Geolocation for your location's current weather.");
}

// Get existing search data on load
var user = load();
console.log(user)
if (null === user) {
  user = new User();
  verifyGeolocation();

} else {

  user.searchedCities.forEach(city => {
    createCitySearchBtn(city);
  });
  getCoords(user.lastCitySearched)
}
