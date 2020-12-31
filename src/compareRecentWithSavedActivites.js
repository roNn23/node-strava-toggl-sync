const stravaApi = require("strava-v3");
const deepEqual = require("deep-equal");

const compareRecentWithSavedActivites = async (
  recentActivities,
  savedActivities
) => {
  const activitiesToSave = [...savedActivities];

  recentActivities.map((recentActivity) => {
    const { id, name } = recentActivity;
    const correspondingSavedActivity = savedActivities.find(
      (x) => x.strava.id === id
    );

    if (!correspondingSavedActivity) {
      console.log(`⏬ activity "${name}" (${id}) is new`);
      activitiesToSave.push({ strava: recentActivity, toggl: null });
    } else if (!deepEqual(recentActivity, correspondingSavedActivity.strava)) {
      console.log(`🔄 activity "${name}" (${id}) changed`);

      correspondingSavedActivity.strava = recentActivity;
      correspondingSavedActivity.shouldUpdate = true;
    }
  });

  return activitiesToSave;
};

module.exports = compareRecentWithSavedActivites;
