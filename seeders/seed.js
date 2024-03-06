// const database = require("./../database/database");
(async () => {
  if (process.argv[2] === "add-friend-req-occurrence-count") {
    console.log("added request occurrence count");
    // seed permissions
    await require("./update/add-friend-req-count-field").addReqOccurrenceCount();
  }
  else if (process.argv[2] === "department") {
    // seed permissions
    await require("./seeds/seed-department").seedDepartment();
    console.log("Department has been seeded");
  }
})();