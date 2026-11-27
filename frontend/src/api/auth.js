import { apiRequest } from './client'

async function sendAuthRequest(action, payload) {
  return apiRequest(`/auth/${action}`, { method: 'POST', body: payload })
}

export const login = (credentials) => sendAuthRequest('login', credentials)
export const signup = (details) => sendAuthRequest('signup', details)
export const getCurrentUser = () => apiRequest('/auth/me')
export const logout = () => apiRequest('/auth/logout', { method: 'POST' })
