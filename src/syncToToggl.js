const toggl = require("./toggl");
const delay = require("delay");

const toggleProjectId = process.env.TOGGL_PROJECT_ID;

const syncActivity = async (
  { id, name, type, elapsed_time, start_date },
  togglData
) => {
  const timeEntry = {
    description: `${name} (Strava-ID: ${id})`,
    tags: [`sport:${type.toLowerCase()}`],
    duration: elapsed_time,
    start: start_date,
    pid: toggleProjectId,
    created_with: "none-strava-toggl-sync",
  };

  if (togglData) {
    return await toggl.updateTimeEntry(togglData.id, timeEntry);
  }

  return await toggl.addTimeEntry(timeEntry);
};

const syncToToggl = async (activities, onSyncedActivity) => {
  for (let index = 0; index < activities.length; index++) {
    const { strava, toggl } = activities[index];

    // The toggl API accepts ~ 1 req/second
    await delay(1500);

    const togglData = await syncActivity(strava, toggl);

    onSyncedActivity(strava, togglData);
  }
};

module.exports = syncToToggl;
