const axios = require('axios')
require('axios-debug-log')

const proxy = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters, pathParameters, httpMethod, body, headers } = event
  console.log(`Request: `, {
    method: httpMethod,
    pathParams: pathParameters,
    query: queryStringParameters,
    body: body,
    headers: headers
  })
  const baseUrl = parsePathParametersToBaseUrl(pathParameters)
  const url = createFullUrlWithQueryStrings(baseUrl, queryStringParameters || {})
  try {
    const response = await httpRequest(url, httpMethod, body, headers)
    console.log(`Response: `, {
      statusCode: response.status + ' (' + response.statusText + ')',
      body: response.data,
      headers: response.headers
    })
    return buildResponse(response.status, response.data)
  } catch (e) {
    const hasResponse = !!e.response;
    const status = hasResponse ? e.response.status + ' (' + e.response.statusText + ')' : e.status || 500
    const body = hasResponse ? e.response.data : {
      error: e.code,
      message: e.message
    }
    console.log(hasResponse ? `Response: ` : `Error:`, {
      statusCode: status,
      body: body,
      headers: hasResponse ? e.response.headers : undefined
    })
    return buildResponse(status, body)
  }
}

const buildResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body)
})

const createFullUrlWithQueryStrings = (baseUrl, queryStrings) => {
  return Object.keys(queryStrings).reduce((url, query) => `${url}&${query}=${queryStrings[query]}`, baseUrl + '?')
}

const parsePathParametersToBaseUrl = (pathParameters) => {
  const { proxy } = pathParameters
  let url = proxy.replace('proxy/', '')
  const hasHttpDefined = url.includes('http/') || url.includes('https/')
  if (hasHttpDefined) {
    url = url.replace('/', '://')
  }
  return url
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
