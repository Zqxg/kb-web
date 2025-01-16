<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+postForm.status">
        <CommentDropdown v-model="postForm.commentDisabled" />
        <VisibleRangeDropdown v-model="postForm.visibleRange" />
        <SourceUrlDropdown v-model="postForm.sourceUri" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          Publish
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">
          Draft
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
              <el-row>  <!-- 增加间距 -->
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
import { createArticle, fetchArticle, getArticleCategory } from '@/api/article'
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
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }],
        author: [{ required: true, message: 'Author is required', trigger: 'blur' }],
        categoryId: [{ required: true, message: 'Category is required', trigger: 'blur' }]
      },
      tempRoute: {},
      categories: [
        {
          cid: 2,
          categoryName: '教学资源',
          parentId: 0,
          level: 1,
          children: [
            { cid: 29, categoryName: '课程大纲', parentId: 2, level: 2, children: [] },
            { cid: 30, categoryName: '教案与教材', parentId: 2, level: 2, children: [] },
            { cid: 31, categoryName: '习题与答案', parentId: 2, level: 2, children: [] },
            { cid: 32, categoryName: '电子书与学习资料', parentId: 2, level: 2, children: [] }
          ]
        }
      ],
      selectedCategory: [], // 选中的分类
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
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    }
    this.fetchUserInfo()
    this.fetchCollegeList()
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchArticle(id).then(response => {
        this.postForm = response.data

        // just for test
        this.postForm.title += `   Article Id:${this.postForm.id}`
        this.postForm.contentShort += `   Article Id:${this.postForm.id}`

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        // this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 使用 Axios 或其他 HTTP 库提交表单数据到后端
          this.submitToBackend(this.postForm)
        } else {
          console.log('发布失败!')
          return false
        }
      })
    },

    submitToBackend(formData) {
      // 使用 Axios 提交json数据
      const jsonData = JSON.stringify(formData)
      createArticle(jsonData)
        .then(response => {
          // 请求成功后的回调
          console.log('文章发布成功', response.data)
          this.loading = false
        })
        .catch(error => {
          // 请求失败后的回调
          console.error('发布失败', error)
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
    // 获取当前用户信息
    fetchUserInfo() {
      // 假设有方法获取当前登录用户的信息，或者通过接口获取
      getUserInfo().then(response => {
        if (response.data) {
          const user = response.data
          // 将用户信息填充到表单的author字段
          this.postForm.authorId = user.userId
          this.author = user.nickname
        }
      }).catch(error => {
        console.error('获取用户信息失败', error)
      })
    },
    // 获取文章分类列表
    fetchCollegeList() {
      getArticleCategory().then(response => {
        if (response.data) {
          // 将学院信息填充到表单的college字段
          this.categories = JSON.parse(JSON.stringify(response.data.CategoryList)) // 深拷贝
          console.log('CategoryList:', this.CategoryList)
        }
      }).catch(error => {
        console.error('获取学院信息失败', error)
      })
    },
    handleAdd() {
      this.$refs.fileUploadDialog.visible = true
    },
    handleUploadSuccess(uploadedFiles) {
      // 更新上传文件列表，上传成功后返回文件信息
      this.uploadedFiles = uploadedFiles.map(file => ({
        fileName: file.name,
        fileUrl: file.url // 假设返回的数据包含 fileName 和 fileUrl
      }))
    },
    handleCategoryChange(value) {
      // 这里的 value 是一个数组，包含了从顶级到选中项的所有值
      // 假设你选择的是某一子分类，直接取最后一个值作为分类ID
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
