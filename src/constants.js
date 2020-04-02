export const invalidHeaders = [
  'Host',
  'User-Agent',
  'Via',
  'X-Amz-Cf-Id',
  'X-Amzn-Trace-Id',
  'X-Forwarded-For',
  'X-Forwarded-Port',
  'X-Forwarded-Proto'
].map(item => (item.toLowerCase()))

export const sensitiveHeaders = [
  'cookie',
  'amz',
  'token',
  'auth',
  'secret',
  'key'
].map(item => (item.toLowerCase()))

