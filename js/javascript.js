// OpenWeather API key
const apiKey="61ce7ec07d8e7664715edbc6c971c6f8";

// OpenWeather API Object
var openWeatherApi = {
  baseUrl: "https://api.openweathermap.org/data/2.5/",
  currentWeather: {
    url: 'weather',
    params: {
      cityName: "",
    },
    data: {}
  },
  oneCall: {
    url: 'onecall',
    params: {
      lat: 0,
      lon: 0,
      exclude: ""
    },
    data: {},

    getFiveDayForecast: function() {
      // Parse Forcast Data per Card
    }
  }
}

const searchColEl = $('#search-column');
const cityInputEl = $('#city-input')
const searchBtnEl = $('#search-btn');
const cityBtnsEl = $('#city-btns');
const oneCallObject = openWeatherApi.oneCall;

console.log('oneCallObject.data: ', oneCallObject.data)

searchBtnEl.on('click', function(event) {
  var cityName = cityInputEl.val()
  var baseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
  let newListItem = $('<li>').addClass('list-group-item');

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
      // TODO: 404 Redirect
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}