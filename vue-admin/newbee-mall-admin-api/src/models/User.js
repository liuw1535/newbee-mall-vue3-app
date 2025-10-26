const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_id'
  },
  nickName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    field: 'nick_name'
  },
  loginName: {
    type: DataTypes.STRING(11),
    allowNull: false,
    defaultValue: '',
    field: 'login_name'
  },
  passwordMd5: {
    type: DataTypes.STRING(32),
    allowNull: false,
    defaultValue: '',
    field: 'password_md5'
  },
  introduceSign: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    field: 'introduce_sign'
  },
  isDeleted: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'is_deleted'
  },
  lockedFlag: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'locked_flag'
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'create_time'
  }
}, {
  tableName: 'tb_newbee_mall_user',
  timestamps: false
});

module.exports = User; 