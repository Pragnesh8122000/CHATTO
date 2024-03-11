'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Friend extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'from_user_id',
                as: 'req_from',
            })
            this.belongsTo(models.User, {
                foreignKey: 'to_user_id',
                as: 'req_to',
            })
        }
    }
    Friend.init({
        conversation_id: DataTypes.INTEGER,
        from_user_id: DataTypes.INTEGER,
        to_user_id: DataTypes.INTEGER,
        req_occurrence_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            defaultValue: 'pending'
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Friend',
    });
    return Friend;
};
