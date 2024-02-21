const { User, Department } = require('../models');
const { Op } = require("sequelize");
class DepartmentController {
    constructor() {
        // Department = require('../models/department');
        this.validation = require("../validations/department.validation");
        this.messages = require("../messages/department.messages");
        this.constants = require("../helpers/constants").DATABASE;
    }
    getDepartmentList = async (req, res) => {
        try {
            // Get department list
            const department = await Department.findAll({
                attributes: [this.constants.TABLE_ATTRIBUTES.COMMON.ID, this.constants.TABLE_ATTRIBUTES.DEPARTMENT.DEPARTMENT_NAME]
            });

            res.status(200).send({ status: true, message: this.messages.allMessages.GET_DEPARTMENT_LIST, department })
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: false, message: this.messages.allMessages.GET_DEPARTMENT_LIST_FAILED });
        }
    };

    getSingleDepartment = async (req, res) => {
        try {
            const { id } = req.params;

            // Get department by id
            const department = await Department.findOne({ where: { id }, attributes: [this.constants.TABLE_ATTRIBUTES.COMMON.ID, this.constants.TABLE_ATTRIBUTES.DEPARTMENT.DEPARTMENT_NAME] });

            // if department not exist
            if (!department) {
                return res.status(422).send({ status: false, message: this.messages.allMessages.DEPARTMENT_NOT_EXIST });
            }

            res.status(200).send({ status: true, message: this.messages.allMessages.GET_DEPARTMENT, department });
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: false, message: this.messages.allMessages.GET_DEPARTMENT_FAILED });
        }
    }

    insertDepartment = async (req, res) => {
        let department_validation = this.validation.departmentValidation.validate(req.body);
        if (department_validation.error) {
            return res.status(403).send({
                status: false,
                message: department_validation.error.details[0].message,
            });
        } else {
            try {
                const { department_name } = req.body;

                // check if department name already exist
                const existingDepartmentName = await Department.findOne({ where: { department_name } });

                if (existingDepartmentName) {
                    return res.send({ status: false, message: this.messages.allMessages.DEPARTMENT_ALREADY_EXIST });
                }

                // insert department
                await Department.create({ department_name });

                res.status(200).send({ status: true, message: this.messages.allMessages.DEPARTMENT_INSERTED });
            } catch (error) {
                console.log(error);
                res.status(500).send({ status: false, message: this.messages.allMessages.DEPARTMENT_INSERT_FAILED });
            }
        }
    }

    updateDepartment = async (req, res) => {
        let department_validation = this.validation.departmentValidation.validate(req.body);
        if (department_validation.error) {
            return res.status(403).send({
                status: false,
                message: department_validation.error.details[0].message,
            });
        } else {
            try {
                const { id } = req.params;
                const { department_name } = req.body;

                // get department by department id
                const department = await Department.findOne({ where: { id } });

                // if department not exist
                if (!department) {
                    return res.send({ message: this.messages.allMessages.DEPARTMENT_NOT_EXIST });
                }

                // check if department name already exist
                const existingDepartmentName = await Department.findOne({ where: { department_name: department_name, id: { [Op.ne]: id } } });

                // if department name already exist with different id
                if (existingDepartmentName) {
                    return res.status(422).send({ status: false, message: this.messages.allMessages.DEPARTMENT_ALREADY_EXIST });
                }

                // update department
                await Department.update({ department_name }, { where: { id } });
                res.send({ status: true, message: this.messages.allMessages.DEPARTMENT_UPDATED });
            } catch (error) {
                console.log(error);
                res.status(500).send({ status: false, message: this.messages.allMessages.DEPARTMENT_UPDATE_FAILED });
            }
        }
    }

    deleteDepartment = async (req, res) => {
        try {
            const { id } = req.params;

            // check if department has users
            const usersWithDepartment = await User.findOne({ where: { department_id: id } });

            // if department has users
            if (usersWithDepartment) {
                return res.status(422).send({ status: false, message: this.messages.allMessages.DEPARTMENT_HAS_USERS });
            }

            // delete department
            await Department.destroy({ where: { id } });

            res.status(200).send({ status: true, message: this.messages.allMessages.DEPARTMENT_DELETED });
        } catch (error) {
            console.log(error);
            res.status(500).send({ status: false, message: this.messages.allMessages.DEPARTMENT_DELETE_FAILED });
        }
    }
}

module.exports = new DepartmentController();