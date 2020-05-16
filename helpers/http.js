const fetch = require('node-fetch')
const querystring = require('querystring')

async function _jsonResponse(promise) {
  try {
    const response = await promise
    const json = await response.json()
    return json
  } catch (e) {
    return {
      errorCode: e.status,
      message: e.message,
      result: {}
    }
  }
}

function commonJsonHeader() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function request({ url, method, headers, body }) {
  const mergedHeaders = { ...commonJsonHeader(), ...(headers || {}) }

  let response
  if (!method || method === 'GET') {
    if (body) {
      url = url + '?' + querystring.stringify(body || {})
    }
    response = fetch(url, { headers: mergedHeaders })
  } else {
    response = fetch(url, {
      body: JSON.stringify(body),
      method,
      headers: mergedHeaders,
    })
  }
  return _jsonResponse(response)
}

module.exports = {
  request,
}
