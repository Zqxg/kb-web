<template>
  <div class="article-list">
    <!-- 文章列表 -->
    <div v-if="articles.length > 0" class="article-cards">
      <article-card
        v-for="article in articles"
        :key="article.articleId"
        :article="article"
      />
    </div>
    <div v-else class="empty-content">
      <svg-icon icon-class="empty" class="empty-icon" />
      <div class="empty-text">暂无数据</div>
    </div>
  </div>
</template>

<script>
import ArticleCard from './ArticleCard.vue'
import { getArticleListByCategory } from '@/api/article'
import { Message } from 'element-ui'

export default {
  components: {
    ArticleCard
  },
  props: {
    categoryId: {
      type: Number,
      default: null
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    sortOrder: {
      type: String,
      default: 'asc'
    }
  },
  data() {
    return {
      articles: [] // 用于存储文章数据
    }
  },
  watch: {
    categoryId: {
      immediate: true,
      handler(newVal) {
        this.fetchArticles(newVal, this.pageNum, this.pageSize, this.sortOrder)
      }
    },
    pageNum(newVal) {
      this.fetchArticles(this.categoryId, newVal, this.pageSize, this.sortOrder)
    },
    pageSize(newVal) {
      this.fetchArticles(this.categoryId, this.pageNum, newVal, this.sortOrder)
    },
    sortOrder(newVal) {
      this.fetchArticles(this.categoryId, this.pageNum, this.pageSize, newVal)
    }
  },
  methods: {
    fetchArticles(categoryId, pageIndex, pageSize, sortOrder) {
      console.log('Fetching articles with params:', { categoryId, pageIndex, pageSize, sortOrder })
      // 调用接口
      getArticleListByCategory({ categoryId, pageIndex, pageSize }).then(response => {
        console.log('Response:', response)
        if (response.data) {
          if (response.data.ArticleDataList !== null) {
            this.articles = response.data.ArticleDataList // 将获取的文章数据赋值给 articles
            Message.success('获取文章列表成功')
          } else {
            this.articles = []
            Message.warning('没有找到相关文章')
          }
        } else {
          this.articles = []
          Message.warning('没有找到相关文章')
        }
      }).catch(error => {
        this.articles = []
        console.error('获取文章列表失败', error)
      })
    }
  }
}
</script>

<style scoped>
.article-list {
  background-color: #fff;
  /*box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
  width: 100%; /* 父容器宽度设置为 100% */
  max-width: 100%; /* 防止溢出 */
}

.empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 20px;
}

.empty-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.2);
}

.article-list {
  padding: 20px;
  background-color: #fff;
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

.article-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 自动布局 */
  gap: 16px;
}

.article-cards > * {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}
</style>
