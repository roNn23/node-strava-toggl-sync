if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const http = require("http");
const https = require("https");
const getPort = require("get-port");

const stravaMail = process.env.STRAVA_LOGIN_MAIL;
const stravaPassword = process.env.STRAVA_LOGIN_PASSWORD;
const stravaClientID = process.env.STRAVA_CLIENT_ID;
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;

const loadStravaData = (code, onLoadedData) => {
  var options = {
    hostname: "www.strava.com",
    port: 443,
    path: `/oauth/token?client_id=${stravaClientID}&client_secret=${stravaClientSecret}&code=${code}&grant_type=authorization_code`,
    method: "POST",
  };

  var req = https.request(options, function (res) {
    res.setEncoding("utf8");
    res.on("data", async (chunk) => {
      console.log(`🖥  loaded strava data`);

      const data = JSON.parse(chunk);

      onLoadedData(data);
    });
  });

  req.on("error", function (e) {
    console.log("problem with request: " + e);
  });

  req.end();
};

const listenForExchangeToken = function (req, res, onLoadedData, host) {
  const url = req.url;

  res.writeHead(200);
  res.end();

  if (url.match("exchange_token")) {
    const parsedUrl = new URL(`http://${host}${url}`);
    const code = parsedUrl.searchParams.get("code");

    console.log(`🖥  got the auth code`);

    loadStravaData(code, onLoadedData);
  }
};

module.exports = async (host, port, onLoadedData) => {
  const server = http.createServer((req, res) => {
    listenForExchangeToken(req, res, onLoadedData, host);
  }, onLoadedData);

  server.listen(port, host, () => {
    console.log(`🖥  Server is running on http://${host}:${port}`);
  });
};
