let users = [];

function setUsers(updatedUsers) {
    users = updatedUsers;
}

function getUsers() {
    return users;
}

module.exports = {
    setUsers,
    getUsers,
    users
};
