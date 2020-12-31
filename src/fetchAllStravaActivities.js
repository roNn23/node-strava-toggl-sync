const stravaApi = require("strava-v3");

const fetchAllStravaActivities = async (stravaAccessToken) => {
  const strava = new stravaApi.client(stravaAccessToken);
  let allActivities = [];
  let activitiesPerPage;
  let page = 1;

  do {
    activitiesPerPage = await strava.athlete.listActivities({
      page: page,
      per_page: 100,
    });
    activitiesPerPage.map((activityData) => {
      allActivities.push({
        strava: activityData,
        toggl: null,
        shouldUpdate: true,
      });
    });
    console.log(`loaded ${activitiesPerPage.length} activites`);
    page = page + 1;
  } while (activitiesPerPage.length === 100);

  return allActivities;
};

module.exports = fetchAllStravaActivities;
