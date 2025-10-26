<template>
  <div class="goods-add-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加商品</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="formData.goodsName" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="商品简介" prop="goodsIntro">
          <el-input v-model="formData.goodsIntro" placeholder="请输入商品简介" />
        </el-form-item>

        <el-form-item label="商品分类" prop="goodsCategoryId">
          <el-cascader
            v-model="selectedCategory"
            :options="categoryOptions"
            :props="cascaderProps"
            placeholder="请选择商品分类"
            @change="handleCategoryChange"
          />
        </el-form-item>

        <el-form-item label="商品主图" prop="goodsCoverImg">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.goodsCoverImg" :src="formData.goodsCoverImg" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品轮播图" prop="goodsCarousel">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCarouselSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.goodsCarousel" :src="formData.goodsCarousel" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">建议上传多张图片，用英文逗号分隔</div>
        </el-form-item>

        <el-form-item label="商品原价" prop="originalPrice">
          <el-input-number
            v-model="formData.originalPrice"
            :precision="2"
            :min="0"
            :max="999999"
          />
        </el-form-item>

        <el-form-item label="商品售价" prop="sellingPrice">
          <el-input-number
            v-model="formData.sellingPrice"
            :precision="2"
            :min="0"
            :max="999999"
          />
        </el-form-item>

        <el-form-item label="商品库存" prop="stockNum">
          <el-input-number
            v-model="formData.stockNum"
            :min="0"
            :max="999999"
          />
        </el-form-item>

        <el-form-item label="商品标签" prop="tag">
          <el-input v-model="formData.tag" placeholder="请输入商品标签" />
        </el-form-item>

        <el-form-item label="商品状态" prop="goodsSellStatus">
          <el-radio-group v-model="formData.goodsSellStatus">
            <el-radio :label="0">上架</el-radio>
            <el-radio :label="1">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品详情" prop="goodsDetailContent">
          <div style="border: 1px solid #ccc; margin-top: 10px">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
            />
            <Editor
              style="height: 400px; overflow-y: hidden"
              v-model="formData.goodsDetailContent"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createGoods, getCategoryList, uploadEditorImage } from '@/utils/api'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const router = useRouter()
const formRef = ref()

// 富文本编辑器
const editorRef = shallowRef()
const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入商品详情...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        try {
          const res = await uploadEditorImage(file)
          if (res.code === 200) {
            insertFn(res.data, res.data, res.data)
          }
        } catch (error) {
          ElMessage.error('图片上传失败')
        }
      }
    }
  }
}

// 处理编辑器创建
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 表单数据
const formData = reactive({
  goodsName: '',
  goodsIntro: '',
  goodsCategoryId: null,
  goodsCoverImg: '',
  goodsCarousel: '',
  goodsDetailContent: '',
  originalPrice: 0,
  sellingPrice: 0,
  stockNum: 0,
  tag: '',
  goodsSellStatus: 0
})

// 分类相关
const categoryOptions = ref([])
const selectedCategory = ref([])
const cascaderProps = {
  value: 'categoryId',
  label: 'categoryName',
  children: 'children'
}

// 上传相关
const uploadUrl = computed(() => '/api/upload/file')
const uploadHeaders = computed(() => ({
  'X-Access-Token': localStorage.getItem('token')
}))

// 表单验证规则
const formRules = {
  goodsName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  goodsIntro: [
    { required: true, message: '请输入商品简介', trigger: 'blur' }
  ],
  goodsCategoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  goodsCoverImg: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ],
  goodsCarousel: [
    { required: true, message: '请上传商品轮播图', trigger: 'change' }
  ],
  originalPrice: [
    { required: true, message: '请输入商品原价', trigger: 'blur' }
  ],
  sellingPrice: [
    { required: true, message: '请输入商品售价', trigger: 'blur' }
  ],
  stockNum: [
    { required: true, message: '请输入商品库存', trigger: 'blur' }
  ],
  goodsDetailContent: [
    { required: true, message: '请输入商品详情', trigger: 'blur' }
  ]
}

// 加载分类数据
const loadCategories = async () => {
  try {
    // 加载三级分类数据
    const [level1Res, level2Res, level3Res] = await Promise.all([
      getCategoryList({ pageNumber: 1, pageSize: 1000, categoryLevel: 1 }),
      getCategoryList({ pageNumber: 1, pageSize: 1000, categoryLevel: 2 }),
      getCategoryList({ pageNumber: 1, pageSize: 1000, categoryLevel: 3 })
    ])

    const level1 = level1Res.data?.list || []
    const level2 = level2Res.data?.list || []
    const level3 = level3Res.data?.list || []

    // 构建级联数据
    categoryOptions.value = level1.map(l1 => {
      const l1Children = level2.filter(l2 => l2.parentId === l1.categoryId)
      return {
        ...l1,
        children: l1Children.map(l2 => {
          const l2Children = level3.filter(l3 => l3.parentId === l2.categoryId)
          return {
            ...l2,
            children: l2Children
          }
        })
      }
    })
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 处理分类选择
const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    formData.goodsCategoryId = value[value.length - 1]
  }
}

// 处理主图上传成功
const handleCoverSuccess = (response) => {
  if (response.code === 200) {
    formData.goodsCoverImg = response.data
    ElMessage.success('主图上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 处理轮播图上传成功
const handleCarouselSuccess = (response) => {
  if (response.code === 200) {
    formData.goodsCarousel = response.data
    ElMessage.success('轮播图上传成功')
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

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const res = await createGoods(formData)
        if (res.code === 200) {
          ElMessage.success('商品添加成功')
          router.push('/goods')
        }
      } catch (error) {
        console.error('添加商品失败:', error)
      }
    }
  })
}

onMounted(() => {
  loadCategories()
})

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
.goods-add-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
      width: 178px;
      height: 178px;
      display: block;
      object-fit: cover;
    }
    
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
  }
}
</style>
