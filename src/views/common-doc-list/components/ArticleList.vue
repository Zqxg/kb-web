<template>
  <div class="article-list">
    <!-- 文章列表 -->
    <div class="article-cards">
      <article-card
        v-for="article in articles"
        :key="article.article_id"
        :article="article"
      />
    </div>

  </div>
</template>

<script>
import ArticleCard from './ArticleCard.vue'

export default {
  components: {
    ArticleCard
  }
}
</script>

<style scoped>
.article-list {
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.2);
}

.article-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 设置列布局 */
  gap: 16px;
}

.article-cards > div {
  background-color: #f1f1f1;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.article-cards > div:hover {
  background-color: #e1e1e1;
}

</style>
