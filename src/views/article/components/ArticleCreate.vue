<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <CommentDropdown v-model="postForm.commentDisabled" />
        <VisibleRangeDropdown v-model="postForm.visibleRange" />
        <SourceUrlDropdown v-model="postForm.sourceUri" />

        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          发布
        </el-button>
        <el-button v-if="!isEdit" v-loading="loading" type="warning" @click="draftForm">
          草稿
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <Warning />

          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题:
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <!-- 作者字段 -->
                <el-col :span="8">
                  <el-form-item label="作者:" class="postInfo-container-item">
                    <el-input v-model="author" :readonly="true" placeholder="Author" />
                  </el-form-item>
                </el-col>

                <!-- 分组字段 -->
                <el-col :span="8">
                  <el-form-item label="分类:" class="postInfo-container-item">
                    <el-cascader
                      v-model="selectedCategory"
                      :options="categories"
                      placeholder="选择分类"
                      :props="cascaderProps"
                      @change="handleCategoryChange"
                    />
                  </el-form-item>
                </el-col>

                <!-- 重要性字段 -->
                <el-col :span="6">
                  <el-form-item label="重要性:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="display:inline-block"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="摘要:">
          <el-input v-model="postForm.contentShort" :rows="1" type="textarea" class="article-textarea" autosize placeholder="可以编写摘要" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="400" />
        </el-form-item>

        <!-- MultiFileUpload Component for file uploads -->
        <el-form-item label="附件上传:">
          <el-row gutter="{20}">
            <el-col :span="8">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                :disabled="notEdit"
                @click="handleAdd"
              >上传</el-button>
            </el-col>
            <el-col :span="16">
              <MultiFileUpload ref="fileUploadDialog" v-model="postForm.uploadedFiles" :file-size="5" :file-type="['.jpg', '.jpeg', '.png', '.doc', '.xls', '.xlsx', '.ppt', '.txt', '.pdf']" @upload-success="handleUploadSuccess" />
            </el-col>
          </el-row>
          <el-row v-if="postForm.uploadedFiles.length > 0">
            <el-col :span="24">
              <el-table :data="postForm.uploadedFiles" style="width: 100%">
                <el-table-column prop="fileName" label="文件名" />
                <el-table-column prop="fileUrl" label="文件 URL">
                  <template slot-scope="scope">
                    <a :href="scope.row.fileUrl" target="_blank">{{ scope.row.fileUrl }}</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { createArticle, getArticle, getArticleCategory, updateArticle } from '@/api/article'
import Warning from './Warning'
import { CommentDropdown, VisibleRangeDropdown, SourceUrlDropdown } from './Dropdown'
import MultiFileUpload from '@/components/Upload/MultiFileUpload' // 引入多文件上传组件
import { getUserInfo } from '@/api/user'

const defaultForm = {
  title: '', // 文章题目
  content: '', // 文章内容
  authorId: '',
  contentShort: '', // 文章摘要
  sourceUri: '', // 文章外链
  categoryId: '',
  visibleRange: 'public', // 可见范围，默认为 'public'
  commentDisabled: false,
  importance: 0,
  uploadedFiles: [] // 用于存储已上传文件的列表
}

export default {
  name: 'ArticleDetail',
  components: {
    Tinymce,
    MDinput,
    Sticky,
    Warning,
    CommentDropdown,
    VisibleRangeDropdown,
    SourceUrlDropdown,
    MultiFileUpload
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else if (value.length > 20) {
        this.$message({
          message: rule.field + '标题不能超过20个字',
          type: 'error'
        })
        callback(new Error(rule.field + '不能超过20个字'))
      } else {
        callback()
      }
    }
    const validateContent = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      id: 0,
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ validator: validateRequire }],
        content: [{ validator: validateContent }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }],
        author: [{ required: true, message: 'Author is required', trigger: 'blur' }],
        categoryId: [{ required: true, message: 'Category is required', trigger: 'blur' }]
      },
      tempRoute: {},
      categories: [],
      selectedCategory: [],
      cascaderProps: {
        value: 'cid',
        label: 'categoryName',
        children: 'children'
      },
      author: ''
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.contentShort.length
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.id = id
      this.fetchData(id)
    }
    this.fetchUserInfo()
    this.fetchCategoryList()
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    // Fetch article details
    fetchData(id) {
      getArticle(id).then(response => {
        const article = response.data
        this.postForm = {
          ...this.postForm, // Keep existing values
          title: article.title,
          content: article.content,
          contentShort: article.contentShort,
          sourceUri: article.sourceUri,
          visibleRange: article.visibleRange,
          importance: article.importance,
          uploadedFiles: article.uploadedFiles || [],
          categoryId: article.categoryId
        }

        this.selectedCategory = [article.categoryId] // Assuming categoryId is directly usable
        this.author = article.author || this.author // Only set author if it's not already set
      }).catch(err => {
        console.error(err)
      })
    },
    // Set page title and other meta details
    setTagsViewTitle() {
      const title = 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 判断是否为编辑状态
          if (this.isEdit) {
            // 编辑时，执行更新操作
            this.submitUpdateArticle(this.postForm)
          } else {
            // 发布时，执行创建操作
            this.submitToBackend(this.postForm)
          }
        } else {
          console.log('发布失败!')
          return false
        }
      })
    },

    submitToBackend(formData) {
      const jsonData = JSON.stringify(formData)
      createArticle(jsonData)
        .then(response => {
          console.log('文章发布成功', response.data)
          this.loading = false
        })
        .catch(error => {
          console.error('发布失败', error)
          this.loading = false
        })
    },
    submitUpdateArticle(formData) {
      const articleId = Math.abs(parseInt(this.id, 10))
      const updatedData = {
        ...formData, // 保留原有的字段
        articleId: articleId // 编辑的 id
      }

      const jsonData = JSON.stringify(updatedData)
      updateArticle(jsonData)
        .then(response => {
          console.log('文章更新成功', response.data)
          this.loading = false
        })
        .catch(error => {
          console.error('更新发布失败', error)
          this.loading = false
        })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    // Fetch user info for author field
    fetchUserInfo() {
      getUserInfo().then(response => {
        if (response.data) {
          const user = response.data
          this.postForm.authorId = user.userId
          if (!this.author) { // Only set author if not already set by article
            this.author = user.nickname
          }
        }
      }).catch(error => {
        console.error('获取用户信息失败', error)
      })
    },
    // Fetch article categories
    fetchCategoryList() {
      getArticleCategory().then(response => {
        if (response.data) {
          this.categories = JSON.parse(JSON.stringify(response.data.CategoryList)) // Deep copy
        }
      }).catch(error => {
        console.error('获取文章分类失败', error)
      })
    },
    handleAdd() {
      this.$refs.fileUploadDialog.visible = true
    },
    handleUploadSuccess(uploadedFiles) {
      this.uploadedFiles = uploadedFiles.map(file => ({
        fileName: file.name,
        fileUrl: file.url
      }))
    },
    handleCategoryChange(value) {
      this.postForm.categoryId = value[value.length - 1]
    }
  }
}

</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
