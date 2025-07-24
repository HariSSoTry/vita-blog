import axios from 'axios'

const authApi = axios.create({
  baseURL: '/FrontTestingService-auth',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  withCredentials: true
})

const api = axios.create({
  baseURL: '/FrontTestingService-back',
  withCredentials: true
})

api.interceptors.request.use(config => {
  console.log('Request config:', config);
  console.log('Current cookies:', document.cookie);
  return config;
});

api.interceptors.response.use(response => {
  console.log('Response:', response);
  console.log('Response headers:', response.headers);
  return response;
}, error => {
  console.error('API error:', error);
  if (error.response?.status === 401 || error.response?.status === 403) {
    document.cookie = 'FRONTTESTINGSERVICE_TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default {
  async login(username, password) {
    const params = new URLSearchParams()
    params.append('username', username.trim())
    params.append('password', password.trim())
    
    const response = await authApi.post('/login', params)
    return response
  },

  // Health check
  healthCheck() {
    return api.get('/healthCheck')
  },

  // UserInfo methods
  createUserInfo(userData) {
    return api.post('/userInfo', userData)
  },
  
  // UserInfo methods
  getUserInfos() {
    return api.get('/userInfo/findAll')
  },

  deleteUserInfo(id) {
    return api.delete(`/userInfo/${id}`)
  },
  
  // Post methods
  getPosts() {
    return api.get('/userInfo/findAll')
  },
  
  getPostById(id) {
    return api.get(`/post/${id}`)
  },
  
  createPost(data, userId) {
    return api.post('/post', data, { params: { userInfoId: userId } })
  },
  
  updatePost(postData) {
    return api.put('/post', postData)
  },
  
  deletePost(id) {
    return api.delete(`/post/${id}`)
  },
  
  // Comment methods
  getCommentsByPostId(postId) {
    return api.get(`/comment`, { params: { postId } })
  },
  
  createComment(commentData, postId) {
    return api.post('/comment', commentData, { params: { postId } })
  },
  
  deleteComment(id) {
    return api.delete(`/comment/${id}`)
  }
}