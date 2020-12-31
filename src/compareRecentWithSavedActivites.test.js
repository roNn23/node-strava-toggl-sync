const compareRecentWithSavedActivites = require("./compareRecentWithSavedActivites");
const fakeStravaToken = "123456";
const { nanoid } = require("nanoid");

const generateMockSavedActivities = (numOfActivities) => {
  return [
    ...Array(numOfActivities)
      .fill(0)
      .map(() => {
        const id = nanoid();
        const togglId = nanoid();
        return {
          strava: {
            name: `Activity ${id}`,
            id: id,
          },
          toggl: {
            id: `Toggl ${togglId}`,
          },
        };
      }),
  ];
};

const generateMockRecentActivities = (numOfActivities) => {
  return [
    ...Array(numOfActivities)
      .fill(0)
      .map(() => {
        const id = nanoid();
        return {
          name: `Activity ${id}`,
          id: id,
        };
      }),
  ];
};

it("should return 5 saved activities, if there are no new activities", async () => {
  const savedActivities = generateMockSavedActivities(5);

  const result = await compareRecentWithSavedActivites([], savedActivities);

  expect(result).toEqual(savedActivities);
});

it("should return 5 saved activities, if the recent activities are the same as the saved activities", async () => {
  const savedActivities = generateMockSavedActivities(5);
  const recentActivities = savedActivities.map((x) => x.strava);

  const result = await compareRecentWithSavedActivites(
    recentActivities,
    savedActivities
  );

  expect(result).toEqual(savedActivities);
});

it("should return 10 activities and 5 new activities", async () => {
  const savedActivities = generateMockSavedActivities(5);
  const newRecentActivities = generateMockRecentActivities(5);
  const recentActivities = newRecentActivities.concat(
    savedActivities.map((x) => x.strava)
  );

  const result = await compareRecentWithSavedActivites(
    recentActivities,
    savedActivities
  );

  expect(result.length).toEqual(10);
  expect(result.filter((x) => !x.toggl).length).toEqual(5);
});

it("should return 6 activities and 1 new activity", async () => {
  const recentActivities = generateMockRecentActivities(1);
  const savedActivities = generateMockSavedActivities(5);

  const result = await compareRecentWithSavedActivites(
    recentActivities,
    savedActivities
  );

  expect(result.length).toEqual(6);
  expect(result.filter((x) => !x.toggl).length).toEqual(1);
});

it("should return 10 activities and 5 new activities and 1 changed activity", async () => {
  const newRecentActivities = generateMockRecentActivities(5);
  const savedActivities = generateMockSavedActivities(5);
  const savedStravaActivities = [
    ...savedActivities.map((x) => Object.assign({}, x.strava)),
  ];
  const recentActivities = [...savedStravaActivities, ...newRecentActivities];

  recentActivities[0].name = "New name!";

  const result = await compareRecentWithSavedActivites(
    recentActivities,
    savedActivities
  );

  expect(result.length).toEqual(10);
  expect(result.filter((x) => x.shouldUpdate).length).toEqual(1);
  expect(result.filter((x) => !x.toggl).length).toEqual(5);
});
