<template>
  <div class="article-management">
    <el-card class="card-container" shadow="always">
      <h4>文章搜索</h4>
      <div class="card-header">
        <!-- 搜索框部分 -->
        <el-row :gutter="20">
          <!-- 文章标题搜索 -->
          <el-col :span="6">
            <el-input
              v-model="searchQuery.title"
              placeholder="搜索文章标题"
              prefix-icon="el-icon-search"
              clearable
            />
          </el-col>

          <!-- 类别搜索 -->
          <el-col :span="3">
            <!-- 确保只有当 categories 已经加载时才显示 -->
            <el-cascader
              v-if="categories.length > 0"
              v-model="selectedCategory"
              :options="categories"
              placeholder="选择分类"
              :props="cascaderProps"
              style="width: 100%;"
              @change="handleCategoryChange"
            />
          </el-col>

          <!-- 文章状态搜索 -->
          <el-col :span="3">
            <el-select
              v-model="searchQuery.status"
              placeholder="选择状态"
              clearable
              style="width: 100%;"
            >
              <el-option label="草稿" value="0" />
              <el-option label="已发布" value="1" />
              <el-option label="已删除" value="2" />
              <el-option label="待审核" value="3" />
              <el-option label="已驳回" value="4" />
              <el-option label="已计划" value="5" />
            </el-select>
          </el-col>

          <!-- 发布时间开始 -->
          <el-col :span="4">
            <el-date-picker
              v-model="searchQuery.createdAtStart"
              type="date"
              placeholder="选择开始时间"
              clearable
              style="width: 100%;"
            />
          </el-col>

          <!-- 发布时间结束 -->
          <el-col :span="4">
            <el-date-picker
              v-model="searchQuery.createdAtEnd"
              type="date"
              placeholder="选择结束时间"
              clearable
              style="width: 100%;"
            />
          </el-col>
        </el-row>
        <el-row class="search-button">
          <!-- 搜索和清空按钮 -->
          <el-col :span="1" style="display: flex; align-items: center; justify-content: flex-end;">
            <!-- 搜索按钮 -->
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-col>
          <el-col :span="1" style="display: flex; align-items: center; justify-content: flex-end;">
            <!-- 清空按钮 -->
            <el-button type="default" @click="clearSearch">清空</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <!-- 文章表格 -->
    <el-card class="card-container" shadow="always">
      <el-table :data="filteredArticles" style="width: 100%" border>
        <!-- 固定在左侧的序号列 -->
        <el-table-column type="index" label="序号" width="60" fixed="left" />
        <!-- 固定在左侧的文章标题列 -->
        <el-table-column prop="title" label="文章标题" width="220" fixed="left" />
        <!-- 其他列 -->
        <el-table-column prop="contentShort" label="摘要" width="300" />
        <el-table-column prop="category" label="类别" width="150" />
        <el-table-column label="重要性" width="100">
          <template slot-scope="scope">
            <div class="book-importance">
              <!-- 填充星星 -->
              <span v-for="star in scope.row.importance" :key="star" class="el-icon-star-on" />
              <!-- 空星星 -->
              <span v-for="emptyStar in (3 - scope.row.importance)" :key="emptyStar" class="el-icon-star-off" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布日期" width="180" />
        <el-table-column prop="updateAt" label="最近更新" width="180" />
        <el-table-column label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" disable-transitions>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 固定在右侧的操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template v-slot="scope">
            <!-- 编辑按钮 -->
            <span v-if="scope.row.status !== 2" class="operation-item" @click="editArticle(scope.row)">
              <i class="el-icon-edit" />
              <span class="operation-text">编辑</span>
            </span>

            <!-- 查看详细按钮，仅当文章状态为已发布时显示 -->
            <span v-if="scope.row.status === 1" class="operation-item" @click="viewArticle(scope.row)">
              <i class="el-icon-search" />
              <span class="operation-text">查看详细</span>
            </span>

            <!-- 删除按钮 -->
            <span v-if="scope.row.status !== 2" class="operation-item" @click="showDeleteDialog(scope.row)">
              <i class="el-icon-delete" />
              <span class="operation-text">删除</span>
            </span>
          </template>
        </el-table-column>

      </el-table>
      <!-- 删除确认弹框 -->
      <el-dialog
        title="确认删除"
        :visible.sync="deleteDialogVisible"
        width="400px"
        @close="resetDeleteState"
      >
        <span>是否确定删除该文章，删除的7天内可以到回收站恢复。</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetDeleteState">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </el-dialog>

      <!-- 分页 -->
      <el-pagination
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalArticles"
        layout="total, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script>
