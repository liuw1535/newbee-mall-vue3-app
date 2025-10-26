const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminUser = sequelize.define('AdminUser', {
  adminUserId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'admin_user_id'
  },
  loginUserName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'login_user_name'
  },
  loginPassword: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'login_password'
  },
  nickName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'nick_name'
  },
  locked: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    field: 'locked'
  }
}, {
  tableName: 'tb_newbee_mall_admin_user',
  timestamps: false
});

module.exports = AdminUser; 