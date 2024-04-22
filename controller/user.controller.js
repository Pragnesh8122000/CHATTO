const BaseController = require("../controller/base.controller");
const { User, Department } = require("./../models");
const { Op } = require("sequelize");
class UserController extends BaseController {
  constructor() {
    super();
    this.validation = require("../validations/users.validation");
    this.departmentValidation = require("../validations/department.validation");
    this.messages = require("../messages/user.messages");
    this.constants = require("../helpers/constants").DATABASE;
    this.socketServices = require("../services/socket-services");
    this.bridgeUsers = require("../user-bridge")
  }
  getUserList = async (req, res) => {
    try {
      // Get user list
      const user = await User.findAll({
        attributes: [
          this.constants.TABLE_ATTRIBUTES.COMMON.ID,
          this.constants.TABLE_ATTRIBUTES.USER.FIRST_NAME,
          this.constants.TABLE_ATTRIBUTES.USER.LAST_NAME,
          this.constants.TABLE_ATTRIBUTES.USER.EMAIL,
          this.constants.TABLE_ATTRIBUTES.USER.DEPARTMENT_ID,
        ],
      });

      res.send({ message: this.messages.allMessages.GET_ALL_USERS, user });
    } catch (error) {
      console.log(error);
      res.send({ message: this.messages.allMessages.GET_ALL_USERS_FAILED });
    }
  };

  getUserByDeptList = async (req, res) => {
    let department_validation = this.departmentValidation.departmentValidation.validate(req.query);
    if (department_validation.error) {
      return res.status(403).send({
        status: false,
        message: department_validation.error.details[0].message,
      });
    } else {
      try {
        const { department } = req.query;

        const departmentByName = await Department.findOne({
          where: { department_name: department },
        });

        // if department not exist
        if (!departmentByName) {
          return res.send({
            message: this.messages.allMessages.DEPARTMENT_NOT_EXIST,
          });
        }

        // Get user list
        const user = await User.findAll({
          include: {
            model: Department,
            attributes: [],
            where: { id: departmentByName.id },
            as: this.constants.CONNECTION_REF.DEPARTMENT,
          },
          attributes: [
            this.constants.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.TABLE_ATTRIBUTES.USER.LAST_NAME,
            this.constants.TABLE_ATTRIBUTES.USER.EMAIL,
            this.constants.TABLE_ATTRIBUTES.USER.DEPARTMENT_ID,
          ],
        });

        res.send({
          message: this.messages.allMessages.GET_ALL_USERS_BY_DEPARTMENT,
          user,
        });

      } catch (error) {
        console.log(error);
        res.send({
          message: this.messages.allMessages.GET_ALL_USERS_BY_DEPARTMENT_FAILED,
        });
      }
    };
  };

  getSingleUser = async (req, res) => {
    try {
      const { id } = req.params;

      // Get user by id
      const user = await User.findOne({
        where: { id },
        attributes: [
          this.constants.TABLE_ATTRIBUTES.COMMON.ID,
          this.constants.TABLE_ATTRIBUTES.USER.FIRST_NAME,
          this.constants.TABLE_ATTRIBUTES.USER.LAST_NAME,
          this.constants.TABLE_ATTRIBUTES.USER.EMAIL,
          this.constants.TABLE_ATTRIBUTES.USER.DEPARTMENT_ID,
        ],
      });

      // if user does not exist
      if (!user) {
        return res.send({ message: this.messages.allMessages.USER_NOT_EXIST });
      }

      res.send({ message: this.messages.allMessages.GET_USER, user });
    } catch (error) {
      console.log(error);
      res.send({ message: this.messages.allMessages.GET_USER_FAILED });
    }
  };

