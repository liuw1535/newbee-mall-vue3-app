<template>
  <div class="carousel-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加轮播图
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
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
        <el-table-column prop="carouselId" label="ID" width="80" />
        <el-table-column prop="carouselUrl" label="轮播图" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.carouselUrl"
              :preview-src-list="[row.carouselUrl]"
              :preview-teleported="true"
              fit="cover"
              style="width: 100px; height: 60px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="redirectUrl" label="跳转链接" show-overflow-tooltip />
        <el-table-column prop="carouselRank" label="排序值" width="80" />
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
        <el-form-item label="轮播图" prop="carouselUrl">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.carouselUrl" :src="formData.carouselUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="跳转链接" prop="redirectUrl">
          <el-input v-model="formData.redirectUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="排序值" prop="carouselRank">
          <el-input-number v-model="formData.carouselRank" :min="1" :max="999" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCarouselList,
  getCarouselDetail,
  createCarousel,
  updateCarousel,
  deleteCarousel
} from '@/utils/api'
import dayjs from 'dayjs'

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10
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
  carouselId: null,
  carouselUrl: '',
  redirectUrl: '',
  carouselRank: 100
})

// 上传相关
const uploadUrl = computed(() => '/api/upload/file')
const uploadHeaders = computed(() => ({
  'X-Access-Token': localStorage.getItem('token')
}))

// 表单验证规则
const formRules = {
  carouselUrl: [
    { required: true, message: '请上传轮播图', trigger: 'change' }
  ],
  redirectUrl: [
    { required: true, message: '请输入跳转链接', trigger: 'blur' }
  ],
  carouselRank: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getCarouselList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
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

// 处理添加
const handleAdd = () => {
  dialogTitle.value = '添加轮播图'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑轮播图'
  try {
    const res = await getCarouselDetail(row.carouselId)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取轮播图详情失败:', error)
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该轮播图，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteCarousel([row.carouselId])
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

// 处理批量删除
const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(
    `此操作将永久删除选中的 ${multipleSelection.value.length} 条数据，是否继续？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = multipleSelection.value.map(item => item.carouselId)
      const res = await deleteCarousel(ids)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 处理上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    formData.carouselUrl = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    carouselId: null,
    carouselUrl: '',
    redirectUrl: '',
    carouselRank: 100
  })
}

// 处理提交
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (formData.carouselId) {
          // 编辑
          res = await updateCarousel(formData.carouselId, formData)
        } else {
          // 新增
          res = await createCarousel(formData)
        }
        if (res.code === 200) {
          ElMessage.success(formData.carouselId ? '编辑成功' : '添加成功')
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
.carousel-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      
      &:hover {
        border-color: #409eff;
      }
    }
    
    .avatar {
      width: 300px;
      height: 150px;
      display: block;
      object-fit: cover;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 300px;
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
  }
}
</style>
