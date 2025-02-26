<template>
  <div class="knowledge-home">
    <!-- 上部分：搜索框 -->
    <div class="top-section">
      <div class="logo-container">
        <!-- 系统名称和图标 -->
        <img src="@/assets/logo.png" alt="Logo" class="logo">
        <h1 class="system-title">罗道知库 Pathfinder</h1>
      </div>
      <SearchBar :categories="categories" @search="handleSearch" />
    </div>

    <!-- 下部分：灰色背景，居中模块，80%宽度 -->
    <div class="bottom-section">
      <!-- 容器：中间80%宽度 -->
      <div class="content-container">
        <!-- 左侧部分：目录分类、标签、热门知识 -->
        <div class="left-side">
          <div class="card">
            <CategoryList :categories="categories" @select="handleCategorySelect" @categories="handleCategories" />
          </div>
          <div class="card">
            <TagList :tags="tags" @clickTag="handleTagClick" />
          </div>
          <div class="card">
            <HotKnowledge :articles="hotArticles" @viewArticle="handleViewArticle" />
          </div>
        </div>

        <!-- 右侧部分：推荐模块 -->
        <div class="right-side">
          <div class="card">
            <Recommendations :articles="recommendedArticles" @viewArticle="handleViewArticle" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
import CategoryList from './components/CategoryList.vue'
import TagList from './components/TagList.vue'
import HotKnowledge from './components/HotKnowledge.vue'
import Recommendations from './components/Recommendations.vue'

export default {
  components: {
    SearchBar,
    CategoryList,
    TagList,
    HotKnowledge,
    Recommendations
  },
  data() {
    return {
      categories: [],
      tags: [],
      hotArticles: [],
      recommendedArticles: []
    }
  },
  methods: {
    handleSearch(query) {
      console.log('搜索内容：', query)
    },
    handleCategorySelect(category) {
      console.log('选中的分类：', category)
    },
    handleTagClick(tag) {
      console.log('点击的标签：', tag)
    },
    handleViewArticle(articleId) {
      console.log('查看文章 ID：', articleId)
    },
    handleCategories(categories) {
      this.categories = categories // 更新父组件的 categories 数据
    }
  }
}
</script>

<style scoped>
/* 系统名称和图标的容器 */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px; /* 系统名称和搜索框之间的间距 */
  flex-direction: row;
  gap: 10px;
  margin-top: 30px;
}

/* 图标样式 */
.logo {
  width: 80px; /* 图标大小 */
  height: 80px;
}

/* 系统名称样式 */
.system-title {
  font-size: 36px; /* 字体大小 */
  color: #333;
  font-weight: bold;
  margin: 0;
}

.top-section {
  background-color: white;
  padding: 20px;
  text-align: center;
}

.bottom-section {
  background-color: #f5f5f5; /* 灰色背景覆盖下部分 */
  padding: 0;
  min-height: 100vh; /* 确保灰色背景覆盖整个下部分 */
}

.content-container {
  display: flex;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto;
  padding: 20px 0; /* 适当的上下内边距 */
  transition: all 0.3s ease;
}

.left-side {
  flex: 2; /* 设置左侧的宽度比例为2 */
  min-width: 200px; /* 最小宽度设置，避免太窄 */
  margin-right: 20px;
}

.right-side {
  flex: 8; /* 设置右侧的宽度比例为8 */
  min-width: 200px; /* 最小宽度设置，避免太窄 */
}

.card {
  background-color: #ffffff; /* 设置背景颜色 */
  padding: 10px; /* 内部间距 */
  margin-bottom: 20px; /* 下方间距 */
  border-radius: 12px; /* 圆角效果 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  transition: all 0.3s ease; /* 卡片的过渡效果 */
}

/* 鼠标悬停时的效果 */
.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
  transform: translateY(-4px); /* 提升卡片 */
}

/* 卡片标题的额外样式 */
.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px; /* 标题和内容的间距 */
  color: #333333; /* 标题颜色 */
}

.left-side .category-list,
.left-side .tag-list,
.left-side .hot-knowledge,
.right-side .recommendations {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    width: 90%; /* 在较小屏幕上宽度调整 */
  }

  .left-side {
    flex: 2;
    margin-right: 15px;
  }

  .right-side {
    flex: 8;
  }
}

@media (max-width: 768px) {
  .content-container {
    flex-direction: column; /* 在小屏幕上将内容排列为垂直 */
    width: 95%;
  }

  .left-side,
  .right-side {
    flex: 1; /* 左右两部分宽度相等 */
    margin-right: 0;
  }

  .right-side {
    order: -1; /* 使右侧部分显示在上方 */
  }

  .card {
    background-color: #ffffff; /* 设置背景颜色 */
    padding: 10px; /* 内部间距 */
    margin-bottom: 20px; /* 下方间距 */
    border-radius: 12px; /* 圆角效果 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 阴影效果 */
    transition: all 0.3s ease; /* 卡片的过渡效果 */
  }

  /* 鼠标悬停时的效果 */
  .card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
    transform: translateY(-4px); /* 提升卡片 */
  }

  /* 卡片标题的额外样式 */
  .card-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px; /* 标题和内容的间距 */
    color: #333333; /* 标题颜色 */
  }
}

@media (max-width: 480px) {
  .top-section {
    padding: 10px; /* 顶部间距调整 */
  }

  .search-bar {
    width: 100%; /* 搜索框宽度调整 */
  }

  .content-container {
    width: 100%;
    padding: 10px; /* 减小内边距 */
  }

  .left-side,
  .right-side {
    width: 100%; /* 左右两部分宽度调整为100% */
    margin-bottom: 20px;
  }

  .card {
    padding: 10px; /* 缩小卡片内边距 */
  }
}
</style>

