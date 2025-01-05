const Mock = require('mockjs')

const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [
  // 获取验证码接口
  {
    url: '/v1/get-captcha',
    type: 'get',
    response: _ => {
      const captchaId = Mock.mock('@string("lower", 10)') // 生成一个随机的 captchaId
      const captchaImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...' // 用 Base64 编码的验证码图像（你可以换成你实际的验证码图片）

      return {
        code: 20000,
        data: {
          captchaId: captchaId,
          captchaImage: captchaImage // 返回 Base64 编码的验证码图像
        }
      }
    }
  },

  // 用户登录接口
  {
    url: '/v1/passwordLogin',
    type: 'post',
    response: config => {
      const { phone, captchaAnswer, captchaId, password } = config.body

      // 验证验证码
      if (captchaAnswer !== '6652') {  // 这里模拟固定的验证码为 '6652'
        return {
          code: 40001,
          message: '验证码错误'
        }
      }

      // 验证手机号和密码
      if (phone === '10012239030' && password === 'Password123') {
        // 登录成功，返回 token
        return {
          code: 20000,
          data: {
            token: tokens['admin'].token
          }
        }
      } else {
        return {
          code: 60204,
          message: '手机号或密码错误'
        }
      }
    }
  },

  // 用户注册接口
  {
    url: '/v1/register',
    type: 'post',
    response: config => {
      const { phone, captchaAnswer, captchaId, password } = config.body

      // 验证验证码
      if (captchaAnswer !== '6652') {
        return {
          code: 40001,
          message: '验证码错误'
        }
      }

      // 验证手机号和密码
      if (phone && password) {
        // 注册成功，返回 token
        return {
          code: 20000,
          data: {
            token: tokens['admin'].token
          }
        }
      } else {
        return {
          code: 60204,
          message: '手机号或密码不能为空'
        }
      }
    }
  },

  // 获取用户信息
  {
    url: '/vue-element-admin/user/info',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // 用户注销接口
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
