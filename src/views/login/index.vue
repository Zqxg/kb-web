<template>
  <el-row class="login-container" type="flex" justify="center">
    <el-col :span="8">
      <div class="login-form-container">
        <el-card class="box-card">
          <h2 class="title">用户登录</h2>

          <!-- 登录表单 -->
          <el-form :model="form" ref="form" status-icon>
            <el-form-item label="手机号" :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]">
              <el-input ref="phoneInput" v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
              <el-input type="password" v-model="form.password" placeholder="请输入密码" />
            </el-form-item>

            <el-form-item label="验证码" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
              <el-input v-model="form.captchaAnswer" placeholder="请输入验证码">
                <template slot="append">
                  <el-button @click="getCaptcha" :loading="isCaptchaLoading" size="small">获取验证码</el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 显示验证码图像 -->
            <el-form-item label="验证码图像">
              <el-image :src="captchaImage" alt="验证码" fit="contain" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="isLoginLoading" class="login-btn">登录</el-button>
            </el-form-item>
          </el-form>

          <!-- 注册链接 -->
          <div class="register-link">
            <router-link to="/register">没有账号？点击注册</router-link>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { login, getCaptcha } from '@/api/user'
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      form: {
        phone: '',
        captchaAnswer: '',
        password: '',
        captchaId: ''
      },
      captchaImage: '',
      isCaptchaLoading: false,
      isLoginLoading: false
    }
  },
  methods: {
    ...mapActions('user', ['login']), // 映射 Vuex actions
    // 获取验证码
    async getCaptcha() {
      this.isCaptchaLoading = true
      try {
        const response = await getCaptcha()
        // 如果 code 是 0，表示成功
        this.form.captchaId = response.data.captchaId
        this.captchaImage = response.data.CaptchaBase64
      } catch (error) {
        this.$message.error('获取验证码失败:')
      } finally {
        this.isCaptchaLoading = false
      }
    },

    // 登录功能
    async handleLogin() {
      this.isLoginLoading = true
      try {
        await this.login(this.form) // 调用 Vuex 的 login action
        this.$message.success('登录成功')
        this.$router.push({ path: this.redirect }) // 登录成功后跳转到主页
      } catch (error) {
        console.error('登录失败:', error)
        this.$message.error('登录失败')
      } finally {
        this.isLoginLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  margin-top: 50px;
}

.login-form-container {
  padding: 30px;
}

.box-card {
  padding: 20px;
  border-radius: 8px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}
</style>
