import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

const GEOCODING_API = "http://api.openweathermap.org/geo/1.0";
const GEOCODING_API_KEY = "1a434e6cbb7cb0ce4aacf6a9f7118489";
const searchLimit = 10;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/search/geocoord", (req, res) => {
  console.log(req.query);
});

app.get("/search", async (req, res) => {
  const location = req.query.location;

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

    console.log("data:", filterSearchData);

    //send the filtered data back to the browser
    res.json(filterSearchData);
  } catch (error) {
    console.log(
      "Something went wrong with the API response:",
      error.response.status
    );
  }
});

app.listen(port, () => {
  console.log("Listening in port", port);
});
