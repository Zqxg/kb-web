<template>
  <div class="sidebar">
    <el-tree
      ref="tree"
      :data="categories"
      :props="treeProps"
      :highlight-current="true"
      node-key="cid"
      style="max-height: 95%; overflow-y: auto;"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import { getArticleCategory } from '@/api/article'

export default {
  data() {
    return {
      categories: [], // 存储分类列表
      treeProps: {
        children: 'children', // 子分类字段
        label: 'categoryName' // 分类名称字段
      },
      selectedCategoryId: null // 存储选中的目录ID
    }
  },
  mounted() {
    // 页面加载时获取查询参数中的 categoryId 并选中对应目录
    this.fetchCategoryList()
  },
  methods: {
    fetchCategoryList() {
      getArticleCategory()
        .then(response => {
          if (response.data) {
            this.categories = response.data.CategoryList || []
            // 确保分类数据加载完成后再选中节点
            this.$nextTick(() => {
              this.selectCategoryFromQuery()
            })
          }
        })
        .catch(error => {
          console.error('获取文章分类失败', error)
        })
    },
    handleNodeClick(nodeData) {
      console.log('Node clicked:', nodeData) // 打印点击的节点
      // 点击分类节点，通知父组件
      this.$emit('category-select', nodeData.cid)
    },
    selectCategoryFromQuery() {
      const categoryId = this.$route.query.categoryId
      if (categoryId) {
        this.selectedCategoryId = categoryId // 同步到子组件
        this.$nextTick(() => {
          this.selectNodeById(categoryId)
        })
      }
    },
    selectNodeById(categoryId) {
      const node = this.findNodeById(this.categories, categoryId)
      if (node) {
        this.$refs.tree.setCurrentKey(node.cid)
        this.selectedCategoryId = node.cid // 同步更新子组件的分类 ID
        this.$emit('category-select', node.cid) // 通知父组件
      }
    },
    findNodeById(categories, categoryId) {
      for (const category of categories) {
        if (category.cid === categoryId) {
          return category
        }
        // 如果有子分类，递归查找
        if (category.children && category.children.length > 0) {
          const found = this.findNodeById(category.children, categoryId)
          if (found) return found
        }
      }
      return null
    }
  }
}
</script>

<style scoped>
.sidebar {
  padding: 10px;
  margin-right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

</style>
