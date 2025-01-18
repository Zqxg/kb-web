<template>
  <div class="header">
    <div class="logo-container">
      <!-- 系统名称和图标 -->
      <img src="@/assets/logo.png" alt="Logo" class="logo">
      <h1 class="system-title">罗道知库 Pathfinder</h1>
    </div>
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="请输入关键词进行搜索..."
      >
      <button class="search-button" @click="handleSearch">搜索</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim()) {
        console.log('搜索内容：', this.searchQuery)
      }
    }
  }
}
</script>

<style scoped>
/* 整个头部容器 */
.header {
  text-align: center;
  margin-bottom: 20px;
}

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

/* 搜索框容器 */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  width: 50%; /* 搜索框宽度 */
  max-width: 600px; /* 限制最大宽度 */
}

/* 输入框样式 */
.search-input {
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 20px 0 0 20px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

/* 按钮样式 */
.search-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 86, 179, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 10px;
  }

  .logo-container {
    flex-direction: column;
    margin-bottom: 15px;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .system-title {
    font-size: 28px;
  }

  .search-bar {
    width: 80%;
  }

  .search-input {
    font-size: 14px;
  }

  .search-button {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .logo {
    width: 35px;
    height: 35px;
  }

  .system-title {
    font-size: 24px;
  }

  .search-input {
    font-size: 12px;
  }

  .search-button {
    font-size: 12px;
  }
}
</style>
