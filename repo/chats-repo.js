// const BaseRepo = require("./repo");
const { User, Chat } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class ChatRepo {
    // class ChatRepo {
    constructor() {
        // super();
    }

    getExistingUsersCount = async (users) => {
        return await User.count({
            where: {
                id: { [Op.in]: users },
            },
        })
    }
}


// const chatRepo = 
module.exports = ChatRepo;