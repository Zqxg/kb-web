<template>
  <div class="recommendations">
    <h3>推荐内容</h3>
    <el-carousel :interval="5000" type="card" height="200px">
      <el-carousel-item
        v-for="article in articles"
        :key="article.id"
        @click="$emit('viewArticle', article.id)"
      >
        <h4>{{ article.title }}</h4>
        <p>{{ article.summary }}</p>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
export default {
  props: {
    articles: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.recommendations {
  margin-bottom: 20px;
}
</style>
