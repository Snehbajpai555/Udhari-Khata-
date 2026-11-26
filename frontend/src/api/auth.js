const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

async function sendAuthRequest(action, payload) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Could not connect to the server. Please try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an invalid response. Please try again.')
  }

  if (!response.ok) {
    throw new Error(data.message || 'The request could not be completed.')
  }

  return data
}

export const login = (credentials) => sendAuthRequest('login', credentials)
export const signup = (details) => sendAuthRequest('signup', details)
