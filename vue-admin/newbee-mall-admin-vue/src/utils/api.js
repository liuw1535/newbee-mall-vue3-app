import request from './request'

// 管理员相关接口
export const login = (data) => {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export const logout = () => {
  return request({
    url: '/admin/logout',
    method: 'delete'
  })
}

export const getProfile = () => {
  return request({
    url: '/admin/profile',
    method: 'get'
  })
}

export const updateProfile = (data) => {
  return request({
    url: '/admin/profile/name',
    method: 'put',
    data
  })
}

export const updatePassword = (data) => {
  return request({
    url: '/admin/password',
    method: 'put',
    data
  })
}

// 轮播图管理接口
export const getCarouselList = (params) => {
  return request({
    url: '/carousels',
    method: 'get',
    params
  })
}

export const getCarouselDetail = (id) => {
  return request({
    url: `/carousels/${id}`,
    method: 'get'
  })
}

export const createCarousel = (data) => {
  return request({
    url: '/carousels',
    method: 'post',
    data
  })
}

export const updateCarousel = (id, data) => {
  return request({
    url: `/carousels/${id}`,
    method: 'put',
    data
  })
}

export const deleteCarousel = (ids) => {
  return request({
    url: '/carousels',
    method: 'delete',
    data: { ids }
  })
}

// 商品分类管理接口
export const getCategoryList = (params) => {
  return request({
    url: '/categories',
    method: 'get',
    params
  })
}

export const getCategoryDetail = (id) => {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  })
}

export const createCategory = (data) => {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export const updateCategory = (id, data) => {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

export const deleteCategory = (ids) => {
  return request({
    url: '/categories',
    method: 'delete',
    data: { ids }
  })
}

// 商品管理接口
export const getGoodsList = (params) => {
  return request({
    url: '/goods',
    method: 'get',
    params
  })
}

export const getGoodsDetail = (id) => {
  return request({
    url: `/goods/${id}`,
    method: 'get'
  })
}

export const createGoods = (data) => {
  return request({
    url: '/goods',
    method: 'post',
    data
  })
}

export const updateGoods = (data) => {
  return request({
    url: '/goods',
    method: 'put',
    data
  })
}

export const updateGoodsStatus = (ids, status) => {
  return request({
    url: `/goods/status`,
    method: 'put',
    data: { ids, status }
  })
}

// 首页配置管理接口
export const getIndexConfigList = (params) => {
  return request({
    url: '/indexConfigs',
    method: 'get',
    params
  })
}

export const getIndexConfigDetail = (id) => {
  return request({
    url: `/indexConfigs/${id}`,
    method: 'get'
  })
}

export const createIndexConfig = (data) => {
  return request({
    url: '/indexConfigs',
    method: 'post',
    data
  })
}

export const updateIndexConfig = (id, data) => {
  return request({
    url: `/indexConfigs/${id}`,
    method: 'put',
    data
  })
}

export const deleteIndexConfig = (ids) => {
  return request({
    url: '/indexConfigs',
    method: 'delete',
    data: { ids }
  })
}

// 订单管理接口
export const getOrderList = (params) => {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

export const updateOrderStatus = (id, data) => {
  return request({
    url: `/orders/status`,
    method: 'put',
    data: {
      orderId: id,
      ...data
    }
  })
}

export const closeOrders = (ids) => {
  return request({
    url: '/orders/close',
    method: 'put',
    data: { ids }
  })
}

// 用户管理接口
export const getUserList = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export const updateUserStatus = (userId, lockStatus) => {
  return request({
    url: `/users/lock`,
    method: 'put',
    data: { ids: [userId], lockStatus }
  })
}

// 文件上传接口
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload/file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 富文本编辑器专用上传接口
export const uploadEditorImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload/file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
