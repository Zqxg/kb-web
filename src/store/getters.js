const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,

  // user getters
  nickname: state => state.user.nickname,
  userId: state => state.user.userId,
  phone: state => state.user.phone,
  email: state => state.user.email,
  collegeId: state => state.user.collegeId,
  studentId: state => state.user.studentId,
  captchaId: state => state.user.captchaId,
  captchaImage: state => state.user.captchaImage
}

export default getters

