const { Conversation, Participant, Friend, User } = require("../models");
const { Op, Sequelize } = require("sequelize");
class FriendsController {
  constructor() {
    this.messages = require("../messages/friends.messages");
    this.validation = require("../validations/friends.validation");
    this.constants = require("../helpers/constants");
    this.helpers = require("../helpers/helper");
  }

  // Get friend request list (GET)
  getFriendRequestList = async (req, res) => {
    try {
      // Get friend request list
      const friends = await Friend.findAll({
        where: {
          to_user_id: req.currentUser.user_id,
          status: this.constants.DATABASE.ENUMS.STATUS.PENDING,
        },
        include: [
          this.includeUserObj(this.constants.DATABASE.CONNECTION_REF.REQ_FROM)
        ],
      });

      res.status(200).send({
        status: true,
        message: this.messages.allMessages.GET_FRIEND_REQUEST,
        friends,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: false,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_FAILED,
      });
    }
  };

  // Get friend request count (GET)
  getFriendRequestCount = async (req, res) => {
    try {

      // Get friend request count
      const count = await Friend.count({
        where: {
          to_user_id: req.currentUser.user_id,
          status: this.constants.DATABASE.ENUMS.STATUS.PENDING,
        },
      });

      res.status(200).send({
        status: true,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_COUNT,
        count,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: false,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_COUNT_FAILED,
      });
    }
  };

  // Get friends list (GET)
  getFriendsList = async (req, res) => {
    try {
      // get currently logged-in user
      const user = req.currentUser

      // Get friends list
      const friends = await Friend.findAll({
        where: {
          // get friends whose front id and to id is current user
          [Op.or]: [
            { from_user_id: user.user_id },
            { to_user_id: user.user_id },
          ],
          status: this.constants.DATABASE.ENUMS.STATUS.ACCEPTED,
        },
        attributes: [this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID, this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.CREATED_AT],
        include: [
          this.includeUserObj(this.constants.DATABASE.CONNECTION_REF.REQ_FROM),
          this.includeUserObj(this.constants.DATABASE.CONNECTION_REF.REQ_TO)
        ],
      });

      return res.status(200).send({
        status: true,
        message: this.messages.allMessages.GET_FRIENDS_LIST,
        friends,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: this.messages.allMessages.GET_FRIENDS_LIST_FAILED,
      })
    }
  }

  // Send friend request (POST)
  sendFriendRequest = async (req, res) => {
    let sendFriendReqValidation = this.validation.friendReqValidation.validate(req.body);
    if (sendFriendReqValidation.error) {
      res.status(403).send({
        status: false,
        message: sendFriendReqValidation.error.details[0].message,
      });
    } else {
      try {
        const { user_code } = req.body;

        // Check if receiver exists
        const receiver = await User.findOne({ where: { user_code } });

        // if receiver user not exist
        if (!receiver) {
          return res.status(422).send({
            status: false,
            message: this.messages.allMessages.RECEIVER_NOT_FOUND,
          });
        }

        // Check if user already sent friend request
        const existingFriendReq = await Friend.findOne({
          where: {
            from_user_id: req.currentUser.user_id,
            to_user_id: receiver.id,
          },
        })
        // if user already sent friend request
        if (existingFriendReq) {

          if (existingFriendReq.status === this.constants.DATABASE.ENUMS.STATUS.ACCEPTED) {
            return res.status(422).send({
              status: false,
              message: this.messages.allMessages.ALREADY_FRIENDS,
            });
          }

          // Check if user has sent too many friend request
          if (existingFriendReq.req_occurrence_count >= 5) {
            return res.status(422).send({
              status: false,
              message: this.messages.allMessages.TOO_MANY_REQUESTS_SENT,
            });
          }

          // if user already sent friend request and was rejected by receiver then send request again
          if (existingFriendReq.status === this.constants.DATABASE.ENUMS.STATUS.REJECTED) {
            existingFriendReq.req_occurrence_count++;
            existingFriendReq.status = this.constants.DATABASE.ENUMS.STATUS.PENDING;
            await existingFriendReq.save();
            return res.status(200).send({
              status: true,
              message: this.messages.allMessages.FRIEND_REQUEST_SENT,
            });
          }

          // if user already sent friend request
          return res.status(422).send({
            status: false,
            message: this.messages.allMessages.FRIEND_REQUEST_ALREADY_SENT,
          });
        }

        await Friend.create({ from_user_id: req.currentUser.user_id, to_user_id: receiver.id, status: this.constants.DATABASE.ENUMS.STATUS.PENDING });
        res.status(200).send({
          status: true,
          message: this.messages.allMessages.FRIEND_REQUEST_SENT,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: false,
          message: this.messages.allMessages.FRIEND_REQUEST_FAILED,
        });
      }
    }
  };

  // Response friend request (accepted/rejected) (PUT)
  responseFriendRequest = async (req, res) => {
    let responseFriendRequestValidation = this.validation.responseFriendReqValidation.validate(req.body);
    if (responseFriendRequestValidation.error) {
      res.status(403).send({
        status: false,
        message: responseFriendRequestValidation.error.details[0].message,
      });
    } else {
      try {
        const { status } = req.body;
        const { reqId } = req.params;
        let conversation;

        // get existing request details
        const existingRequest = await Friend.findOne({ where: { id: reqId } });

        // if request does not exist
        if (!existingRequest) {
          return res.status(422).send({
            status: false,
            message: this.messages.allMessages.REQUEST_NOT_EXIST,
          });
        }

        // if request already accepted then response with already friend
        if (existingRequest.status === this.constants.DATABASE.ENUMS.STATUS.ACCEPTED) {
          return res.status(422).send({
            status: false,
            message: this.messages.allMessages.ALREADY_FRIENDS,
          });
        }

        // if request already rejected
        await Friend.update({ status }, { where: { id: reqId } });

        // message according to status
        const message = status === this.constants.DATABASE.ENUMS.STATUS.ACCEPTED ? this.messages.allMessages.ACCEPTED_FRIEND_REQUEST : this.messages.allMessages.REJECTED_FRIEND_REQUEST;

        if (status === this.constants.DATABASE.ENUMS.STATUS.ACCEPTED) {
          const conversationObj = { isGroupChat: false, conversationParticipantId: existingRequest.from_user_id };
          conversation = await this.helpers.createTwoUserConversation(conversationObj, req.currentUser);
        }

        console.log("conversation", conversation);

        res.status(200).send({
          status: true,
          message: message,
          conversationId: conversation?.id ?? null
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: false,
          message: this.messages.allMessages.RESPONSE_FRIEND_REQUEST_FAILED,
        });
      }
    }
  }

  includeUserObj = (alias) => {
    return {
      model: User,
      attributes: [
        this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
        this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
        this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME,
        this.constants.DATABASE.TABLE_ATTRIBUTES.USER.USER_CODE,
      ],
      as: alias,
    }
  }
}

module.exports = new FriendsController();