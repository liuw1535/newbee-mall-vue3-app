const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    field: 'order_id'
  },
  orderNo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '',
    field: 'order_no'
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    field: 'user_id'
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'total_price'
  },
  payStatus: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'pay_status'
  },
  payType: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'pay_type'
  },
  payTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'pay_time'
  },
  orderStatus: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'order_status'
  },
  extraInfo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    field: 'extra_info'
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
  updateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'update_time'
  }
}, {
  tableName: 'tb_newbee_mall_order',
  timestamps: false
});

module.exports = Order; 