<template>
  <el-row class="register-container" type="flex" justify="center">
    <el-col :span="8">
      <div class="register-form-container">
        <el-card class="box-card">
          <h2 class="title">用户注册</h2>

          <!-- 注册表单 -->
          <el-form :model="form" ref="form" status-icon>
            <el-form-item label="手机号" :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' }]">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
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
              <el-button type="primary" @click="handleRegister" :loading="isRegisterLoading" class="register-btn">注册</el-button>
            </el-form-item>
          </el-form>

          <!-- 登录链接 -->
          <div class="login-link">
            <router-link to="/login">已有账号？点击登录</router-link>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { register, getCaptcha } from '@/api/user' // 假设你已经有 register API

export default {
  data() {
    return {
      form: {
        phone: '',
        captchaAnswer: '',
        password: '',
        captchaId: '' // 存储 captchaId
      },
      captchaImage: '', // 存储验证码图像
      isCaptchaLoading: false,
      isRegisterLoading: false
    }
  },
  methods: {
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

    // 注册功能
    async handleRegister() {
      this.isRegisterLoading = true
      try {
        const res = await register(this.form) // 发送注册请求
        if (res.success) {
          this.$router.push({ path: '/' }) // 注册成功后跳转到首页
        } else {
          this.$message.error('注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        this.$message.error('注册失败')
      } finally {
        this.isRegisterLoading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  margin-top: 50px;
}

.register-form-container {
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

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}
</style>
