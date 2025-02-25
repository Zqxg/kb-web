<template>
  <div class="category-list">
    <div class="header">
      <h3>目录</h3>
      <p class="more" @click="goToCommonDocList">更多 ></p>
    </div>
    <div class="title-divider" />
    <el-row :gutter="20">
      <el-col v-for="category in categories.slice(0, 8)" :key="category.cid" :span="24">
        <div class="category-item" @click="goToCategoryArticles(category.cid)">
          <p class="category-text">{{ category.categoryName }}</p>
        </div>
        <div class="divider" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getArticleCategory } from '@/api/article'

export default {
  data() {
    return {
      categories: [], // 存储分类列表
      allCategories: [] // 存储所有分类列表
    }
  },
  mounted() {
    this.fetchCollegeList()
  },
  methods: {
    fetchCollegeList() {
      getArticleCategory().then(response => {
        if (response.data && response.data.CategoryList) {
          this.allCategories = response.data.CategoryList
          this.categories = this.getTopLevelCategories(response.data.CategoryList)
        }
        // 传给父组件
        this.$emit('categories', this.allCategories)
      }).catch(error => {
        console.error('获取文章分类失败', error)
      })
    },
    getTopLevelCategories(categories) {
      return categories.filter(category => category.level === 1).map(category => ({
        ...category,
        children: [] // 确保不处理子目录
      }))
    },
    goToCategoryArticles(cid) {
      // 跳转到文章页面并传递 categoryId
      this.$router.push({ path: '/common-doc-list', query: { categoryId: cid }})
    },
    goToCommonDocList() {
      this.$router.push('/common-doc-list') // 跳转到文章页面
    }
  }
}
</script>

<style scoped>
.category-list {
  margin-bottom: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h3 {
  margin-left: 20px;  /* 增加标题右侧的间距 */
}

.more {
  color: #707377;
  cursor: pointer;
  margin: 0;
  font-size: 14px;
  margin-right: 10px; /* 增加“更多”左侧的间距 */
}
/* 目录项样式 */
.category-item {
  width: 150px; /* 设置目录项宽度 */
  height: 40px; /* 设置目录项高度 */
  padding: 10px;
  text-align: center; /* 让文字居中 */
  margin: 10px auto; /* 使目录项居中并且有一定的上下间距 */
  cursor: pointer;
  box-sizing: border-box;
}

/* 目录文字样式 */
.category-text {
  font-size: 14px; /* 设置字体大小 */
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis; /* 防止文字过长溢出 */
  white-space: nowrap; /* 防止文字换行 */
}

/* 分隔线样式 */
.divider {
  border-top: 1px dashed rgba(0, 0, 0, 0.1); /* 使用透明度低的虚线 */
  margin: 3px 0; /* 添加间距 */
}

.title-divider {
  border-top: 1px solid rgba(0, 0, 0, 0.2); /* 使用实线，透明度为0.2 */
}

/* 悬浮时变蓝色 */
.category-item:hover .category-text {
  color: #2876ef; /* 悬浮时改变文字颜色为蓝色 */
}
</style>
