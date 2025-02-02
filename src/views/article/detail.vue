<template>
  <div class="article-detail">
    <div class="left">
      <el-card class="article-main">
        <!-- 文章标题 -->
        <h1 class="title">{{ article.title }}</h1>

        <!-- 文章元数据（作者、分类、时间） -->
        <div class="meta">
          <span>作者: {{ article.author }}</span>
          <span>分类: {{ article.category }}</span>
          <span>发布时间: {{ formatDate(article.createdAt) }}</span>
          <span>更新于: {{ formatDate(article.updateAt) }}</span>
        </div>

        <!-- 文章摘要 -->
        <div v-if="article.contentShort.length > 0" class="contentShort">
          <p>{{ article.contentShort }}</p>
        </div>

        <!-- 文章内容 -->
        <div class="content" v-html="article.content" />
      </el-card>

      <!-- 评论卡片 -->
      <el-card class="comments-card">
        <h3>评论:</h3>
        <div class="comments-list">
          <div v-for="comment in article.comments" :key="comment.id" class="comment">
            <p><strong>{{ comment.author }}</strong> 评论：</p>
            <p>{{ comment.content }}</p>
          </div>
        </div>

        <!-- 添加评论 -->
        <el-input
          ref="commentInput"
          v-model="newComment"
          type="textarea"
          placeholder="写下你的评论..."
          :rows="4"
        />
        <el-button type="primary" @click="submitComment">提交评论</el-button>
      </el-card>
    </div>

    <div class="right">
      <!-- 文件下载和预览 -->
      <el-card class="file-list">
        <h3>附件:</h3>
        <ul>
          <li v-for="file in article.uploadedFiles" :key="file.fileName">
            <div class="file-item">
              <!-- 根据文件后缀显示不同图标 -->
              <div class="file-icon">
                <div v-if="isOfficeFile(file.fileName)">
                  <office-viewer :file-url="file.fileUrl" :file-type="getFileType(file.fileName)" />
                </div>
                <el-icon v-else-if="isImage(file.fileName)">
                  <img :src="file.fileUrl" alt="file preview" class="file-preview">
                </el-icon>
                <el-icon v-else-if="isPdf(file.fileName)">
                  <i class="el-icon-document" />
                </el-icon>
                <el-icon v-else-if="isDoc(file.fileName)">
                  <i class="el-icon-document-copy" />
                </el-icon>
                <el-icon v-else>
                  <i class="el-icon-file" />
                </el-icon>
              </div>
              <div class="file-info">
                <a :href="file.fileUrl" target="_blank">{{ file.fileName }}</a>
              </div>
            </div>
          </li>
        </ul>
      </el-card>

      <!-- 标签列表 -->
      <el-card class="tags-card">
        <h3>标签:</h3>
        <div class="tags-list">
          <span v-for="tag in article.tags" :key="tag" class="tag-item">{{ tag }}</span>
        </div>
      </el-card>

    </div>

    <!-- 固定在右下角的按钮 -->
    <div class="fixed-actions">
      <el-button type="primary" class="fixed-btn" @click="scrollToTop">
        <i class="el-icon-top" />
      </el-button>

      <el-button type="warning" class="fixed-btn" @click="likeArticle">
        <i class="el-icon-thumb" /> ({{ article.likes }})
      </el-button>

      <el-button type="primary" class="fixed-btn" @click="collectArticle">
        <i class="el-icon-star-off" />
      </el-button>
    </div>
  </div>
</template>

<script>
import OfficeViewer from 'vue-office'
import { getArticle } from '@/api/article'

export default {
  components: {
    OfficeViewer
  },
  data() {
    return {
      article: {
        title: '',
        content: '',
        author: '',
        category: '',
        createdAt: '',
        updateAt: '',
        uploadedFiles: [],
        tags: [],
        likes: 0,
        comments: [] // 用来存储评论的数组
      },
      newComment: '' // 新评论内容
    }
  },
  created() {
    this.fetchArticle()
  },
  methods: {
    fetchArticle() {
      const articleId = this.$route.params.id
      getArticle(articleId)
        .then(response => {
          this.article = response.data
          // mock
          this.article.tags = ['标签1', '标签2', '标签3']
        })
        .catch(error => {
          this.$message.error('文章加载失败:' + error)
        })
    },
    formatDate(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleString()
    },
    likeArticle() {
      this.article.likes++
      this.$message.success('已喜欢')
    },
    collectArticle() {
      this.$message.success('已收藏')
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    submitComment() {
      if (this.newComment.trim()) {
        const newComment = {
          id: Date.now(),
          author: '当前用户', // 你可以在这里获取当前登录用户的名称
          content: this.newComment
        }
        this.article.comments.push(newComment)
        this.newComment = '' // 清空输入框
        this.$message.success('评论提交成功')
      } else {
        this.$message.warning('评论内容不能为空')
      }
    },
    isOfficeFile(fileName) {
      const officeTypes = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']
      return officeTypes.some(type => fileName.toLowerCase().endsWith(type))
    },
    isImage(fileName) {
      const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      return imageTypes.some(type => fileName.toLowerCase().endsWith(type))
    },
    isPdf(fileName) {
      return fileName.toLowerCase().endsWith('.pdf')
    },
    isDoc(fileName) {
      return fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')
    },
    getFileType(fileName) {
      if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) {
        return 'word'
      }
      if (fileName.toLowerCase().endsWith('.xls') || fileName.toLowerCase().endsWith('.xlsx')) {
        return 'excel'
      }
      if (fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx')) {
        return 'ppt'
      }
      return ''
    }
  }
}
</script>

<style scoped>
.article-detail {
  display: flex;
  justify-content: space-between;
  padding: 30px;
  background-color: #f1f1f1;
}

.left {
  flex: 2;
}

.right {
  flex: 1;
  padding-left: 20px;
}

.article-main {
  padding: 30px;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.meta {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.meta span {
  margin-right: 15px;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.contentShort {
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.comments-card {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
}

.comments-list .comment {
  margin-bottom: 15px;
}

.file-list {
  background-color: #fff;
  margin-bottom: 20px;
}

.file-list h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.file-list ul {
  list-style-type: none;
  padding: 0;
}

.file-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.file-icon {
  margin-right: 10px;
}

.file-info a {
  color: #409eff;
  text-decoration: none;
}

.file-info a:hover {
  text-decoration: underline;
}

.fixed-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fixed-btn {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}

.fixed-btn i {
  font-size: 24px;
}
.tags-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tags-card h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 设置标签之间的间隔 */
}

.tag-item {
  display: inline-block;
  padding: 6px 12px;
  background-color: #e0f7fa; /* 标签背景色 */
  border-radius: 20px;
  font-size: 14px;
  color: #00796b; /* 标签文字颜色 */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.tag-item:hover {
  background-color: #00796b; /* 鼠标悬停时背景色 */
  color: #fff; /* 鼠标悬停时文字颜色 */
}

</style>
