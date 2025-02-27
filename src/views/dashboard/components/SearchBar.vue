<template>
  <div class="header">
    <div class="search-bar">
      <!-- 多级级联选择框 -->
      <el-cascader
        v-model="selectedCategories"
        class="category-select"
        :options="categories"
        multiple
        filterable
        clearable
        placeholder="选择分类"
        :props="{ checkStrictly: true, label: 'label', emitPath: false,multiple: true }"
        @change="handleCategoryChange"
      />
      <!-- 搜索框 -->
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="请输入关键词进行搜索..."
      >
      <button class="search-button" @click="handleSearch">
        <svg-icon icon-class="search" />
      </button>
    </div>
  </div>
</template>

<script>
import { getArticleCategory, getArticleListByEs } from '@/api/article'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      searchQuery: '',
      selectedCategories: [], // 用于存储选择的分类
      selectedCategoriesName: [], // 用于存储选择的分类名称
      categories: [], // 存储所有的分类数据
      formData: {
        mainProductArr: [],
        mainProductName: ''
      },
      searchResults: []
    }
  },
  mounted() {
    this.fetchCategories()
  },
  methods: {
    // 获取分类数据
    fetchCategories() {
      if (this.categories.length === 0) {
        getArticleCategory().then(response => {
          if (response.data && response.data.CategoryList) {
            this.categories = this.transformCategories(response.data.CategoryList)
          }
        }).catch(error => {
          Message.error('获取分类失败: ' + error.message)
        })
      }
    },
    // 处理分类数据，转换成 el-cascader 需要的格式
    transformCategories(categories) {
      return categories.map(category => ({
        value: category.cid,
        label: category.categoryName,
        children: category.children && category.children.length
          ? this.transformCategories(category.children)
          : [], // 如果没有子类目，递归处理
        disabled: category.isVariety === 0 // 判断是否禁用
      }))
    },
    // 处理选择变化
    handleCategoryChange(value) {
      const textArr = []
      // 如果选择超过3个，弹出提示
      if (value.length > 3) {
        value.splice(-2, 1)
        this.$message.warning('最多只能选择三种分类')
      }
      // 清空 selectedCategoriesName，确保同步
      this.selectedCategoriesName = []
      // 获取选择的分类名称
      value.forEach(id => {
        const itemValue = this.findCategoryById(id)
        textArr.push(itemValue.label)
        this.selectedCategoriesName.push(itemValue.label)
      })
      this.formData.mainProductName = textArr.join(',')
      this.formData.mainProductArr = value
    },
    // 通过ID查找分类名称
    findCategoryById(id) {
      return this._findCategoryById(this.categories, id)
    },
    _findCategoryById(categories, id) {
      for (const category of categories) {
        if (category.value === id) {
          return category
        }
        if (category.children && category.children.length) {
          const found = this._findCategoryById(category.children, id)
          if (found) return found
        }
      }
      return null
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        // 构建请求数据
        const uniqueCategories = [...new Set(this.selectedCategoriesName)]
        const requestData = {
          advSearch: false,
          categories: this.selectedCategories,
          column: '_score',
          content: this.searchQuery,
          keywords: [this.searchQuery],
          order: 'desc',
          importance: '-1',
          pageIndex: 1, // 默认页码1
          pageSize: 10, // 默认每页10条
          phraseMatch: false,
          title: this.searchQuery
        }

        // 发起搜索请求
        getArticleListByEs(requestData).then(res => {
          if (res.code === 0) {
            // 存储搜索结果
            this.searchResults = res.data

            // 跳转到结果页面
            this.$router.push({ path: '/search', query: {
              query: this.searchQuery,
              categoriesName: uniqueCategories.join(','),
              selectedCategories: JSON.stringify(this.selectedCategories),
              searchResults: JSON.stringify(this.searchResults) }})

            // 传给父组件
            this.$emit('searchResults', JSON.stringify(this.searchResults))
            this.$emit('categoriesName', uniqueCategories.join(','))
            this.$emit('selectedCategories', JSON.stringify(this.selectedCategories))
            this.$emit('query', this.searchQuery)
          } else {
            Message.error('搜索失败:' + res.message)
          }
        }).catch(error => {
          Message.error('搜索失败: ' + error.message)
        })
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

/* 搜索框容器 */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  width: 100%; /* 搜索框宽度 */
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
  width: 600px;
  height: 55px;
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
  height: 55px;
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

.category-select {
  width: 120px;
  margin-right: 10px;
}

</style>