  insertUser = async (req, res) => {
    let user_validation = this.validation.userValidation.validate(req.body);
    if (user_validation.error) {
      return res.status(403).send({
        status: false,
        message: user_validation.error.details[0].message,
      });
    } else {
      try {
        const { first_name, last_name, email, password, department_name } = req.body;

        // Generate user code
        const userCode = await this.helpers.generateUserCode();

        // get existing user
        let existingUser = await User.findOne({
          where: {
            [this.Op.or]: [
              { email: email },
              { user_code: userCode },
            ],
          },
        });

        // check if user already exist
        if (existingUser) {
          return res.send({
            message: this.messages.allMessages.INSERTED_USER_ALREADY_EXIST_FAILED,
          });
        }

        // get department by department name
        const department = await Department.findOne({
          where: { department_name },
        });

        // if department does not exist
        if (!department) {
          return res.send({
            message: this.messages.allMessages.DEPARTMENT_NOT_EXIST,
          });
        }

        // user object
        const userObject = {
          first_name,
          last_name,
          email,
          department_id: department.id,
          password,
          user_code: userCode
        };

        // insert user
        await User.create(userObject);

        res.send({ message: this.messages.allMessages.INSERT_USER });

      } catch (error) {
        console.log(error);
        res.send({ message: this.messages.allMessages.INSERT_USER_FAILED });
      }
    }
  };

  updateUser = async (req, res) => {
    let user_validation = this.validation.userValidation.validate(req.body);
    if (user_validation.error) {
      return res.status(403).send({
        status: false,
        message: user_validation.error.details[0].message,
      });
    } else {
      try {
        const { id } = req.params;
        const { first_name, last_name, email, password, department_name } = req.body;

        // get existing user
        const existingUser = await User.findOne({ where: { id } });

        // check if user already exist
        if (!existingUser) {
          return res.send({
            message: this.messages.allMessages.USER_NOT_EXIST,
          });
        }

        // get existing user with same email
        const existingUserWithEmail = await User.findOne({
          where: { email, id: { [Op.ne]: id } },
        });

        // check if user already exist with same email
        if (existingUserWithEmail) {
          return res.send({
            message: this.messages.allMessages.INSERTED_USER_ALREADY_EXIST,
          });
        }

        // get department by department name
        const department = await Department.findOne({
          where: { department_name },
        });

        // if department does not exist
        if (!department) {
          return res.send({
            message: this.messages.allMessages.DEPARTMENT_NOT_EXIST,
          });
        }

        // user object
        const userObject = {
          first_name,
          last_name,
          email,
          department_id: department.id,
          password,
        };

        // update user
        await User.update(userObject, { where: { id } });

        res.send({ message: this.messages.allMessages.UPDATE_USER });

      } catch (error) {
        console.log(error);
        res.send({ message: this.messages.allMessages.UPDATE_USER_FAILED });
      }
    }
  };

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      // delete user
      await User.destroy({ where: { id } });

      res.send({ message: this.messages.allMessages.DELETE_USER });

    } catch (error) {
      console.log(error);
      res.send({ message: this.messages.allMessages.DELETE_USER_FAILED });
    }
  };

  UpdateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updateUser = await this.userServices.updateUserStatus(id, status);
    const users = this.bridgeUsers.getUsers();
    let user = await this.repo.userRepo.getUserById(id);
    // plain text
    user = user.get({ plain: true });
    delete user.id;
    user.user_id = id;
    // // get user friends
    let userFriends = await this.repo.friendsRepo.getUserFriends(id);
    // get online friends from users friends array
    const filteredFriends = await this.userServices.getFilteredUsersByReqToAndFrom(user, userFriends);
    // get online friends from users array
    const onlineFriends = users.filter(user => filteredFriends.some(friendId => user.user_id === friendId));
    let socket = req.app.get('socketService');
    await this.socketServices.sendActivityNotificationToOnlineFriends(socket, onlineFriends,user, status);
    res.status(updateUser.statusCode).send({
      status: updateUser.resObj.status,
      message: updateUser.resObj.message
    })
  };
}

module.exports = new UserController();
