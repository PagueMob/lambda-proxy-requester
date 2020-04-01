const axios = require('axios')
require('axios-debug-log')

const proxy = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters, httpMethod, body, headers } = event
  const url = parseQueryStringToUrl(queryStringParameters)
  try {
    const response = await httpRequest(url, httpMethod, body, headers)
    return buildResponse(response.statusCode, response.data)
  } catch (e) {
    console.log(`Error:`, e)
    const status = e.status || e.response ? e.response.status : 500
    return buildResponse(status, {
      error: e.response ? e.response.data : e.code
    })
  }
}

const buildResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body)
})

const parseQueryStringToUrl = (queryStrings) => {
  const { req, ...params } = queryStrings
  return Object.keys(params).reduce((url, query) => `${url}&${query}=${params[query]}`, req)
}

const httpRequest = async (url, httpMethod, body, headers) => {
  return await axios({
    method: httpMethod,
    data: body,
    url: url,
    headers: {
      ...removeInvalidHeaders(headers),
      ["Host"]: getHostName(url)
    }
  })
}

const getHostName = (url) => {
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
  return matches && matches[1]
}

const removeInvalidHeaders = (headers) => {
  const invalidHeaders = [
    'Host',
    'User-Agent',
    'Via',
    'X-Amz-Cf-Id',
    'X-Amzn-Trace-Id',
    'X-Forwarded-For',
    'X-Forwarded-Port',
    'X-Forwarded-Proto'
  ]
  const newHeader = Object.keys(headers).reduce((obj, key) => {
    if (!invalidHeaders.includes(key)) {
      obj[key] = headers[key]
    }
    return obj
  }, {})
  return newHeader
}

module.exports = { proxy }