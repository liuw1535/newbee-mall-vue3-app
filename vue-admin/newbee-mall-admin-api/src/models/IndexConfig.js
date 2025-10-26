const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const IndexConfig = sequelize.define('IndexConfig', {
  configId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'config_id'
  },
  configName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    field: 'config_name'
  },
  configType: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'config_type'
  },
  goodsId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'goods_id'
  },
  redirectUrl: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '##',
    field: 'redirect_url'
  },
  configRank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'config_rank'
  },
  isDeleted: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'is_deleted'
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'create_time'
  },
  createUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'create_user'
  },
  updateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'update_time'
  },
  updateUser: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'update_user'
  }
}, {
  tableName: 'tb_newbee_mall_index_config',
  timestamps: false
});

module.exports = IndexConfig; 