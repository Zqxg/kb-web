<template>
  <div class="common-doc-list">
    <div class="header">
      <p class="title"><svg-icon icon-class="list" /> 知识目录</p>
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
      ],
      articles: [
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
  background-color: #f5f5f5;
  padding-left: 50px;
  padding-right: 50px;
}
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  color: #707377;
  margin-bottom: -10px;

}
.title {
  margin: 0;
}
.content {
  display: flex;
  flex: 1;
  padding: 10px;
}
</style>
