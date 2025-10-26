const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GoodsCategory = sequelize.define('GoodsCategory', {
  categoryId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'category_id'
  },
  categoryLevel: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'category_level'
  },
  parentId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'parent_id'
  },
  categoryName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    field: 'category_name'
  },
  categoryRank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'category_rank'
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
  tableName: 'tb_newbee_mall_goods_category',
  timestamps: false
});

module.exports = GoodsCategory; 