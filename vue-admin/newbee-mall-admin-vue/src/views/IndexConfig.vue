<template>
  <div class="index-config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>首页配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加配置
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="配置类型">
          <el-select v-model="queryParams.configType" placeholder="请选择" clearable>
            <el-option label="热销商品" :value="3" />
            <el-option label="新品上线" :value="4" />
            <el-option label="为你推荐" :value="5" />
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
        <el-table-column prop="configId" label="ID" width="80" />
        <el-table-column prop="configName" label="配置名称" />
        <el-table-column prop="configType" label="配置类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getConfigTypeColor(row.configType)">
              {{ getConfigTypeText(row.configType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goodsId" label="商品ID" width="100" />
        <el-table-column prop="redirectUrl" label="跳转链接" show-overflow-tooltip />
        <el-table-column prop="configRank" label="排序值" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">
              删除
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="formData.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="配置类型" prop="configType">
          <el-select
            v-model="formData.configType"
            placeholder="请选择"
            :disabled="!!formData.configId"
          >
            <el-option label="热销商品" :value="3" />
            <el-option label="新品上线" :value="4" />
            <el-option label="为你推荐" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品ID" prop="goodsId">
          <el-input-number v-model="formData.goodsId" :min="1" />
          <el-button type="primary" text @click="checkGoods" style="margin-left: 10px">
            验证商品
          </el-button>
        </el-form-item>
        <el-form-item label="商品信息" v-if="goodsInfo.goodsName">
          <el-tag>{{ goodsInfo.goodsName }}</el-tag>
        </el-form-item>
        <el-form-item label="跳转链接" prop="redirectUrl">
          <el-input v-model="formData.redirectUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="排序值" prop="configRank">
          <el-input-number v-model="formData.configRank" :min="1" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getIndexConfigList,
  getIndexConfigDetail,
  createIndexConfig,
  updateIndexConfig,
  deleteIndexConfig,
  getGoodsDetail
} from '@/utils/api'
import dayjs from 'dayjs'

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  configType: null
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive({
  configId: null,
  configName: '',
  configType: 3,
  goodsId: null,
  redirectUrl: '',
  configRank: 1
})

// 商品信息
const goodsInfo = reactive({
  goodsName: ''
})

// 表单验证规则
const formRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  configType: [
    { required: true, message: '请选择配置类型', trigger: 'change' }
  ],
  goodsId: [
    { required: true, message: '请输入商品ID', trigger: 'blur' }
  ],
  redirectUrl: [
    { required: true, message: '请输入跳转链接', trigger: 'blur' }
  ],
  configRank: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取配置类型文本
const getConfigTypeText = (type) => {
  const typeMap = {
    3: '热销商品',
    4: '新品上线',
    5: '为你推荐'
  }
  return typeMap[type] || '未知'
}

// 获取配置类型颜色
const getConfigTypeColor = (type) => {
  const colorMap = {
    3: 'danger',
    4: 'success',
    5: 'warning'
  }
  return colorMap[type] || 'info'
}

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getIndexConfigList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取配置列表失败:', error)
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
  queryParams.configType = null
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

// 验证商品
const checkGoods = async () => {
  if (!formData.goodsId) {
    ElMessage.warning('请先输入商品ID')
    return
  }
  
  try {
    const res = await getGoodsDetail(formData.goodsId)
    if (res.code === 200) {
      goodsInfo.goodsName = res.data.goodsName
      ElMessage.success('商品验证成功')
    }
  } catch (error) {
    goodsInfo.goodsName = ''
    ElMessage.error('商品不存在')
  }
}

// 处理添加
const handleAdd = () => {
  dialogTitle.value = '添加配置'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑配置'
  try {
    const res = await getIndexConfigDetail(row.configId)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      // 获取商品信息
      if (formData.goodsId) {
        checkGoods()
      }
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取配置详情失败:', error)
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该配置，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteIndexConfig([row.configId])
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    configId: null,
    configName: '',
    configType: 3,
    goodsId: null,
    redirectUrl: '',
    configRank: 1
  })
  goodsInfo.goodsName = ''
}

// 处理提交
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (formData.configId) {
          // 编辑
          res = await updateIndexConfig(formData.configId, formData)
        } else {
          // 新增
          res = await createIndexConfig(formData)
        }
        if (res.code === 200) {
          ElMessage.success(formData.configId ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          getList()
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.index-config-container {
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
