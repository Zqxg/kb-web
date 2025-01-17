<template>
  <select v-model="selectedSort" @change="onSortChange">
    <option value="asc">升序</option>
    <option value="desc">降序</option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      selectedSort: 'asc' // 默认升序
    }
  },
  methods: {
    onSortChange() {
      this.$emit('sort-change', this.selectedSort)
    }
  }
}
</script>
