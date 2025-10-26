<template>
  <div class="order-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="danger" @click="handleBatchClose" v-if="multipleSelection.length > 0">
            批量关闭
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.orderStatus" placeholder="请选择" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="配货中" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="交易成功" :value="4" />
            <el-option label="手动关闭" :value="-1" />
            <el-option label="超时关闭" :value="-2" />
            <el-option label="商家关闭" :value="-3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="totalPrice" label="订单金额" width="100">
          <template #default="{ row }">
            ¥{{ row.totalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="支付方式" width="100">
          <template #default="{ row }">
            {{ getPayTypeText(row.payType) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.orderStatus)">
              {{ getOrderStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.orderStatus === 1"
              type="success"
              text
              size="small"
              @click="handleStatus(row, 2)"
            >
              配货
            </el-button>
            <el-button
              v-if="row.orderStatus === 2"
              type="success"
              text
              size="small"
              @click="handleStatus(row, 3)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.orderStatus > 0 && row.orderStatus < 4"
              type="danger"
              text
              size="small"
              @click="handleClose(row)"
            >
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNumber"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, updateOrderStatus, closeOrders } from '@/utils/api'
import dayjs from 'dayjs'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  orderNo: '',
  orderStatus: null
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref([])

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

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getOrderList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNumber = 1
  getList()
}

// 处理重置
const handleReset = () => {
  queryParams.pageNumber = 1
  queryParams.pageSize = 10
  queryParams.orderNo = ''
  queryParams.orderStatus = null
  getList()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  queryParams.pageNumber = 1
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNumber = val
  getList()
}

// 处理多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 查看详情
const handleDetail = (row) => {
  router.push(`/order/${row.orderId}`)
}

// 更新订单状态
const handleStatus = (row, status) => {
  const statusText = status === 2 ? '配货' : '发货'
  
  ElMessageBox.confirm(
    `确定要将订单 "${row.orderNo}" 状态更新为${statusText}吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await updateOrderStatus(row.orderId, { orderStatus: status })
      if (res.code === 200) {
        ElMessage.success('状态更新成功')
        getList()
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 关闭单个订单
const handleClose = (row) => {
  ElMessageBox.confirm(
    `确定要关闭订单 "${row.orderNo}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await closeOrders([row.orderId])
      if (res.code === 200) {
        ElMessage.success('订单已关闭')
        getList()
      }
    } catch (error) {
      console.error('关闭订单失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量关闭订单
const handleBatchClose = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要关闭的订单')
    return
  }
  
  // 检查是否有不能关闭的订单
  const invalidOrders = multipleSelection.value.filter(
    order => order.orderStatus <= 0 || order.orderStatus >= 4
  )
  if (invalidOrders.length > 0) {
    ElMessage.warning('选中的订单包含不能关闭的订单')
    return
  }
  
  ElMessageBox.confirm(
    `确定要批量关闭选中的 ${multipleSelection.value.length} 个订单吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = multipleSelection.value.map(item => item.orderId)
      const res = await closeOrders(ids)
      if (res.code === 200) {
        ElMessage.success('批量关闭成功')
        getList()
      }
    } catch (error) {
      console.error('批量关闭订单失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.order-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
