const { Participant } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class ParticipantRepo {
    constructor() {

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