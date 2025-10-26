<template>
  <div class="order-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>订单详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border class="order-info">
        <el-descriptions-item label="订单号">{{ orderInfo.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getOrderStatusType(orderInfo.orderStatus)">
            {{ getOrderStatusText(orderInfo.orderStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ orderInfo.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ getPayTypeText(orderInfo.payType) }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="orderInfo.payStatus === 1 ? 'success' : 'danger'">
            {{ orderInfo.payStatus === 1 ? '已支付' : '未支付' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ orderInfo.payTime ? formatDate(orderInfo.payTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(orderInfo.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(orderInfo.updateTime) }}</el-descriptions-item>
      </el-descriptions>

      <h3 class="section-title">收货信息</h3>
      <el-descriptions :column="2" border class="address-info">
        <el-descriptions-item label="收货人">{{ addressInfo.userName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ addressInfo.userPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ addressInfo.provinceName }} {{ addressInfo.cityName }} {{ addressInfo.regionName }} {{ addressInfo.detailAddress }}
        </el-descriptions-item>
      </el-descriptions>

      <h3 class="section-title">商品信息</h3>
      <el-table :data="orderItems" class="goods-table">
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.goodsCoverImg"
              :preview-src-list="[row.goodsCoverImg]"
              :preview-teleported="true"
              fit="cover"
              style="width: 60px; height: 60px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="商品名称" />
        <el-table-column prop="sellingPrice" label="单价" width="100">
          <template #default="{ row }">
            ¥{{ row.sellingPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="goodsCount" label="数量" width="80" />
        <el-table-column label="小计" width="100">
          <template #default="{ row }">
            ¥{{ (row.sellingPrice * row.goodsCount).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="order-actions" v-if="canUpdateStatus">
        <el-button
          v-if="orderInfo.orderStatus === 1"
          type="primary"
          @click="handleUpdateStatus(2)"
        >
          配货完成
        </el-button>
        <el-button
          v-if="orderInfo.orderStatus === 2"
          type="primary"
          @click="handleUpdateStatus(3)"
        >
          发货完成
        </el-button>
        <el-button
          v-if="orderInfo.orderStatus > 0 && orderInfo.orderStatus < 4"
          type="danger"
          @click="handleClose"
        >
          关闭订单
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, updateOrderStatus, closeOrders } from '@/utils/api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const orderInfo = reactive({})
const addressInfo = reactive({})
const orderItems = ref([])

// 是否可以更新状态
const canUpdateStatus = computed(() => {
  return orderInfo.orderStatus >= 0 && orderInfo.orderStatus < 4
})

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取支付方式文本
const getPayTypeText = (type) => {
  const typeMap = {
    0: '无',
    1: '支付宝',
    2: '微信支付'
  }
  return typeMap[type] || '未知'
}

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

// 获取订单详情
const getDetail = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id)
    if (res.code === 200) {
      Object.assign(orderInfo, res.data.order || {})
      Object.assign(addressInfo, res.data.orderAddress || {})
      orderItems.value = res.data.orderItems || []
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const handleUpdateStatus = (status) => {
  const statusText = status === 2 ? '配货' : '发货'
  
  ElMessageBox.confirm(
    `确定要将订单状态更新为${statusText}完成吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await updateOrderStatus(orderInfo.orderId, { orderStatus: status })
      if (res.code === 200) {
        ElMessage.success('状态更新成功')
        getDetail()
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 关闭订单
const handleClose = () => {
  ElMessageBox.confirm(
    '确定要关闭该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await closeOrders([orderInfo.orderId])
      if (res.code === 200) {
        ElMessage.success('订单已关闭')
        getDetail()
      }
    } catch (error) {
      console.error('关闭订单失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    margin: 30px 0 20px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .order-info,
  .address-info {
    margin-bottom: 20px;
  }

  .goods-table {
    margin-bottom: 30px;
  }

  .order-actions {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
