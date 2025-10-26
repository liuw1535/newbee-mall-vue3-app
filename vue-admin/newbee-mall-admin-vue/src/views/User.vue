<template>
admin/newbee-mall-admin-api  <div class="user-container">
    <el-card>
      <template #header>
        <span>用户管理</span>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.loginName" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="queryParams.lockedFlag" placeholder="请选择" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="锁定" :value="1" />
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
      >
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="loginName" label="用户名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="address" label="收货地址" show-overflow-tooltip />
        <el-table-column prop="lockedFlag" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.lockedFlag === 0 ? 'success' : 'danger'">
              {{ row.lockedFlag === 0 ? '正常' : '锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.lockedFlag === 0 ? 'danger' : 'success'"
              text
              size="small"
              @click="handleLock(row)"
            >
              {{ row.lockedFlag === 0 ? '锁定' : '解锁' }}
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, updateUserStatus } from '@/utils/api'
import dayjs from 'dayjs'

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  loginName: '',
  lockedFlag: null
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
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
  queryParams.loginName = ''
  queryParams.lockedFlag = null
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

// 处理锁定/解锁
const handleLock = (row) => {
  const lockStatus = row.lockedFlag === 0 ? 1 : 0
  const statusText = lockStatus === 0 ? '解锁' : '锁定'
  
  ElMessageBox.confirm(
    `确定要${statusText}用户 "${row.loginName}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await updateUserStatus(row.userId, lockStatus)
      if (res.code === 200) {
        ElMessage.success(`${statusText}成功`)
        getList()
      }
    } catch (error) {
      console.error('更新用户状态失败:', error)
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
.user-container {
  .search-form {
    margin-bottom: 20px;
  }
}
</style>
