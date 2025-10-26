<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(item, index) in statCards" :key="index">
        <el-card class="stat-card" :style="{ background: item.color }">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="48"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button type="primary" text @click="$router.push('/order')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" v-loading="ordersLoading">
            <el-table-column prop="orderNo" label="订单号" width="180" />
            <el-table-column prop="totalPrice" label="订单金额">
              <template #default="{ row }">
                ¥{{ row.totalPrice }}
              </template>
            </el-table-column>
            <el-table-column prop="orderStatus" label="订单状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.orderStatus)">
                  {{ getOrderStatusText(row.orderStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>新注册用户</span>
              <el-button type="primary" text @click="$router.push('/user')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="recentUsers" v-loading="usersLoading">
            <el-table-column prop="loginName" label="用户名" />
            <el-table-column prop="nickName" label="昵称" />
            <el-table-column prop="createTime" label="注册时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">NewBee Mall 后台管理系统</el-descriptions-item>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue 3 + Element Plus</el-descriptions-item>
            <el-descriptions-item label="后端框架">Express.js + Sequelize</el-descriptions-item>
            <el-descriptions-item label="数据库">MySQL</el-descriptions-item>
            <el-descriptions-item label="开发者">NewBee Mall Team</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrderList, getUserList, getGoodsList, getCategoryList } from '@/utils/api'
import dayjs from 'dayjs'

// 统计卡片数据
const statCards = reactive([
  {
    label: '商品总数',
    value: 0,
    icon: 'ShoppingCart',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: '分类总数',
    value: 0,
    icon: 'Menu',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    label: '用户总数',
    value: 0,
    icon: 'User',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    label: '订单总数',
    value: 0,
    icon: 'DocumentCopy',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

const recentOrders = ref([])
const recentUsers = ref([])
const ordersLoading = ref(false)
const usersLoading = ref(false)

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '配货中',
    3: '已发货',
    4: '交易成功',
    '-1': '手动关闭',
    '-2': '超时关闭',
    '-3': '商家关闭'
  }
  return statusMap[status] || '未知'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  if (status === 0) return 'warning'
  if (status > 0 && status < 4) return ''
  if (status === 4) return 'success'
  return 'danger'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 获取商品总数
    const goodsRes = await getGoodsList({ pageNumber: 1, pageSize: 1 })
    if (goodsRes.code === 200) {
      statCards[0].value = goodsRes.data.totalCount || 0
    }

    // 获取分类总数
    const categoryRes = await getCategoryList({ pageNumber: 1, pageSize: 1, categoryLevel: 1 })
    if (categoryRes.code === 200) {
      statCards[1].value = categoryRes.data.totalCount || 0
    }

    // 获取用户总数
    const userRes = await getUserList({ pageNumber: 1, pageSize: 1 })
    if (userRes.code === 200) {
      statCards[2].value = userRes.data.totalCount || 0
    }

    // 获取订单总数
    const orderRes = await getOrderList({ pageNumber: 1, pageSize: 1 })
    if (orderRes.code === 200) {
      statCards[3].value = orderRes.data.totalCount || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最新订单
const loadRecentOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await getOrderList({ pageNumber: 1, pageSize: 5 })
    if (res.code === 200) {
      recentOrders.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载最新订单失败:', error)
  } finally {
    ordersLoading.value = false
  }
}

// 加载新注册用户
const loadRecentUsers = async () => {
  usersLoading.value = true
  try {
    const res = await getUserList({ pageNumber: 1, pageSize: 5 })
    if (res.code === 200) {
      recentUsers.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载新注册用户失败:', error)
  } finally {
    usersLoading.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadRecentOrders()
  loadRecentUsers()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-card {
    color: #fff;
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding: 20px;
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        margin-right: 20px;
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
