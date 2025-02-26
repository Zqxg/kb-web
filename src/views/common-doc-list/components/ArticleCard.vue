<template>
  <div class="article-card">
    <!-- 封面区 -->
    <div class="book-cover" :style="{ background: randomGradient }">
      <h3 class="book-title" @click="goToDetail(article.articleId)">{{ article.title }}</h3>
      <p class="book-author">
        <i class="el-icon-s-check" /> {{ article.author }}
      </p>
    </div>
    <!-- 内容区 -->
    <div class="book-details">
      <div class="book-category">
        <svg-icon icon-class="list" />  {{ article.category }}
      </div>
      <!-- 星级评分部分 -->
      <div class="book-importance">
        <span v-for="star in article.importance" :key="star" class="el-icon-star-on" />
        <span v-for="emptyStar in (3 - article.importance)" :key="emptyStar" class="el-icon-star-off" />
      </div>
      <!-- 时间和摘要部分 -->
      <div class="book-time">
        <i class="el-icon-date" />
        <span>创建时间: {{ formatDate(article.createdAt) }}</span> |
        <span>最近更新: {{ formatDate(article.updateAt) }}</span>
      </div>
      <div class="book-summary">
        <p>摘要: {{ truncatedContentShort }}</p>
      </div>
      <div class="book-content">
        <p>内容: {{ truncatedContent }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      randomGradient: this.generateRandomGradient()
    }
  },
  computed: {
    // 截取摘要，限制为30个字符，超过则加省略号
    truncatedContent() {
      return this.article.content.length > 30
        ? this.article.content.slice(0, 30) + '...'
        : this.article.content
    },
    truncatedContentShort() {
      return this.article.contentShort.length > 30
        ? this.article.contentShort.slice(0, 30) + '...'
        : this.article.contentShort
    }
  },
  methods: {
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString() // 可以根据需要调整日期格式
    },
    goToDetail(articleId) {
      // 跳转到文章详情页，传递 articleId
      this.$router.push({ path: `/article/detail/${articleId}` })
    },
    generateRandomGradient() {
      const colors = [
        '#ff9a9e',
        '#fad0c4',
        '#a1c4fd',
        '#c2e9fb',
        '#fbc2eb',
        '#a6c1ee',
        '#fddb92',
        '#d4fc79',
        '#96e6a1',
        '#84fab0',
        '#8fd3f4',
        '#a8edea'
      ]
      const color1 = colors[Math.floor(Math.random() * colors.length)]
      const color2 = colors[Math.floor(Math.random() * colors.length)]
      return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
    }
  }
}
</script>

<style scoped>
.article-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fdfaf2;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: auto; /* 限制最大宽度 */
  max-width: 100%; /* 防止宽度超出父容器 */
  margin: 0 auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.book-cover {
  padding: 16px;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.book-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.book-author {
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-details {
  padding: 5%;
  background-color: #fdfaf2;
}

.book-category,
.book-time,
.book-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #a8a8a7;
  margin-bottom: 5px;
}
.book-content{
  font-size: 16px;
  color: #888680;
}
@media (max-width: 768px) { /* 针对平板和手机 */
  .article-card {
    width: calc(100% - 20px); /* 让卡片宽度适配小屏幕，减去边距 */
    max-width: 400px; /* 限制最大宽度 */
    min-width: 280px; /* 设置最小宽度，确保内容不会过小 */
    margin: 10px auto;
  }
}

@media (max-width: 380px) { /* 针对更小的手机 */
  .article-card {
    margin-left: -10px; /* 减少左边距 */
    min-width: 10px; /* 更小的最小宽度 */
  }
}
.book-importance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  color: #ffd700; /* 星星颜色 */
}

</style>
