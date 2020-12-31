const axios = require("axios");

const apiKey = process.env.TOGGL_API_KEY;
const userAgent = process.env.TOGGL_USER_AGENT;
const workspaceId = process.env.TOGGL_WORKSPACE_ID;

exports.addTimeEntry = (timeEntry) => {
  const togglEndpoint = "https://www.toggl.com/api/v8/time_entries";
  const axiosUrl = togglEndpoint;

  const axiosOptions = {
    auth: {
      username: apiKey,
      password: "api_token",
    },
  };

  return axios
    .post(
      axiosUrl,
      {
        time_entry: timeEntry,
      },
      axiosOptions
    )
    .then((response) => {
      console.log(`⏰ Toggl Add: ${timeEntry.description}`);
      return response.data.data;
    })
    .catch(({ message }) => console.log("❌ ERROR", message));
};

exports.updateTimeEntry = (entryId, timeEntry) => {
  const togglEndpoint = `https://www.toggl.com/api/v8/time_entries/${entryId}`;
  const axiosUrl = togglEndpoint;

  const axiosOptions = {
    auth: {
      username: apiKey,
      password: "api_token",
    },
  };

  return axios
    .post(
      axiosUrl,
      {
        time_entry: timeEntry,
      },
      axiosOptions
    )
    .then((response) => {
      console.log(`⏰ Toggl (${entryId}) Update: ${timeEntry.description}`);
      return response.data.data;
    })
    .catch(({ message }) => console.log("❌ ERROR", message));
};
