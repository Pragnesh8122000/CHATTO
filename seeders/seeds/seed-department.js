const { Department } = require("../../models")

module.exports.seedDepartment = async () => {
    const departmentName = "Development"
    const department = await Department.findOne({ where: { department_name: departmentName } });
    if (department) {
        console.log("Department already exist");
        return
    }
    await Department.create({
        department_name: departmentName,
    });
}