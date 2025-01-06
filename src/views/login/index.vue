<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="phone"
          v-model="loginForm.phone"
          placeholder="Phone"
          name="phone"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <!-- 验证码部分 -->
      <el-form-item :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
        <div class="captcha-container">
          <el-input v-model="loginForm.captchaAnswer" placeholder="请输入验证码" style="width: 70%">
          </el-input>

          <!-- 显示验证码图像和获取验证码按钮 -->
          <div class="captcha-image-container">
            <el-image :src="captchaImage" alt="验证码" fit="contain" style="width: 70%; margin-right: 10px;" />
            <el-button
              @click="getCaptcha"
              :loading="isCaptchaLoading"
              type="primary"
              class="captcha-btn"
            >获取验证码</el-button>
          </div>
        </div>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>
      <!-- 注册链接 -->
      <div class="register-link">
        <router-link to="/register">没有账号？点击注册</router-link>
      </div>
    </el-form>
  </div>
</template>

<script>
import { validPhoneNumber } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!validPhoneNumber(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 8 || value.length > 16) {
        callback(new Error('密码长度必须在8到16之间'))
      } else {
        callback()
      }
    }
    const validateCaptcha = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error('请输入4位验证码'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        phone: '10012239030',
        password: 'Password123',
        captchaId: '',
        captchaAnswer: ''
      },
      loginRules: {
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        captchaAnswer: [{ required: true, message: '请输入验证码', trigger: 'blur', validator: validateCaptcha }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      captchaImage: '', // 验证码图片
      isCaptchaLoading: false // 验证码加载状态
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: '/dashboard' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
          this.$message.success('登录成功')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getCaptcha() {
      this.isCaptchaLoading = true
      this.$store.dispatch('user/getCaptcha')
        .then(() => {
          // 获取验证码成功后，更新验证码图像
          this.captchaImage = this.$store.state.user.captchaImage
          this.loginForm.captchaId = this.$store.state.user.captchaId
        })
        .catch(() => {
          this.$message.error('获取验证码失败')
        })
        .finally(() => {
          this.isCaptchaLoading = false
        })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}

.login-container .captcha-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-container .captcha-image-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}
.captcha-image-container img {
  width: 100%; /* 控制图片宽度 */
  height: auto; /* 保持图片的纵横比 */
  max-width: 100%; /* 确保图片不会超过容器宽度 */
  max-height: 40px; /* 控制图片最大高度 */
  background-color: #ffffff; /* 按钮背景色 */
}

.captcha-btn {
  width: 120px; /* 控制按钮宽度 */
  height: 40px; /* 设置按钮高度 */
  padding: 0 15px; /* 添加水平内边距 */
  font-size: 14px; /* 设置字体大小 */
  border-radius: 5px; /* 圆角 */
  background-color: #409eff; /* 按钮背景色 */
  color: #fff; /* 按钮字体颜色 */
  border: none; /* 去掉默认边框 */
}

</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
.register-link {
  text-align: center;
  margin-top: 7px;
  color: $dark_gray;
}

</style>
