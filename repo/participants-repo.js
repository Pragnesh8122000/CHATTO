const { Participant } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class ParticipantRepo {
    constructor() {

    }

    getUserParticipantByConversationId = async (conversationId, userId) => {
        return await Participant.findOne({
            where: {
                user_id: userId,
                conversation_id: conversationId
            }
        })
    }

    getReceiverParticipantByConversationId = async (conversationId, userId) => {
        return await Participant.findOne({
            where: {
                user_id: { [Op.ne]: userId },
                conversation_id: conversationId
            }
        })
    }

    addMultipleParticipants = async (participantsArray) => {
        return await Participant.bulkCreate(participantsArray);
    }

    removeParticipants = async (conversationId, participants) => {
        return await Participant.destroy({
            where: {
                conversation_id: conversationId,
                user_id: { [Op.in]: participants },
            },
        });
    }
}

module.exports = ParticipantRepo