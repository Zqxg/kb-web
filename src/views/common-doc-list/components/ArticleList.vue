<template>
  <div class="article-list">
    <div v-if="articles.length === 0" class="empty-content">
      <svg-icon icon-class="empty" class="empty-icon" />
      <div class="empty-text">没有相关内容</div>
    </div>
    <ul>
      <li v-for="article in articles" :key="article.title">
        {{ article.title }} - {{ article.date }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    articles: Array
  }
}
</script>

<style scoped>

.article-list {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.article-list ul {
  list-style-type: none;
  padding: 0;
}
.article-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: #f1f1f1;
  border-radius: 5px;
}
.article-list li:hover {
  background-color: #e1e1e1;
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
  font-size: 64px; /* 图标大一点 */
  margin-bottom: 10px; /* 图标和文字间隔 */
}

.empty-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.2); /* 文字透明一点 */
}
</style>
