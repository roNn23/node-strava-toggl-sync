# Node Strava Toggl Track Sync

Sync your [Strava](https://www.strava.com/) activities to [toggl track](https://toggl.com/track/) with node.

## What is it doing?

It will sync **all** your Strava activities to your toggl track account _on the first run_. After that it will look at every
run if there were new or changed activities in the last days and sync them.

## What do I need?

Everything to fill out the config file. Please read the comments in [.env.template](.env.template).

- Strava account
- Strava API
- toggl account
- toggl project where your strava data will be sync to
- Node 14

## Installation

1. Clone repo
2. Create config: `cp .env.template .env`
3. Set the correct data in `.env`
4. Install dependencies: `yarn`
5. Run it: `yarn start`
