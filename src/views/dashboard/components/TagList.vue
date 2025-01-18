<template>
  <div class="tag-list">
    <h3>标签</h3>
    <el-tag
      v-for="tag in tags"
      :key="tag.id"
      type="primary"
      class="tag"
      @click="$emit('clickTag', tag)"
    >
      {{ tag.name }}
    </el-tag>
  </div>
</template>

<script>
export default {
  props: {
    tags: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.tag-list .tag {
  margin: 5px;
}
</style>