import { deleteArticle, getArticleCategory, getUserArticleList } from '@/api/article'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      searchQuery: {
        createdAtEnd: null,
        createdAtStart: null,
        status: null,
        title: ''
      },
      currentPage: 1,
      pageSize: 10,
      totalArticles: 12,
      articles: [],
      filteredArticles: [],
      dialogVisible: false,
      currentArticle: {},
      formLabelWidth: '100px',
      categories: [], // 初始为空数组，等数据加载后赋值
      selectedCategory: [], // 选中的分类
      cascaderProps: {
        value: 'cid',
        label: 'categoryName',
        children: 'children'
      },
      selectedCategoryId: null,
      deleteDialogVisible: false, // 控制弹框显示的变
      articleToDelete: null // 存储待删除文章的对象
    }
  },
  created() {
    this.fetchArticles()
    this.fetchCategoryList()
  },
  methods: {
    fetchArticles() {
      // 构建请求参数
      const searchParams = {
        CreatedEnd: this.searchQuery.createdAtEnd ? this.formatDate(this.searchQuery.createdAtEnd) : '',
        categoryId: this.selectedCategoryId || 0,
        createdAt: this.searchQuery.createdAtStart ? this.formatDate(this.searchQuery.createdAtStart) : '',
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        title: this.searchQuery.title || '',
        status: this.searchQuery.status === '0' ? 0 : Number(this.searchQuery.status) || -1 // 默认为-1，表示所有状态
      }

      // 调用后端接口获取数据
      getUserArticleList(searchParams).then(response => {
        if (response.data.totalCount !== 0) {
          // 深拷贝文章数据，确保不会修改原始数据
          this.articles = JSON.parse(JSON.stringify(response.data.ArticleDataList))
          this.totalArticles = response.data.totalCount
          this.updateFilteredArticles()
          Message.success('获取文章列表成功')
        } else {
          Message.error('未找到匹配的文章')
          // 清空文章列表
          this.articles = []
          this.filteredArticles = []
        }
      }).catch(error => {
        console.error('获取文章列表失败:', error)
        Message.error('获取文章列表失败，请稍后重试')
      })
    },

    handleCategoryChange(value) {
      // 这里的 value 是一个数组，包含了从顶级到选中项的所有值
      this.selectedCategoryId = value[value.length - 1]
    },
    updateFilteredArticles() {
      this.filteredArticles = this.articles.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    handlePageChange(page) {
      this.currentPage = page
      this.updateFilteredArticles()
    },
    editArticle(article) {
      this.$router.push({ name: 'EditArticle', params: { id: article.articleId }})
    },
    viewArticle(article) {
      this.$router.push({ name: 'Detail', params: { id: article.articleId }})
    },
    deleteArticle(article) {
      // 调用后端接口删除文章
      const deleteParams = {
        articleId: article.articleId
      }
      deleteArticle(deleteParams).then(response => {
        if (response.data) {
          const index = this.articles.findIndex((a) => a.articleId === article.articleId)
          if (index !== -1) {
            this.articles.splice(index, 1)
            this.updateFilteredArticles()
          }
          Message.success('文章已删除')
        }
      })
    },
    getStatusTag(status) {
      switch (status) {
        case 0: return 'warning'
        case 1: return 'success'
        case 2: return 'info'
        case 3: return 'warning'
        case 4: return 'danger'
        case 5: return 'black'
        default: return ''
      }
    },
    getStatusText(status) {
      switch (status) {
        case 0: return '草稿'
        case 1: return '已发布'
        case 2: return '已删除'
        case 3: return '待审核'
        case 4: return '已驳回'
        case 5: return '已计划'
        default: return '未知'
      }
    },
    // 获取文章分类列表
    fetchCategoryList() {
      getArticleCategory().then(response => {
        if (response.data) {
          // 将文章分类填充到表单的categories字段
          this.categories = JSON.parse(JSON.stringify(response.data.CategoryList)) // 深拷贝
          console.log('CategoryList:', this.categories)
        }
      }).catch(error => {
        console.error('获取文章分类失败', error)
      })
    },
    handleSearch() {
      // 实现搜索逻辑
      console.log('搜索条件:', this.searchQuery)
      this.fetchArticles()
    },
    clearSearch() {
      // 清空搜索条件
      this.searchQuery = {
        title: '',
        status: null,
        createdAtStart: null,
        createdAtEnd: null
      }
      this.selectedCategory = []
      this.selectedCategoryId = null

      this.handleSearch() // 执行一次搜索，确保清空后能显示所有数据
    },
    showDeleteDialog(article) {
      // 设置弹框内容并显示弹框
      this.articleName = article.title
      this.articleToDelete = article
      this.deleteDialogVisible = true
    },
    resetDeleteState() {
      // 关闭弹框并清除数据
      this.deleteDialogVisible = false
      this.articleToDelete = null
    },
    confirmDelete() {
      // 执行删除操作
      this.deleteArticle(this.articleToDelete)
      this.resetDeleteState() // 关闭弹框
    }
  }
}
</script>

