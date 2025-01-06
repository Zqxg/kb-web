import { login, getCaptcha, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  nickname: '',
  userId: '',
  roles: [],
  phone: '',
  email: '',
  collegeId: '',
  studentId: '',
  captchaId: '',
  captchaImage: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ROLE: (state, role) => {
    state.roles = role
  },
  SET_NAME: (state, name) => {
    state.nickname = name
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_COLLEGEID: (state, collegeId) => {
    state.collegeId = collegeId
  },
  SET_STUDENTID: (state, studentId) => {
    state.studentId = studentId
  },
  SET_CAPTCHA(state, captchaData) {
    state.captchaId = captchaData.captchaId
    state.captchaImage = captchaData.CaptchaBase64 // 假设验证码是 base64 编码的
  }
}

let isFetchingUserInfo = false

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { captchaAnswer, captchaId, password, phone } = userInfo
    return new Promise((resolve, reject) => {
      login({ captchaAnswer, captchaId, password, phone }).then(response => {
        const { data } = response
        // 使用返回的 accessToken 更新 Vuex 状态
        commit('SET_TOKEN', data.accessToken)
        // 存储 accessToken 到cookie
        setToken(data.accessToken)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user captcha
  getCaptcha({ commit }) {
    return new Promise((resolve, reject) => {
      getCaptcha().then(response => {
        const { data } = response
        // 假设后端返回的数据格式是 { captchaId: 'captchaId', CaptchaBase64: 'captchaBase64' }
        commit('SET_CAPTCHA', data) // 保存验证码信息到 Vuex
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getUserInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (isFetchingUserInfo) {
        return // 如果正在请求，直接返回
      }

      isFetchingUserInfo = true // 开始请求
      getUserInfo(state.token)
        .then(response => {
          const { data } = response

          if (!data) {
            reject('Verification failed, please Login again.')
          }

          const { userId, phone, nickname, roleType, email, collegeId, studentId } = data

          // 如果角色类型为空，则抛出错误
          if (!roleType || roleType.length <= 0) {
            reject('getInfo: roles must be a non-null array!')
          }
          let mappedRole = ['common_user']
          switch (roleType) {
            case 0:
              mappedRole = ['common_user']
              break
            case 1:
              mappedRole = ['student_user']
              break
            case 2:
              mappedRole = ['student_admin']
              break
            case 3:
              mappedRole = ['super_admin']
              break
            default:
              mappedRole = ['common_user']
          }
          console.log('data:', data)
          commit('SET_ROLE', mappedRole)
          commit('SET_NAME', nickname)
          commit('SET_USERID', userId)
          commit('SET_PHONE', phone)
          commit('SET_EMAIL', email)
          commit('SET_COLLEGEID', collegeId)
          commit('SET_STUDENTID', studentId)

          resolve(data)
        })
        .catch(error => {
          console.log('error:', error)
          this.$store.dispatch('user/logout')
          reject(error)
        })
        .finally(() => {
          isFetchingUserInfo = false // 请求结束，重置标志
        })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLE', '')
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLE', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }) {
    const { role } = await dispatch('getUserInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', role, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
