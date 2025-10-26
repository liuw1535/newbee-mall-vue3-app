const crypto = require('crypto');

/**
 * 生成随机字符串
 * @param {number} length 字符串长度
 * @returns {string} 随机字符串
 */
const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * MD5加密
 * @param {string} str 需要加密的字符串
 * @returns {string} 加密后的字符串
 */
const md5 = (str) => {
  return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * 生成token
 * @returns {string} token
 */
const generateToken = () => {
  return generateRandomString(32);
};

/**
 * 获取当前时间戳
 * @returns {Date} 当前时间
 */
const getDateNow = () => {
  return new Date();
};

/**
 * 获取过期时间
 * @param {number} hours 小时数
 * @returns {Date} 过期时间
 */
const getExpireTime = (hours) => {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
};

/**
 * 格式化响应数据
 * @param {number} code 状态码
 * @param {string} message 消息
 * @param {object} data 数据
 * @returns {object} 格式化后的响应数据
 */
const formatResponse = (code, message, data) => {
  return {
    code,
    message,
    data: data || null
  };
};

/**
 * 成功响应
 * @param {string} message 消息
 * @param {object} data 数据
 * @returns {object} 格式化后的响应数据
 */
const success = (message = '操作成功', data) => {
  return formatResponse(200, message, data);
};

/**
 * 失败响应
 * @param {string} message 消息
 * @param {number} code 状态码
 * @returns {object} 格式化后的响应数据
 */
const fail = (message = '操作失败', code = 500) => {
  return formatResponse(code, message, null);
};

module.exports = {
  generateRandomString,
  md5,
  generateToken,
  getDateNow,
  getExpireTime,
  formatResponse,
  success,
  fail
}; 