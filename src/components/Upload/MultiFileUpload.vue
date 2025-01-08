<template>
  <el-dialog title="附件上传" :visible.sync="visible" width="800px" :close-on-click-modal="false" @close="cancel">
    <div class="upload-file">
      <el-upload
        ref="upload"
        :before-upload="handleBeforeUpload"
        :file-list="fileList"
        :limit="3"
        multiple
        :accept="accept"
        :on-change="handleChange"
        :show-file-list="true"
        :auto-upload="false"
        class="upload-file-uploader"
      >
        <el-button slot="trigger" size="mini" type="primary">选取文件</el-button>
        <el-button
          style="margin-left: 10px;"
          :disabled="fileList.length < 1"
          size="small"
          type="success"
          @click="submitUpload"
        >上传到服务器</el-button>

        <div v-if="isShowTip" slot="tip" class="el-upload__tip">
          请上传
          <template v-if="fileSize">大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b></template>
          <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b></template>
          的文件
        </div>
        <div style="color: #f56c6c; margin-top: 10px;">
          上传服务器后不可删除，请谨慎上传
        </div>
      </el-upload>

      <!-- 文件列表 -->
      <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
        <li v-for="(file, index) in list" :key="file.uid" class="el-upload-list__item ele-upload-list__item-content">
          <el-link :href="file.url" :underline="false" target="_blank">
            <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
          </el-link>
          <div class="ele-upload-list__item-content-action">
            <el-link :underline="false" type="danger" @click="handleDelete(index)">删除</el-link>
          </div>
        </li>
      </transition-group>
    </div>
  </el-dialog>
</template>

<script>
import { uploadFileToOSS } from '@/utils/oss-upload' // 引入上传方法

export default {
  props: {
    value: [String, Object, Array],
    fileSize: {
      type: Number,
      default: 5
    },
    fileType: {
      type: Array,
      default: () => ['.jpg', '.jpeg', '.png', '.doc', '.xls', '.xlsx', '.ppt', '.txt', '.pdf']
    },
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fileList: [],
      visible: false,
      accept: ''
    }
  },
  watch: {
    value(val) {
      this.fileList = val || []
    }
  },
  methods: {
    // 上传之前的文件检查
    handleBeforeUpload(file) {
      const isFileTypeValid = this.fileType.some(type => file.name.endsWith(type))
      if (!isFileTypeValid) {
        this.$message.error(`文件类型错误，支持的类型有：${this.fileType.join(', ')}`)
        return false
      }
      const isFileSizeValid = file.size / 1024 / 1024 <= this.fileSize
      if (!isFileSizeValid) {
        this.$message.error(`文件大小超过了限制，最大为 ${this.fileSize}MB`)
        return false
      }
      return true
    },
    async submitUpload() {
      if (this.fileList.length <= 0) {
        this.$message.error('请选择文件上传')
        return
      }
      try {
        // 获取STS凭证
        // const policy = await this.getSTS() // 从后端获取STS凭证
        // mock policy
        const policy = 'LTAI5tH9368q6478983748'

        // 上传文件到OSS
        const uploadedFiles = await this.uploadFilesToOSS(policy)

        // 返回上传后的文件 URL
        this.$emit('input', uploadedFiles) // 使用 v-model 传递上传后的文件 URL
        this.$message.success('文件上传成功')
        this.cancel()
      } catch (error) {
        this.$message.error('上传失败，请重试')
      }
    },
    async uploadFilesToOSS(policy) {
      const uploadedFiles = []
      for (const file of this.fileList) {
        try {
          // 上传单个文件到 OSS
          const fileUrl = await uploadFileToOSS(file.raw, policy) // 调用 OSS 上传方法

          // 将上传的文件 URL 加入文件列表
          uploadedFiles.push({ fileName: file.name, fileUrl })
        } catch (error) {
          // 捕获单个文件上传的错误并提示
          this.$message.error(`文件 ${file.name} 上传失败，请重试`)
          console.error(`文件 ${file.name} 上传失败：`, error)
        }
      }
      return uploadedFiles
    },
    getFileName(name) {
      return name.lastIndexOf('/') > -1 ? name.slice(name.lastIndexOf('/') + 1).toLowerCase() : name
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    handleDelete(index) {
      this.fileList.splice(index, 1)
    },
    cancel() {
      this.fileList = []
      this.visible = false
    }
  }
}
</script>

<style scoped>
.upload-file {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.upload-file-list {
  list-style-type: none;
  margin-top: 20px;
  padding-left: 0;
}

.el-upload-list__item-content-action {
  margin-left: 10px;
  display: inline-block;
}

.el-upload__tip {
  margin-top: 10px;
  font-size: 12px;
}
</style>
