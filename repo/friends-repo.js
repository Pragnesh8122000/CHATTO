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
                        status: constants.DATABASE.ENUMS.FRIEND_REQ_STATUS.ACCEPTED
                    },
                    {
                        from_user_id: currentUserId,
                        to_user_id: { [Op.in]: participants },
                        status: constants.DATABASE.ENUMS.FRIEND_REQ_STATUS.ACCEPTED
                    }
                ]
            }
        })
    }

    getUserFriends = async (user_id) => {
        // if from user or to user is user id
        return await Friend.findAll({
            where: {
                [Op.or]: [
                    { from_user_id: user_id },
                    { to_user_id: user_id },
                ],
                status: constants.DATABASE.ENUMS.FRIEND_REQ_STATUS.ACCEPTED
            },
            include: [
                this.includeUserObj(constants.DATABASE.CONNECTION_REF.REQ_FROM),
                this.includeUserObj(constants.DATABASE.CONNECTION_REF.REQ_TO)
            ],
        });
    }

    includeUserObj = (alias) => {
        return {
          model: User,
          attributes: [
            constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME,
            constants.DATABASE.TABLE_ATTRIBUTES.USER.USER_CODE,
            constants.DATABASE.TABLE_ATTRIBUTES.USER.STATUS,
          ],
          as: alias,
        }
      }
}

module.exports = FriendsRepo