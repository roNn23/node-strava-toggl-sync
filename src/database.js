const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);

const setupDb = () => {
  db.defaults({
    activities: [],
    cookies: null,
  }).write();
};

module.exports = {
  setupDb: setupDb,
  db: db,
};
