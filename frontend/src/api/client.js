const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
const SESSION_KEY = 'udhari-khata-session'

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  let token
  try {
    token = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')?.accessToken
  } catch {
    token = null
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('Could not connect to the server. Please try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'))
  }
  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.')
  }
  return data
}

export const apiGet = (path) => apiRequest(path)
export const apiPost = (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body })
export const apiPatch = (path, body) => apiRequest(path, { method: 'PATCH', body })
export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' })
