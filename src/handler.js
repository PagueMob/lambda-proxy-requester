const axios = require('axios')
const proxy = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters, httpMethod, body, headers } = event

  const url = parseQueryStringToUrl(queryStringParameters)
  console.log(`Requesting URL: ${url}`)
  try {
    const response = await axios({
      method: httpMethod,
      data: body,
      url,
      headers
    })
    return buildResponse(response.statusCode, response.data)
  } catch (e) {
    console.log(`Error:`, e)
    return buildResponse(500, {
      error: e.code
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