import axios from '../utils/axios'
import axiosRaw from 'axios'

// 获取客服状态
export function getCustomerServiceStatus() {
  return axios.get('/customer-service/status');
}

// 发送客服消息
export function sendCustomerServiceMessage(params) {
  return axios.post('/customer-service/message', params);
}

// 获取客服历史消息
export function getCustomerServiceHistory(params) {
  return axios.get('/customer-service/history', { params });
}

// 获取常见问题列表
export function getFAQList() {
  return axios.get('/customer-service/faq');
}

// 提交客服评价
export function submitCustomerServiceRating(params) {
  return axios.post('/customer-service/rating', params);
}

// 获取客服工作时间
export function getCustomerServiceWorkTime() {
  return axios.get('/customer-service/work-time');
}

export function chatWithRealService(messages) {
  const headers = {
    "Authorization": "Bearer sk-text",
    "Content-Type": "application/json"
  }
  const body = {
    model: "anthropic-sonnet-3.x-stable",
    messages
  }

  return axiosRaw.post(
    'https://sillytavern.ip-ddns.com:8443/notion/v1/chat/completions',
    body,
    {
      headers
    }
  )
}