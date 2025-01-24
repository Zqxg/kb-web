<template>
  <article-create :is-edit="false" />
</template>

<script>
import ArticleCreate from './components/ArticleCreate.vue'

export default {
  name: 'CreateArticle',
  // eslint-disable-next-line vue/no-unused-components
  components: { ArticleCreate }
}
</script>

