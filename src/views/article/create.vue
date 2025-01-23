<template>
  <article-detail :is-edit="false" />
</template>

<script>
import CreateArticle from './components/CreateArticle'

export default {
  name: 'CreateArticle',
  // eslint-disable-next-line vue/no-unused-components
  components: { CreateArticle }
}
</script>

