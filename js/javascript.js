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
    data = {}
  },

  

}

var cityName = "Sacramento"
var baseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
var data = apiCall(baseUrl).then(data => {

  console.log(data)
});

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