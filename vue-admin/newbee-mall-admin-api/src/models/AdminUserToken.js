const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminUserToken = sequelize.define('AdminUserToken', {
  adminUserId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    field: 'admin_user_id'
  },
  token: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    field: 'token'
  },
  updateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'update_time'
  },
  expireTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'expire_time'
  }
}, {
  tableName: 'tb_newbee_mall_admin_user_token',
  timestamps: false
});

module.exports = AdminUserToken; 