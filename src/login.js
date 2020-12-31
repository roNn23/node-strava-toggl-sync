const fs = require("fs");
const puppeteer = require("puppeteer");
const moment = require("moment");

const { db } = require("./database");

const http = require("http");
const https = require("https");

const stravaMail = process.env.STRAVA_LOGIN_MAIL;
const stravaPassword = process.env.STRAVA_LOGIN_PASSWORD;
const stravaClientID = process.env.STRAVA_CLIENT_ID;
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;

const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;

const stravaAuthUrl = "http://www.strava.com/oauth/authorize";
const stravaAuthScope = "read,activity:read_all";
const stravaAuthRedirectUrl = `http://${serverHost}:${serverPort}/exchange_token`;
const stravaAuthparameters = [
  `client_id=${stravaClientID}`,
  "response_type=code",
  `redirect_uri=${stravaAuthRedirectUrl}`,
  "approval_prompt=force",
  `scope=${stravaAuthScope}`,
];
const stravaAuthFullUrl = `${stravaAuthUrl}?${stravaAuthparameters.join("&")}`;

async function loggedInCheck(page) {
  await page.goto("https://www.strava.com/login");

  if (page.url() === "https://www.strava.com/dashboard") {
    return true;
  }

  return false;
}

async function signIn(page) {
  console.log(`🔑 Logging in with user ${stravaMail}`);

  let cookieData = db.get("cookies").value();

  let isLoggedIn = false;

  if (cookieData) {
    await page.setCookie(...cookieData);
    isLoggedIn = await loggedInCheck(page);
  }

  if (!isLoggedIn) {
    return await loginOnPage(page);
  }

  console.log(`✅ Login done by cookie 🍪`);
}

async function auth(page) {
  console.log(`🛠 Authenticate user with app`);

  await page.goto(stravaAuthFullUrl);

  await page.click("#authorize");

  await page.waitForNavigation();
}

async function loginOnPage(page) {
  console.log(`🔑 No cookie set or expired, logging in manually`);

  await page.goto("https://www.strava.com/login");

  await page.click("#email");

  await page.keyboard.type(stravaMail);
  await page.click("#password");

  await page.keyboard.type(stravaPassword);
  await page.click("#login-button");

  await page.waitForNavigation();

  const cookies = await page.cookies();

  db.set("cookies", cookies).write();

  console.log(`✅ Login done`);
}

async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--lang=de-DE,de"],
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });

  return { page, browser };
}

module.exports = async () => {
  const { page, browser } = await setupBrowser();

  await signIn(page);
  await auth(page);

  await browser.close();
};
