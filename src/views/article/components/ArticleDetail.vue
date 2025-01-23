<!--<template>-->
<!--  <div class="article-detail">-->
<!--    <h1>{{ article.title }}</h1>-->
<!--    <p>{{ article.content }}</p>-->
<!--  </div>-->
<!--</template>-->
<!--<script>-->
<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      article: {}-->
<!--    }-->
<!--  },-->
<!--  created() {-->
<!--    this.fetchArticle()-->
<!--  },-->
<!--  methods: {-->
<!--    fetchArticle() {-->
<!--      const id = this.$route.params.id-->
<!--      this.$axios.get(`/api/articles/${id}`)-->
<!--        .then(res => {-->
<!--          this.article = res.data-->
<!--        })-->
<!--        .catch(err => {-->
<!--          console.log(err)-->
<!--        })-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
