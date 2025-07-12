import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const GEOCODING_API = "http://api.openweathermap.org/geo/1.0";
const OPEN_ELE_API = "https://api.open-elevation.com";
const OPEN_UV_API = "https://api.openuv.io/api/v1";

const GEOCODING_API_KEY = "1a434e6cbb7cb0ce4aacf6a9f7118489";
const OPEN_UV_API_KEY = "openuv-1yi1qb5rmcoed0c6-io ";
const searchLimit = 10;

const open_uv_api_config = {
  headers: {
    "x-access-token": OPEN_UV_API_KEY,
  },
};

async function getGeolocation(location) {
  //this is to get the longitude and latitude of the location using open weather's geocoding api
  try {
    const result = await axios.get(
      `${GEOCODING_API}/direct?q=${location}&limit=${searchLimit}&appid=${GEOCODING_API_KEY}`
    );

    const searchData = result.data;

    //filter the result to have country PH only
    const filterSearchData = searchData.filter((data) => {
      return data.country === "PH";
    });

    //send the filtered data back to the browser
    return filterSearchData;
  } catch (error) {
    console.log(
      "Something went wrong with the GEOCODING API response:",
      error.response.status
    );
  }
}

async function getElevation(latitude, longitude) {
  try {
    const result = await axios.get(
      `${OPEN_ELE_API}/api/v1/lookup?locations=${latitude},${longitude}`
    );

    return result.data.results[0].elevation;
  } catch (error) {
    console.error(
      "Something went wrong with the OPEN ELEVATION API request:",
      error.response.data
    );
  }
}

async function getUVindex(latitude, longitude, elevation) {
  try {
    const result = await axios.get(
      `${OPEN_UV_API}/uv?lat=${latitude}&lng=${longitude}&alt=${elevation}`,
      open_uv_api_config
    );

    return result.data;
  } catch (error) {
    console.error(
      "Something went wrong with the OPEN UV API request:",
      error.response.data
    );
  }
}

async function defaultCity() {
  const manila = {
    latitude: 14.5948914,
    longitude: 120.9782618,
    elevation: 10.0,
  };

  const { latitude, longitude, elevation } = manila;

  return await getUVindex(latitude, longitude, elevation);
}

function spfMessage(level) {
  let message;

  if (level < 3) {
    message = "✅ You're good to go. No SPF needed for now.";
  } else if (level >= 3 && level <= 5) {
    message = "👒 UV index level is MODERATE. Wear your SPF!";
  } else if (level >= 6 && level <= 7) {
    message = "😾 UV index level is HIGH. Wear your SPF!";
  } else if (level >= 8 && level <= 10) {
    message = "🔥 UV index level is VERY HIGH. Wear your SPF!";
  } else if (level >= 11) {
    message = "😟 UV index level is EXTREME. Wear your SPF!";
  } else {
    message = "Something went wrong with the website.";
  }

  return message;
}

function formatTime(utcTime) {
  const formatOptions = {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return new Date(utcTime).toLocaleString("en-US", formatOptions);
}

// this function is to get the OPEN UV api's sun time from the sun_info object
function getSunTime(sunInfo) {
  const { sunrise, solarNoon, goldenHour, sunset } = sunInfo.sun_times;

  const formatted_sun_times = {
    fsunrise: formatTime(sunrise),
    fsolarNoon: formatTime(solarNoon),
    fgoldenHour: formatTime(goldenHour),
    fsunset: formatTime(sunset),
  };

  //this will get the formatted time without the date since it is not needed!
  Object.keys(formatted_sun_times).forEach((key) => {
    const [, sun_time] = formatted_sun_times[key].split(" at ");
    formatted_sun_times[key] = sun_time;
  });

  return formatted_sun_times;
}

//this function checks if burn time returns null or not
function burnTimeNullChecker(burnTime) {
  Object.keys(burnTime).forEach((time) => {
    if (burnTime[time] === null) {
      burnTime[time] = "No burn";
    }
  });
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const defaultUV_data = await defaultCity();
  const defaultMessage = spfMessage(defaultUV_data.result.uv);
  const defaultTime = formatTime(defaultUV_data.result.uv_time);
  const defaultBurnTime = defaultUV_data.result.safe_exposure_time;
  const defaultSunTime = getSunTime(defaultUV_data.result.sun_info);

  burnTimeNullChecker(defaultBurnTime);
  console.log("burn time", defaultBurnTime);

  res.render("homepage", {
    data: defaultUV_data.result,
    location: "Manila, Philippines",
    message: defaultMessage,
    time: defaultTime,
    burnTime: defaultBurnTime,
    sunPhaseTime: defaultSunTime,
  });
});

app.get("/about", (req, res) => {
  res.render("aboutpage");
});

app.get("/search", async (req, res) => {
  const location = req.query.location;

  const geolocation = await getGeolocation(location);
  res.json(geolocation);
});

app.get("/search/geocoord", async (req, res) => {
  const { lat, lon, name, state } = req.query;
  const elevation = await getElevation(lat, lon);
  const data = await getUVindex(lat, lon, elevation);

  const UV_data = data.result;
  const location = `${name}, ${state === "undefined" ? "Philippines" : state}`;
  const message = spfMessage(UV_data.uv);
  const dateTime = formatTime(UV_data.uv_time);
  const burnTime = UV_data.safe_exposure_time;
  const sunPhaseTime = getSunTime(UV_data.sun_info);

  burnTimeNullChecker(burnTime);

  res.render("homepage", {
    data: UV_data,
    location,
    message,
    time: dateTime,
    burnTime,
    sunPhaseTime,
  });
});

app.listen(port, () => {
  console.log("Listening in port", port);
});
