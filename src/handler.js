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

module.exports = { proxy }