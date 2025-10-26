const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Carousel = sequelize.define('Carousel', {
  carouselId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'carousel_id'
  },
  carouselUrl: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    field: 'carousel_url'
  },
  redirectUrl: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '##',
    field: 'redirect_url'
  },
  carouselRank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'carousel_rank'
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
    allowNull: false,
    defaultValue: 0,
    field: 'update_user'
  }
}, {
  tableName: 'tb_newbee_mall_carousel',
  timestamps: false
});

module.exports = Carousel; 