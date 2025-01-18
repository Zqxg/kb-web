<template>
  <div class="hot-knowledge">
    <h3>热门知识</h3>
    <el-table :data="articles" border>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="views" label="浏览量" width="120" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="text" @click="$emit('viewArticle', scope.row.id)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
.hot-knowledge {
  margin-bottom: 20px;
}
</style>
