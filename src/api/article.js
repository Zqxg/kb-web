import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/v1/article/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json' // 设置请求头为 JSON
    }
  })
}

export function updateArticle(data) {
  return request({
    url: '/v1/article/updateArticle',
    method: 'post',
    data
  })
}

export function getArticleCategory() {
  return request({
    url: '/v1/article/getArticleCategory',
    method: 'get',
    headers: {
      'Content-Type': 'application/json' // 设置请求头为 JSON
    }
  })
}

export function getArticleListByCategory(params) {
  return request({
    url: '/v1/article/getArticleListByCategory',
    method: 'get',
    headers: {
      'Content-Type': 'application/json' // 设置请求头为 JSON
    },
    params
  })
}

