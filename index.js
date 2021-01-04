if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const login = require("./src/login");
const startServer = require("./src/server");
const fetchAllStravaActivities = require("./src/fetchAllStravaActivities");
const compareRecentWithSavedActivites = require("./src/compareRecentWithSavedActivites");
const syncToToggl = require("./src/syncToToggl");
const { setupDb, db } = require("./src/database");
const stravaApi = require("strava-v3");

const getActivitiesToSync = () => {
  return db
    .get("activities")
    .filter((x) => {
      return !x.toggl || x.shouldUpdate;
    })
    .value();
};

const getDbHandleByActivityId = (id) => {
  return db.get("activities").find((x) => x.strava.id === id);
};

const handleSyncedActivity = (activity, togglData) => {
  const activityDbHandle = getDbHandleByActivityId(activity.id);
  activityDbHandle
    .assign({ toggl: togglData, shouldUpdate: undefined })
    .write();
};

const fetchAndSaveAllActivities = async (accessToken) => {
  console.log("Could not find local strava data, fetching whole history");
  const activities = await fetchAllStravaActivities(accessToken);

  db.get("activities").assign(activities).write();

  console.log(`Fetched ${activities.length} activities`);
};

const updateActivities = async (accessToken, activitiesInDatabase) => {
  console.log(
    `Found ${activitiesInDatabase.length} strava activities in local database, will check for new or changed items`
  );

  const strava = new stravaApi.client(accessToken);
  const recentActivities = await strava.athlete.listActivities({});

  const activities = await compareRecentWithSavedActivites(
    recentActivities,
    activitiesInDatabase
  );

  db.get("activities").assign(activities).write();
};

const syncActivities = async () => {
  const activitiesToSync = getActivitiesToSync();

  console.log(
    `${activitiesToSync.length} ${
      activitiesToSync.length === 1 ? "activity" : "activities"
    } to sync`
  );

  if (activitiesToSync.length > 0) {
    await syncToToggl(activitiesToSync, handleSyncedActivity);
  }
};

const onLoadedStravaUserData = async (userData) => {
  const accessToken = userData.access_token;
  let activitiesInDatabase = db.get("activities").value();

  if (activitiesInDatabase.length === 0) {
    await fetchAndSaveAllActivities(accessToken);
  } else {
    await updateActivities(accessToken, activitiesInDatabase);
  }

  await syncActivities();

  process.exit();
};

const init = async () => {
  console.log(`Starting @ ${new Date()}`);
  setupDb();
  startServer(onLoadedStravaUserData);
  login();
};

try {
  init();
} catch (error) {
  console.log("Whoops, there was an error:");
  console.log(error);
  process.exit();
}
