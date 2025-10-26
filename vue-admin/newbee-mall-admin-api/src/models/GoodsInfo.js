const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GoodsInfo = sequelize.define('GoodsInfo', {
  goodsId: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    field: 'goods_id'
  },
  goodsName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: '',
    field: 'goods_name'
  },
  goodsIntro: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: '',
    field: 'goods_intro'
  },
  goodsCategoryId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'goods_category_id'
  },
  goodsCoverImg: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: '/admin/dist/img/no-img.png',
    field: 'goods_cover_img'
  },
  goodsCarousel: {
    type: DataTypes.STRING(500),
    allowNull: false,
    defaultValue: '/admin/dist/img/no-img.png',
    field: 'goods_carousel'
  },
  goodsDetailContent: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'goods_detail_content'
  },
  originalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'original_price'
  },
  sellingPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'selling_price'
  },
  stockNum: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    field: 'stock_num'
  },
  tag: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '',
    field: 'tag'
  },
  goodsSellStatus: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'goods_sell_status'
  },
  createUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'create_user'
  },
  createTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'create_time'
  },
  updateUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'update_user'
  },
  updateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'update_time'
  }
}, {
  tableName: 'tb_newbee_mall_goods_info',
  timestamps: false
});

module.exports = GoodsInfo; 