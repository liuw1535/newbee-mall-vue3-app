<template>
  <div class="category-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="分类级别">
          <el-select v-model="queryParams.categoryLevel" placeholder="请选择" clearable>
            <el-option label="一级分类" :value="1" />
            <el-option label="二级分类" :value="2" />
            <el-option label="三级分类" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分类" v-if="queryParams.categoryLevel > 1">
          <el-cascader
            v-model="selectedParentId"
            :options="parentOptions"
            :props="cascaderProps"
            placeholder="请选择上级分类"
            clearable
            @change="handleParentChange"
          />
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
        <el-table-column prop="categoryId" label="ID" width="80" />
        <el-table-column prop="categoryName" label="分类名称" />
        <el-table-column prop="categoryLevel" label="分类级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.categoryLevel)">
              {{ getLevelText(row.categoryLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentId" label="上级分类" width="120">
          <template #default="{ row }">
            {{ row.parentId === 0 ? '无' : getParentName(row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column prop="categoryRank" label="排序值" width="80" />
        <el-table-column prop="isDeleted" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isDeleted === 0 ? 'success' : 'danger'">
              {{ row.isDeleted === 0 ? '正常' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
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
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类级别" prop="categoryLevel">
          <el-select
            v-model="formData.categoryLevel"
            placeholder="请选择"
            :disabled="!!formData.categoryId"
            @change="handleLevelChange"
          >
            <el-option label="一级分类" :value="1" />
            <el-option label="二级分类" :value="2" />
            <el-option label="三级分类" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId" v-if="formData.categoryLevel > 1">
          <el-cascader
            v-model="formParentId"
            :options="formParentOptions"
            :props="cascaderProps"
            placeholder="请选择上级分类"
            @change="handleFormParentChange"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="formData.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序值" prop="categoryRank">
          <el-input-number v-model="formData.categoryRank" :min="1" :max="999" />
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCategoryList,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/utils/api'
import dayjs from 'dayjs'

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  categoryLevel: null,
  parentId: null
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref([])

// 分类数据缓存
const allCategories = ref([])
const selectedParentId = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive({
  categoryId: null,
  categoryLevel: 1,
  parentId: 0,
  categoryName: '',
  categoryRank: 1
})
const formParentId = ref([])

// 级联选择器配置
const cascaderProps = {
  value: 'categoryId',
  label: 'categoryName',
  children: 'children',
  checkStrictly: true
}

// 获取上级分类选项
const parentOptions = computed(() => {
  if (!queryParams.categoryLevel || queryParams.categoryLevel === 1) {
    return []
  }
  
  const level1 = allCategories.value.filter(c => c.categoryLevel === 1)
  
  if (queryParams.categoryLevel === 2) {
    return level1
  }
  
  // 三级分类需要二级分类
  return level1.map(item => {
    const children = allCategories.value.filter(
      c => c.categoryLevel === 2 && c.parentId === item.categoryId
    )
    return { ...item, children }
  })
})

// 表单上级分类选项
const formParentOptions = computed(() => {
  if (!formData.categoryLevel || formData.categoryLevel === 1) {
    return []
  }
  
  const level1 = allCategories.value.filter(c => c.categoryLevel === 1)
  
  if (formData.categoryLevel === 2) {
    return level1
  }
  
  // 三级分类需要二级分类
  return level1.map(item => {
    const children = allCategories.value.filter(
      c => c.categoryLevel === 2 && c.parentId === item.categoryId
    )
    return { ...item, children }
  })
})

// 表单验证规则
const formRules = {
  categoryLevel: [
    { required: true, message: '请选择分类级别', trigger: 'change' }
  ],
  parentId: [
    { required: true, message: '请选择上级分类', trigger: 'change', validator: (rule, value, callback) => {
      if (formData.categoryLevel > 1 && (!value || value === 0)) {
        callback(new Error('请选择上级分类'))
      } else {
        callback()
      }
    }}
  ],
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  categoryRank: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取级别文本
const getLevelText = (level) => {
  const levelMap = {
    1: '一级分类',
    2: '二级分类',
    3: '三级分类'
  }
  return levelMap[level] || '未知'
}

// 获取级别类型
const getLevelType = (level) => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'success'
  }
  return typeMap[level] || 'info'
}

// 获取父分类名称
const getParentName = (parentId) => {
  const parent = allCategories.value.find(c => c.categoryId === parentId)
  return parent ? parent.categoryName : '未知'
}

// 加载所有分类数据
const loadAllCategories = async () => {
  try {
    // 加载所有分类用于级联选择
    const promises = [1, 2, 3].map(level => 
      getCategoryList({ 
        pageNumber: 1, 
        pageSize: 1000, 
        categoryLevel: level 
      })
    )
    
    const results = await Promise.all(promises)
    allCategories.value = results.flatMap(res => 
      res.code === 200 ? res.data.list : []
    )
  } catch (error) {
    console.error('加载分类数据失败:', error)
  }
}

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getCategoryList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
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
  queryParams.categoryLevel = null
  queryParams.parentId = null
  selectedParentId.value = []
  getList()
}

// 处理上级分类变化
const handleParentChange = (value) => {
  if (value && value.length > 0) {
    queryParams.parentId = value[value.length - 1]
  } else {
    queryParams.parentId = null
  }
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

// 处理级别变化
const handleLevelChange = (val) => {
  formData.parentId = 0
  formParentId.value = []
}

// 处理表单上级分类变化
const handleFormParentChange = (value) => {
  if (value && value.length > 0) {
    formData.parentId = value[value.length - 1]
  } else {
    formData.parentId = 0
  }
}

// 处理添加
const handleAdd = () => {
  dialogTitle.value = '添加分类'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑分类'
  try {
    const res = await getCategoryDetail(row.categoryId)
    if (res.code === 200) {
      Object.assign(formData, res.data)
      
      // 设置上级分类级联值
      if (formData.categoryLevel === 2) {
        formParentId.value = [formData.parentId]
      } else if (formData.categoryLevel === 3) {
        // 找到二级分类的父ID
        const parent2 = allCategories.value.find(c => c.categoryId === formData.parentId)
        if (parent2) {
          formParentId.value = [parent2.parentId, formData.parentId]
        }
      }
      
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取分类详情失败:', error)
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该分类，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteCategory([row.categoryId])
      if (res.code === 200) {
        ElMessage.success('删除成功')
        getList()
        loadAllCategories()
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
    categoryId: null,
    categoryLevel: 1,
    parentId: 0,
    categoryName: '',
    categoryRank: 1
  })
  formParentId.value = []
}

// 处理提交
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (formData.categoryId) {
          // 编辑
          res = await updateCategory(formData.categoryId, formData)
        } else {
          // 新增
          res = await createCategory(formData)
        }
        if (res.code === 200) {
          ElMessage.success(formData.categoryId ? '编辑成功' : '添加成功')
          dialogVisible.value = false
          getList()
          loadAllCategories()
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

// 监听查询级别变化
watch(() => queryParams.categoryLevel, (newVal) => {
  if (!newVal || newVal === 1) {
    queryParams.parentId = null
    selectedParentId.value = []
  }
})

onMounted(() => {
  loadAllCategories()
  getList()
})
</script>

<style lang="scss" scoped>
.category-container {
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
