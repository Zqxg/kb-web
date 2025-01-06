import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  nickname: '',
  userId: '',
  role: '',
  phone: '',
  email: '',
  collegeId: '',
  studentId: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ROLE: (state, role) => {
    state.role = role
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
  }
}

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

  // get user info
  getUserInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { userId, phone, nickname, roleType, email, collegeId, studentId } = data

        // roles must be a non-empty array
        if (!roleType || roleType.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLE', roleType)
        commit('SET_NAME', nickname)
        commit('SET_USERID', userId)
        commit('SET_PHONE', phone)
        commit('SET_EMAIL', email)
        commit('SET_COLLEGEID', collegeId)
        commit('SET_STUDENTID', studentId)
        resolve(data)
      }).catch(error => {
        reject(error)
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
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
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
