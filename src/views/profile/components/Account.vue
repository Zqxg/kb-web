<template>
  <el-form>
    <el-form-item label="Name">
      <el-input v-model.trim="form.nickname" />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model.trim="form.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      form: {
        nickname: '', // 本地表单的昵称
        email: '' // 本地表单的邮箱
      }
    }
  },
  computed: {
    // 从 Vuex 获取用户信息
    ...mapState('user', ['nickname', 'email'])
  },
  watch: {
    // 监听 Vuex 的值，并初始化本地表单数据
    nickname: {
      immediate: true,
      handler(newVal) {
        this.form.nickname = newVal
      }
    },
    email: {
      immediate: true,
      handler(newVal) {
        this.form.email = newVal
      }
    }
  },
  methods: {
    // 使用 Vuex 的 update action
    ...mapActions('user', ['update']),
    async submit() {
      const { nickname, email } = this.form
      try {
        // 调用 Vuex 的 update action
        await this.update({ nickname, email })
        this.$message.success('更新成功')
        // 刷新整个页面
        setTimeout(() => {
          location.reload()
        }, 500) // 可设置一个短暂的延迟来显示成功消息
      } catch (error) {
        console.error(error)
        this.$message.error('更新失败')
      }
    }
  }
}
</script>
