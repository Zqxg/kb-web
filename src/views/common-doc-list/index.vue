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
            :category-id="selectedCategoryId"
            :page-num="pageNum"
            :page-size="pageSize"
            :sort-order="sortOrder"
          />
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
    total: {
      type: Number
    },
    pageNum: {
      type: Number,
      default: 1 // 默认当前页为 1
    },
    pageSize: {
      type: Number,
      default: 10 // 默认每页显示 10 条数据
    }
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
      this.page = 1 // 分类切换时，重置为第一页
    },
    handleSortChange(order) {
      this.sortOrder = order
    },
    handlePageChange(currentPage) {
      this.pageNum = currentPage
    },
    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize
    }
  }
}
</script>

<style scoped>
.common-doc-list {
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  background-color: #f5f5f5;
  padding: 20px 5%;
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
  gap: 30px; /* 间距调整 */
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
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
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
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content {
    flex-direction: column; /* 从横向布局改为纵向布局 */
  }

  .content-category-list {
    flex: 1; /* 占满宽度 */
  }

  .divider {
    flex: 1; /* 占满宽度 */
  }
}
</style>

