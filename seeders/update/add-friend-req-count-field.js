const { sequelize } = require("../../models");
class Seeder {
  constructor() {
  }

  // // script to add new field called req_occurrence_count to the friends table
  // addReqOccurrenceCount = async (req, res) => {
  //   try {
  //     await sequelize.query(
  //       "ALTER TABLE Friends ADD COLUMN IF NOT EXISTS req_occurrence_count INTEGER DEFAULT 0"
  //     );
  //     res.send("Added req_occurrence_count column to the friends table");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
}
const seed = new Seeder();
module.exports = seed;