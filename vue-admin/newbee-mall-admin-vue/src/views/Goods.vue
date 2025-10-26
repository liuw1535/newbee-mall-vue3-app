<template>
  <div class="goods-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div>
            <el-button type="success" @click="handleBatchStatus(0)" v-if="multipleSelection.length > 0">
              批量上架
            </el-button>
            <el-button type="warning" @click="handleBatchStatus(1)" v-if="multipleSelection.length > 0">
              批量下架
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryParams.goodsSellStatus" placeholder="请选择" clearable>
            <el-option label="上架" :value="0" />
            <el-option label="下架" :value="1" />
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
        <el-table-column prop="goodsId" label="商品ID" width="80" />
        <el-table-column prop="goodsCoverImg" label="商品图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.goodsCoverImg"
              :preview-src-list="[row.goodsCoverImg]"
              :preview-teleported="true"
              fit="cover"
              style="width: 80px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="商品名称" show-overflow-tooltip />
        <el-table-column prop="goodsIntro" label="商品简介" show-overflow-tooltip />
        <el-table-column prop="originalPrice" label="原价" width="100">
          <template #default="{ row }">
            ¥{{ row.originalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="sellingPrice" label="售价" width="100">
          <template #default="{ row }">
            ¥{{ row.sellingPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="stockNum" label="库存" width="80" />
        <el-table-column prop="goodsSellStatus" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.goodsSellStatus === 0 ? 'success' : 'warning'">
              {{ row.goodsSellStatus === 0 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              :type="row.goodsSellStatus === 0 ? 'warning' : 'success'" 
              text 
              size="small" 
              @click="handleStatus(row)"
            >
              {{ row.goodsSellStatus === 0 ? '下架' : '上架' }}
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
import { getGoodsList, updateGoodsStatus } from '@/utils/api'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  goodsName: '',
  goodsSellStatus: null
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const multipleSelection = ref([])

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getGoodsList(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.list || []
      total.value = res.data.totalCount || 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
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
  queryParams.goodsName = ''
  queryParams.goodsSellStatus = null
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
  router.push('/goods/add')
}

// 处理编辑
const handleEdit = (row) => {
  router.push(`/goods/edit/${row.goodsId}`)
}

// 处理单个商品状态
const handleStatus = (row) => {
  const status = row.goodsSellStatus === 0 ? 1 : 0
  const statusText = status === 0 ? '上架' : '下架'
  
  ElMessageBox.confirm(
    `确定要${statusText}该商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await updateGoodsStatus([row.goodsId], status)
      if (res.code === 200) {
        ElMessage.success(`${statusText}成功`)
        getList()
      }
    } catch (error) {
      console.error('更新商品状态失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理批量状态更新
const handleBatchStatus = (status) => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要操作的商品')
    return
  }
  
  const statusText = status === 0 ? '上架' : '下架'
  
  ElMessageBox.confirm(
    `确定要批量${statusText}选中的 ${multipleSelection.value.length} 个商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = multipleSelection.value.map(item => item.goodsId)
      const res = await updateGoodsStatus(ids, status)
      if (res.code === 200) {
        ElMessage.success(`批量${statusText}成功`)
        getList()
      }
    } catch (error) {
      console.error('批量更新商品状态失败:', error)
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
.goods-container {
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
