<template>
  <div class="common-doc-list">
    <div class="header">
      <p class="title"><svg-icon icon-class="list" /> 知识目录</p>
      <SortSelect @sort-change="handleSortChange" />
    </div>
    <div class="content">
      <Sidebar
        :categories="categories"
        class="content-category-list"
        @category-select="handleCategorySelect"
      />
      <div class="divider">
        <!-- 内容部分 -->
        <div class="content-article-list">
          <ArticleList
            :articles="filteredArticles"
          />
          <div v-if="filteredArticles.length === 0" class="empty-content">
            <svg-icon icon-class="empty" class="empty-icon" />
            <div class="empty-text">暂无数据</div>
          </div>
        </div>
        <!-- 分页部分 -->
        <Page
          class="pagination"
          :current="pageNum"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="prev, pager, next, jumper, ->, sizes"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import ArticleList from './components/ArticleList.vue'
import SortSelect from './components/SortSelect.vue'
import Page from 'element-ui/lib/pagination' // 使用 Element UI 的分页组件

export default {
  components: {
    Sidebar,
    ArticleList,
    SortSelect,
    Page
  },
  props: {
    total: Number, // 总条数
    pageNum: Number, // 当前页
    pageSize: Number // 每页显示条数
  },
  data() {
    return {
      categories: [],
      articleList: [],
      selectedCategoryId: null,
      sortOrder: 'asc' // 默认升序
    }
  },
  computed: {
    filteredArticles() {
      let filtered = this.articleList
      if (this.selectedCategoryId) {
        filtered = filtered.filter(
          (article) => article.categoryId === this.selectedCategoryId
        )
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
    },
    handlePageChange(newPageNum) {
      this.$emit('page-change', newPageNum) // todo:向子组件发送页码改变事件
    },
    handlePageSizeChange(newPageSize) {
      this.$emit('page-size-change', newPageSize) // todo:向子组件发送页码改变事件
    }
  }
}
</script>

<style scoped>
.common-doc-list {
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 90vh;
  background-color: #f5f5f5;
  padding: 20px 100px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: #707377;
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.content {
  display: flex;
  flex: 1;
  gap: 10px; /* 间距调整 */
}
.content-category-list {
  flex: 2;
}
.divider {
  flex: 8;
  display: flex;
  flex-direction: column;
}
.content-article-list {
  flex: 9;
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.pagination {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
.empty-text {
  font-size: 16px;
}
</style>