<style scoped>
.article-management {
  padding: 20px;
  background-color: #f9fafb; /* 给整个页面添加浅灰色背景 */
}

.card-container {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果，让卡片有浮动感 */
}

.card-header {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #333; /* 强化标题字体颜色 */
}

.search-input {
  width: 100%; /* 修改为100%宽度，适应不同的布局 */
  max-width: 300px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
  padding-top: 10px;
}

.dialog-footer {
  text-align: right;
  padding: 10px;
}

.el-table {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed; /* 增加表格边框 */
  border-radius: 8px; /* 给表格添加圆角 */
}

.el-table th {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #555;
  padding: 10px;
}

.el-table td {
  padding: 10px;
  vertical-align: middle;
}

.el-table .el-tag {
  font-size: 14px;
  margin: 0 5px;
}

.el-button {
  margin-left: 5px;
  padding: 8px 15px; /* 调整按钮内边距 */
}

.book-importance {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.book-importance .el-icon-star-on,
.book-importance .el-icon-star-off {
  font-size: 16px;
  color: #f8d04e;
  cursor: pointer; /* 增加点击效果 */
}

.book-importance .el-icon-star-on:hover,
.book-importance .el-icon-star-off:hover {
  color: #ffb800; /* 鼠标悬停时改变星星颜色 */
}

@media (max-width: 768px) {
  .card-container {
    padding: 15px;
  }

  .search-input {
    width: 100%; /* 确保小屏幕下搜索框能自适应 */
  }

  .el-button {
    margin-left: 0;
    width: 100%; /* 确保按钮在小屏幕上占满一行 */
    margin-top: 10px;
  }

  .book-importance {
    justify-content: center;
  }
}
.search-button {
  margin-top: 10px;
}

.operation-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-right: 10px; /* 为每个操作按钮添加间距 */
}

.operation-item i {
  font-size: 18px;
  margin-right: 5px; /* 图标与文字之间的间距 */
  color: #409EFF; /* 默认图标颜色，可以根据需求调整 */
}

.operation-item:hover i {
  color: #66b1ff; /* 鼠标悬停时改变图标颜色 */
}

.operation-text {
  font-size: 14px;
  color: #409EFF;
}

.operation-item:hover .operation-text {
  color: #66b1ff; /* 鼠标悬停时改变文字颜色 */
}
</style>

