// const database = require("./../database/database");
(async () => {
  if (process.argv[2] === "add-friend-req-occurrence-count") {
    console.log("added request occurrence count");
    // seed permissions
    await require("./update/add-friend-req-count-field").addReqOccurrenceCount();
  }
})();