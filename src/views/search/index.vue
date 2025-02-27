<template>
  <div class="search-page">
    <!-- 搜索条件组件 -->
    <div class="search-conditions">
      <div class="search-type">
        <label class="search-label">
          <input v-model="searchType" type="radio" value="normal"> 普通搜索
        </label>
        <label class="search-label">
          <input v-model="searchType" type="radio" value="advanced" @click="fetchColleges"> 高级搜索
        </label>
      </div>

      <!-- 普通搜索 -->
      <div v-if="searchType === 'normal'" class="normal-search">
        <SearchBar
          :categories="categories"
          @search="fetchSearchResults"
          @searchResults="handleSearchResults"
          @categoriesName="handleCategoriesName"
          @query="handleQuery"
          @selectedCategories="handleSelectedCategories"
        />
      </div>

      <!-- 高级搜索 -->
      <div v-if="searchType === 'advanced'" class="advanced-search">
        <!-- 标题 -->
        <div class="search-field">
          <label for="title">标题：</label>
          <input id="title" v-model="advancedSearch.title" type="text" placeholder="请输入标题">
        </div>

        <!-- 摘要（关键字） -->
        <div class="search-field">
          <label for="keywords">摘要：</label>
          <input id="keywords" v-model="advancedSearch.keywords" type="text" placeholder="请输入摘要关键字，多个用逗号分隔">
        </div>

        <!-- 内容 -->
        <div class="search-field">
          <label for="content">内容：</label>
          <input id="content" v-model="advancedSearch.content" type="text" placeholder="请输入内容">
        </div>

        <!-- 目录分类 -->
        <div class="search-field">
          <label for="categories">分类：</label>
          <el-cascader
            id="categories"
            v-model="selectedCategories"
            :options="advancedSearch.categories"
            multiple
            filterable
            clearable
            placeholder="选择分类"
            :props="{ checkStrictly: true, label: 'label', emitPath: false,multiple: true }"
            @change="handleCategorysChange"
          />
        </div>

        <!-- 重要性 -->
        <div class="search-field">
          <label for="importance">重要性：</label>
          <select id="importance" v-model="advancedSearch.importance">
            <option value="-1">不限</option>
            <option value="1">1星</option>
            <option value="2">2星</option>
            <option value="3">3星</option>
          </select>
        </div>

        <!-- 发布时间 -->
        <div class="search-field">
          <label for="createTimeStart">发布时间：</label>
          <input id="createTimeStart" v-model="advancedSearch.createTimeStart" type="date" placeholder="开始时间">
          <span>至</span>
          <input id="createTimeEnd" v-model="advancedSearch.createTimeEnd" type="date" placeholder="结束时间">
        </div>

        <!-- 按钮容器，使用 flexbox 布局 -->
        <div class="button-container">
          <!-- 搜索按钮 -->
          <button class="search-btn" @click="handleAdvancedSearch">搜索</button>
          <!-- 清空按钮 -->
          <button class="clear-btn" @click="clearSearchFields">清空</button>
        </div>
      </div>
    </div>

    <!-- 检索记录 -->
    <div>
      <div class="search-records">
        <p>检索记录： {{ query }} </p>
        <p>分类： {{ categoriesName }}</p>
        <p>为您找到相关结果 {{ searchResults.totalCount }} 个</p>
      </div>

      <!-- 搜索结果展示 -->
      <div class="search-results">
        <div v-if="searchResults.totalCount !== 0">
          <div v-for="(item, index) in searchResults.articles" :key="index" class="result-item">
            <div class="result-content">
              <h3 class="result-title" @click="goToDetail(item.article_id)" v-html="item.title" />
              <p class="result-author">作者：{{ item.author }}</p>
              <p class="content_short" v-html="item.content_short.slice(0, 500) ">摘要: </p>
              <p class="result-summary" v-html="item.content.slice(0, 500) + '...'" />
              <div class="result-details">
                <span class="result-category">分类：{{ item.category }}</span>
                <span class="result-score">评分：{{ item.score.toFixed(2) }}</span>
                <span class="result-date">发布于：{{ new Date(item.created_at).toLocaleString() }}</span>
                <span class="result-date">更新于：{{ new Date(item.updated_at).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 如果没有数据 -->
        <div v-if="searchResults.totalCount === 0" class="empty-content">
          <svg-icon icon-class="empty" class="empty-icon" />
          <div class="empty-text">暂无数据</div>
        </div>
      </div>
    </div>
    <!-- 分页组件 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="searchResults.totalCount"
        :page-size="searchResults.pageSize"
        :current-page="searchResults.currentPage"
        :page-count="pageCount"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import SearchBar from '@/views/dashboard/components/SearchBar.vue'
import { Message } from 'element-ui'
import { getArticleCategory, getArticleListByEs } from '@/api/article'

export default {
  name: 'Index',
  components: {
    SearchBar
  },
  data() {
    return {
      searchType: 'normal', // 默认是普通搜索
      query: '',
      categoriesName: [],
      searchResults: {
        totalCount: 0,
        pageSize: 10, // 默认每页 10 条
        currentPage: 1, // 默认页码 1
        articles: []
      },
      categories: [],
      selectedCategories: [], // 用于存储选中的分类名称
      pageCount: 0, // 存储总页数
      advancedSearch: {
        title: '',
        keywords: '',
        content: '',
        importance: 0,
        categories: [],
        createTimeStart: '',
        createTimeEnd: ''
      },
      formData: {
        mainProductArr: [],
        mainProductName: ''
      }
    }
  },
  watch: {
    // 监听 searchResults.currentPage，当当前页发生变化时更新路由参数
    'searchResults.currentPage': function(newPage) {
      // 将当前页加入到路由参数中
      this.$router.push({
        path: this.$route.path,
        query: {
          query: this.query,
          categoriesName: this.categoriesName,
          searchResults: JSON.stringify(this.searchResults),
          selectedCategories: JSON.stringify(this.selectedCategories),
          currentPage: newPage
        }
      })
    }
  },
  created() {
    // 从路由查询参数获取传递的 searchResults 数据
    if (this.$route.query.searchResults) {
      // 这里假设传递的是 JSON 格式的字符串，所以需要解析
      this.searchResults = JSON.parse(this.$route.query.searchResults)
      this.query = this.$route.query.query
      this.categoriesName = this.$route.query.categoriesName
      this.selectedCategories = JSON.parse(this.$route.query.selectedCategories)
      this.searchResults.currentPage = Number(this.$route.query.currentPage) || 1 // 默认第一页
    } else {
      // 如果没有查询结果数据，设置默认值
      this.query = ''
      this.categoriesName = []
      this.searchResults = { totalCount: 0, articles: [] }
    }
  },
  methods: {
    fetchColleges() {
      getArticleCategory().then(response => {
        if (response.data && response.data.CategoryList) {
          this.advancedSearch.categories = this.transformCategories(response.data.CategoryList)
        }
      }).catch(error => {
        console.error('获取文章分类失败', error)
      })
    },
    // 处理分类数据，转换成 el-cascader 需要的格式
    transformCategories(categories) {
      return categories.map(category => ({
        value: category.cid,
        label: category.categoryName,
        children: category.children && category.children.length
          ? this.transformCategories(category.children)
          : [], // 如果没有子类目，递归处理
        disabled: category.isVariety === 0 // 判断是否禁用
      }))
    },
    // 发起搜索请求的处理方法
    fetchSearchResults() {
      const requestData = {
        advSearch: false,
        categories: this.selectedCategories,
        column: '_score',
        content: this.query,
        keywords: [this.query],
        importance: '-1',
        order: 'desc',
        pageIndex: this.searchResults.currentPage,
        pageSize: this.searchResults.pageSize,
        phraseMatch: false,
        title: this.query
      }

      // 发送搜索请求，假设通过 API 获取数据
      getArticleListByEs(requestData).then(res => {
        if (res.code === 0) {
          // 确保返回的数据格式正确，避免 searchResults.articles 为 null
          if (!res.data.articles) {
            res.data.articles = []
          }
          this.searchResults = {
            ...res.data, // 保持原有数据结构
            articles: res.data.articles || [] // 确保 articles 为空数组而不是 null
          }
          this.pageCount = Math.ceil(res.data.totalCount / this.searchResults.pageSize)
        } else {
          Message.error('搜索失败:' + res.message)
        }
      }).catch(error => {
        Message.error('搜索失败: ' + error.message)
      })
    },
    // 处理当前页变化
    handleCurrentChange(page) {
      this.searchResults.currentPage = page
      this.fetchSearchResults() // 调用查询方法
    },

    // 接收子组件传递的 searchResults
    handleSearchResults(data) {
      this.searchResults = JSON.parse(data) // 如果传递的是 JSON 字符串
    },

    // 接收子组件传递的 categoriesName
    handleCategoriesName(data) {
      this.categoriesName = data // 假设传递的是以逗号分隔的字符串
    },

    // 接收子组件传递的 selectedCategories
    handleSelectedCategories(data) {
      this.selectedCategories = JSON.parse(data) // 假设传递的是以逗号分隔的字符串
    },

    // 接收子组件传递的 query
    handleQuery(data) {
      this.query = data
    },

    goToDetail(articleId) {
      // 跳转到文章详情页，传递 articleId
      this.$router.push({ path: `/article/detail/${articleId}` })
    },
    handleAdvancedSearch() {
      if (this.advancedSearch) {
        // 构建请求数据
        const requestData = {
          advSearch: true,
          categories: this.selectedCategories,
          column: '_score',
          content: this.advancedSearch.content,
          keywords: [this.advancedSearch.keywords],
          order: 'desc',
          pageIndex: 1, // 默认页码1
          pageSize: 10, // 默认每页10条
          phraseMatch: false,
          title: this.advancedSearch.title,
          importance: this.advancedSearch.importance,
          createTimeStart: this.advancedSearch.createTimeStart,
          createTimeEnd: this.advancedSearch.createTimeEnd
        }

        // 发起搜索请求
        getArticleListByEs(requestData).then(res => {
          if (res.code === 0) {
            Message.success('搜索成功')
            // 确保返回的数据格式正确，避免 searchResults.articles 为 null
            if (!res.data.articles) {
              res.data.articles = []
            }
            this.searchResults = {
              ...res.data, // 保持原有数据结构
              articles: res.data.articles || [] // 确保 articles 为空数组而不是 null
            }
            this.pageCount = Math.ceil(res.data.totalCount / this.searchResults.pageSize)

            // 调用 buildSearchQuery 函数构建查询条件
            this.query = this.buildSearchQuery()
          } else {
            Message.error('搜索失败:' + res.message)
          }
        }).catch(error => {
          Message.error('搜索失败: ' + error.message)
        })
      }
    },
    handleCategorysChange(value) {
      const textArr = []
      // 如果选择超过3个，弹出提示
      if (value.length > 3) {
        value.splice(-2, 1)
        this.$message.warning('最多只能选择三种分类')
      }
      // 清空 selectedCategoriesName，确保同步
      this.selectedCategories = []
      this.categoriesName = []
      // 获取选择的分类名称
      value.forEach(id => {
        const itemValue = this.findCategoryById(id)
        textArr.push(itemValue.label)
        this.categoriesName.push(itemValue.label)
        this.selectedCategories.push(itemValue.value)
      })
      this.formData.mainProductName = textArr.join(',')
      this.formData.mainProductArr = value
    },
    // 通过ID查找分类名称
    findCategoryById(id) {
      return this._findCategoryById(this.advancedSearch.categories, id)
    },
    _findCategoryById(categories, id) {
      for (const category of categories) {
        if (category.value === id) {
          return category
        }
        if (category.children && category.children.length) {
          const found = this._findCategoryById(category.children, id)
          if (found) return found
        }
      }
      return null
    },
    buildSearchQuery() {
      const conditionStr = []

      // 判断每个条件是否有值，并将其加入到查询字符串数组中
      if (this.advancedSearch.title) {
        conditionStr.push(`标题：${this.advancedSearch.title}`)
      }
      if (this.advancedSearch.keywords) {
        conditionStr.push(`摘要：${this.advancedSearch.keywords}`)
      }
      if (this.advancedSearch.content) {
        conditionStr.push(`内容：${this.advancedSearch.content}`)
      }
      if (this.advancedSearch.importance !== 0) {
        let importanceStr = ''
        switch (this.advancedSearch.importance) {
          case 1:
            importanceStr = '低'
            break
          case 2:
            importanceStr = '中'
            break
          case 3:
            importanceStr = '高'
            break
        }
        conditionStr.push(`重要性：${importanceStr}`)
      }
      if (this.advancedSearch.createTimeStart || this.advancedSearch.createTimeEnd) {
        const start = this.advancedSearch.createTimeStart ? this.advancedSearch.createTimeStart : '不限'
        const end = this.advancedSearch.createTimeEnd ? this.advancedSearch.createTimeEnd : '不限'
        conditionStr.push(`发布时间：${start} 至 ${end}`)
      }

      // 用分号拼接所有条件
      return conditionStr.join('；') || '暂无搜索条件'
    },
    clearSearchFields() {
      // 清空所有搜索字段
      this.advancedSearch = {
        title: '',
        keywords: '',
        content: '',
        importance: '-1',
        categories: this.advancedSearch.categories,
        createTimeStart: '',
        createTimeEnd: ''
      }
      this.selectedCategories = []
      this.categoriesName = []
      this.query = ''
    }
  }
}
</script>

<style scoped>
.search-page {
  background-color: #f5f5f5;
}

.search-conditions {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.search-type {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px; /* label之间的间隔 */
}

.search-label {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: #333;
  cursor: pointer;
  padding: 8px 20px; /* 增加内边距，形成椭圆形 */
  border-radius: 50px; /* 圆角，形成椭圆形 */
  transition: background-color 0.3s ease, color 0.3s ease;
}

.search-label:hover {
  background-color: #007bff; /* 鼠标悬停时背景色 */
  color: white; /* 鼠标悬停时文字颜色 */
}

.search-label input[type="radio"] {
  margin-right: 8px; /* radio按钮和文字之间的间距 */
  accent-color: #007bff; /* 改变单选按钮的颜色 */
  display: inline-block; /* 确保input和文本排列一致 */
}

.search-label input[type="radio"]:checked + span:hover {
  background-color: #0069d9; /* 鼠标悬停时的背景色 */
}

.search-label input[type="radio"]:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 聚焦时边框阴影 */
}

/* 普通搜索和高级搜索部分 */
.normal-search, .advanced-search {
  margin-top: 10px;
}

input[type="text"] {
  padding: 8px;
  width: 200px;
  margin-right: 10px;
}

select {
  padding: 8px;
  margin-right: 10px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}
.search-results {
  min-height: 400px; /* 设置默认高度 */
  margin-top: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-results ul {
  display: flex;
  flex-wrap: wrap;  /* 使列表项呈流式布局 */
  gap: 10px;
  padding: 0;
}

.search-results li {
  width: calc(33% - 10px); /* 每个列表项占据 1/3 的宽度 */
  list-style: none;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.empty-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
.result-title {
  font-size: 18px;
  font-weight: bold;
}
.result-item {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 80%;
  margin: 10px auto;
}

.result-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.result-content {
  padding: 10px 0;
}

.result-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.result-title mark {
  background-color: yellow;
  color: black;
  padding: 0 4px;
}

.result-author {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.content_short {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.result-summary {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.result-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.result-details span {
  margin-right: 15px;
  margin-bottom: 5px;
}

.result-category,
.result-score,
.result-date {
  font-weight: 400;
  font-size: 14px;
}

.result-category {
  color: #5c6bc0;
}

.result-score {
  color: #ff9800;
}

.result-date {
  color: #2196f3;
}

.advanced-search {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 60%;
  margin: 0 auto;
}

.search-field {
  display: flex;
  flex-wrap: wrap;
  gap: 15px; /* 输入框之间的间隔 */
  margin-bottom: 20px;
}

.search-field label {
  width: 100px;
  text-align: right;
  font-size: 14px;
  color: #333;
}

.search-field input[type="text"],
.search-field select {
  flex-grow: 1; /* 使输入框等长 */
  height: 35px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
}

.search-field input[type="text"]:focus,
.search-field select:focus {
  border-color: #007bff;
}

/* 发布时间部分 */
.search-field .create-time {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.search-field .create-time label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
}

.search-field input[type="date"] {
  flex-grow: 1; /* 保证输入框等长 */
  height: 45px; /* 增大高度 */
  width: 80px; /* 增大宽度 */
  padding: 0 15px; /* 增加内边距 */
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px; /* 增大字体 */
  outline: none;
}

.search-field input[type="date"]:focus {
  border-color: #007bff;
}

.search-field input[type="date"]::-webkit-calendar-picker-indicator {
  background-color: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.search-field input[type="date"]:hover {
  border-color: #0069d9;
}

.search-field .create-time span {
  display: inline-block;
  margin-left: 10px;
  font-size: 16px; /* 增大字体 */
  color: #666;
}
.search-field .el-cascader {
  width: 70%; /* 设置宽度与其他输入框一致 */
  height: 45px; /* 与输入框高度一致 */
}

.search-field .el-cascader .el-input__inner {
  height: 100%; /* 确保输入框的高度与父容器一致 */
  font-size: 16px; /* 增大字体 */
  padding: 0 15px; /* 增加内边距 */
  box-sizing: border-box; /* 确保宽度计算包括内边距 */
}

.search-field .el-cascader .el-input__inner:focus {
  border-color: #007bff;
}
/* 按钮容器，使用 Flexbox 布局 */
.button-container {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
  margin-top: 10px; /* 设置与其他内容的间距 */
  justify-content: flex-end;
}

/* 搜索按钮 */
.search-btn {
  background-color: #007bff; /* 绿色背景 */
  color: white; /* 白色文字 */
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  width: 30%;
}

/* 清空按钮 */
.clear-btn {
  background-color: red; /* 红色背景 */
  color: white; /* 白色文字 */
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  width: 30%;
}

/* 悬停效果 */
.search-btn:hover {
  background-color: #456ca0;
}

.clear-btn:hover {
  background-color: darkred;
}

</style>
