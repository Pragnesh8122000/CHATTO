const { User, Chat, Conversation, Friend } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class FriendsRepo {
    constructor() { }

    getExistingFriendsCount = async (participants, currentUserId) => {
        return await Friend.count({
            where: {
                [Op.or]: [
                    {
                        from_user_id: { [Op.in]: participants },
                        to_user_id: currentUserId,
                        status: constants.DATABASE.ENUMS.STATUS.ACCEPTED
                    },
                    {
                        from_user_id: currentUserId,
                        to_user_id: { [Op.in]: participants },
                        status: constants.DATABASE.ENUMS.STATUS.ACCEPTED
                    }
                ]
            }
        })
    }
}

module.exports = FriendsRepo