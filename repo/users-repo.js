const { User, Department } = require("../models");
const { Op } = require("sequelize");
const constants = require("../helpers/constants");
class UserRepo {
    constructor() {

    }
    getUserByEmail = async (email) => {
        return await User.findOne({ where: { email } })
    }

    getUserById = async (user_id) => {
        return await User.findOne({ where: { id: user_id } })
    }

    getDeptByName = async (department_name) => {
        return await Department.findOne({ where: { department_name, } })
    }

    getUserByEmailAndUserCode = async (email, userCode) => {
        return await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { user_code: userCode },
                ],
            },
        });
    }

    createUser = async (userObj) => {
        return await User.create(userObj)
    }

    updateUserStatus = async (user_id, status) => {
        // update user
        return await User.update({ status }, { where: { id: user_id } })
    }

    changePassword = async (user_id, password) => {
        // update user
        return await User.update({ password }, { where: { id: user_id } })
    }
}
module.exports = UserRepo