const { Conversation, Participant, Chat, User, Friend } = require("../models");
const { Op } = require("sequelize");
class ChatServices {
    constructor() {
        this.repo = require("../repo/repo");
        this.messages = require("../messages/chat.messages");
    }

    // create a group chat
    createGroup = async (groupName, description, currentUserId, participants) => {
        try {
            const participantsLength = participants.length

            // verify if all participants exist in user table and all are friends of group creator
            const verifyAllParticipants = await this.verifyAllParticipants(participants, participantsLength, currentUserId);

            if (!verifyAllParticipants.status) {
                return {
                    statusCode: 422,
                    resObj: {
                        message: verifyAllParticipants.message,
                        status: false
                    }
                }
            }

            // new conversation object
            const conversationObj = {
                conversation_name: groupName,
                description: description,
                conversation_creator_id: currentUserId,
            };

            // create new conversation
            const newConversation = await this.repo.conversationRepo.createConversation(conversationObj)

            await this.addParticipantsRecords(participants, participantsLength, newConversation.id)

            return {
                statusCode: 200,
                resObj: {
                    status: true,
                    message: this.messages.allMessages.GROUP_CREATED_SUCCESSFULLY,
                    conversation: newConversation,
                }
            }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 500,
                resObj: {
                    message: this.messages.allMessages.CREATE_GROUP_FAILED,
                    status: false
                }
            }
        }
    }

    // verify if all users exists and are friends with group creator
    verifyAllParticipants = async (participants, participantsLength, currentUserId) => {
        // check if users exist in user model
        const participantExist = await this.repo.chatRepo.getExistingUsersCount(participants, currentUserId);

        // check if all the participants in the array are friends
        const friendsWithParticipant = await this.repo.friendsRepo.getExistingFriendsCount(participants, currentUserId);

        // If any participant is not found or any participant is not a friend
        if (participantExist !== participantsLength || friendsWithParticipant !== participantsLength) {
            let message = participantExist !== participantsLength ? this.messages.allMessages.GROUP_USER_NOT_EXIST : this.messages.allMessages.GROUP_USER_NOT_FRIEND;
            return {
                message: message,
                status: false
            }
        }

        return {
            status: true
        };
    }

    // Add multiple participants in participants table
    addParticipantsRecords = async (participants, participantsLength, conversationId) => {
        // new participants array of object
        let newParticipantsArrOfObject = [];
        // create participant object and add it in participants array
        for (let participant = 0; participant < participantsLength; participant++) {

            // new participant object
            const participantObj = {
                user_id: participants[participant],
                conversation_id: conversationId,
            };

            // add new participant in participants array
            newParticipantsArrOfObject.push(participantObj);
        }

        // create new participants
        await this.repo.participantRepo.addMultipleParticipants(newParticipantsArrOfObject)
        return
    }

    // rename group
    renameGroup = async (conversationId, newGroupName) => {
        try {
            await this.repo.conversationRepo.renameConversation(conversationId, newGroupName);

            return {
                statusCode: 200,
                resObj: {
                    status: true,
                    message: this.messages.allMessages.RENAMED_GROUP_SUCCESSFULLY
                }
            }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 500,
                resObj: {
                    message: this.messages.allMessages.RENAME_GROUP_FAILED,
                    status: false
                }
            }
        }
    }

    removeParticipants = async (conversationId, participants, currentUserId) => {
        try {
            const participantsLength = participants.length

            // check if participants exist and is in the group
            const participantExist = await this.repo.chatRepo.getExistingUsersCount(participants, currentUserId);

            // If any participant is not found
            if (participantExist !== participantsLength) {
                return {
                    statusCode: 422,
                    resObj: {
                        message: this.messages.allMessages.GROUP_USER_NOT_EXIST,
                        status: false
                    }
                }
            }
            await this.repo.participantRepo.removeParticipants(conversationId, participants);

            return {
                statusCode: 200,
                resObj: {
                    status: true,
                    message: this.messages.allMessages.REMOVE_PARTICIPANT_SUCCESSFULLY
                }
            }
        } catch (error) {
            console.log(error);
            return {
                statusCode: 500,
                resObj: {
                    message: this.messages.allMessages.REMOVE_PARTICIPANT_FAILED,
                    status: false
                }
            }
        }
    }


}

module.exports = new ChatServices()