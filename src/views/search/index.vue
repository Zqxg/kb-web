<template>
  <div class="search-page">
    <!-- 搜索条件组件 -->
    <div class="search-conditions">
      <div class="search-type">
        <label class="search-label">
          <input v-model="searchType" type="radio" value="normal"> 普通搜索
        </label>
        <label class="search-label">
          <input v-model="searchType" type="radio" value="advanced"> 高级搜索
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
      <div v-if="searchType === 'advanced'" class="advanced-search" />
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
import { getArticleListByEs } from '@/api/article'

export default {
  name: 'Index',
  components: {
    SearchBar
  },
  data() {
    return {
      searchType: 'normal', // 默认是普通搜索
      query: '',
      categoriesName: '',
      searchResults: {
        totalCount: 0,
        pageSize: 10, // 默认每页 10 条
        currentPage: 1, // 默认页码 1
        articles: []
      },
      categories: [], // 假设这里从API获取分类
      selectedCategories: [], // 用于存储选中的分类
      pageCount: 0 // 存储总页数
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
      this.categoriesName = ''
      this.searchResults = { totalCount: 0, articles: [] }
    }
  },
  methods: {
    // 发起搜索请求的处理方法
    fetchSearchResults() {
      const requestData = {
        advSearch: true,
        categories: this.selectedCategories,
        column: '_score',
        content: this.query,
        keywords: [this.query],
        order: 'desc',
        pageIndex: this.searchResults.currentPage,
        pageSize: this.searchResults.pageSize,
        phraseMatch: true,
        searchMode: '0',
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
  font-size: 16px;
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
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  font-weight: 600;
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

</style>
