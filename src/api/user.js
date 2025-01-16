import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/v1/passwordLogin',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/v1/register',
    method: 'post',
    data
  })
}

// 获取验证码接口
export function getCaptcha() {
  return request({
    url: '/v1/getCaptcha', // 后端的验证码接口
    method: 'get'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/v1/user/getUserInfo',
    method: 'get',
    headers: {
      'X-Token': token // 这里是设置请求头中的 X-Token
    }
  })
}

export function logout() {
  return request({
    url: '/v1/user/logout',
    method: 'get'
  })
}

export function updateProfile(data) {
  return request({
    url: '/v1/user/updateProfile',
    method: 'post',
    data
  })
}

export function cancel() {
  return request({
    url: '/v1/user/cancel',
    method: 'get'
  })
}

export function getCollege() {
  return request({
    url: '/v1/user/getCollege',
    method: 'get'
  })
}

export function getCollegeList() {
  return request({
    url: '/v1/user/getCollegeList',
    method: 'get'
  })
}
