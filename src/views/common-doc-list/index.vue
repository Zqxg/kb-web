<template>
  <div class="common-doc-list">
    <div class="header">
      <h1 class="title">知识目录</h1>
      <SortSelect @sort-change="handleSortChange" />
    </div>
    <div class="content">
      <Sidebar :categories="categories" @category-select="handleCategorySelect" />
      <ArticleList :articles="filteredArticles" />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import ArticleList from './components/ArticleList.vue'
import SortSelect from './components/SortSelect.vue'

export default {
  components: {
    Sidebar,
    ArticleList,
    SortSelect
  },
  data() {
    return {
      categories: [
        { name: '编程', id: 1 },
        { name: '数据科学', id: 2 },
        { name: '计算机网络', id: 3 }
      ],
      articles: [
        { title: 'Vue基础教程', categoryId: 1, date: '2025-01-01' },
        { title: 'Python数据分析', categoryId: 2, date: '2025-01-03' },
        { title: '计算机网络原理', categoryId: 3, date: '2025-01-05' }
        // 更多文章
      ],
      selectedCategoryId: null,
      sortOrder: 'asc' // 默认升序
    }
  },
  computed: {
    filteredArticles() {
      let filtered = this.articles
      if (this.selectedCategoryId) {
        filtered = filtered.filter(article => article.categoryId === this.selectedCategoryId)
      }
      return filtered.sort((a, b) => {
        if (this.sortOrder === 'asc') {
          return new Date(a.date) - new Date(b.date)
        } else {
          return new Date(b.date) - new Date(a.date)
        }
      })
    }
  },
  methods: {
    handleCategorySelect(categoryId) {
      this.selectedCategoryId = categoryId
    },
    handleSortChange(order) {
      this.sortOrder = order
    }
  }
}
</script>

<style scoped>
.common-doc-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.title {
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 20px;
}
</style>
