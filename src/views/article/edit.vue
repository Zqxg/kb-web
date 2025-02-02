<template>
  <article-create :is-edit="true" />
</template>

<script>
import ArticleCreate from './components/ArticleCreate.vue'

export default {
  name: 'EditForm',
  components: { ArticleCreate }
}
</script>

