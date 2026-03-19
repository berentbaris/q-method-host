/*
  Thin wrapper around fetch for the Q-Method API.
  In development, Vite proxies /api → http://localhost:4000.
*/

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

// ---- Studies ----

export function createStudy({ title, description, statements, pyramidConfig, organizerEmails }) {
  return request('/studies', {
    method: 'POST',
    body: JSON.stringify({ title, description, statements, pyramidConfig, organizerEmails }),
  })
}

export function fetchStudy(code) {
  return request(`/studies/${encodeURIComponent(code)}`)
}

export function fetchStudyResults(code) {
  return request(`/studies/${encodeURIComponent(code)}/results`)
}

// ---- Responses ----

export function submitResponse(code, { sortResult, explanations, participantName }) {
  return request(`/studies/${encodeURIComponent(code)}/responses`, {
    method: 'POST',
    body: JSON.stringify({ sortResult, explanations, participantName }),
  })
}
