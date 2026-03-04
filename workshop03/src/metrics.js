const { metrics } = require('@opentelemetry/api')

const metadata = require('../package.json')

const HTTP_REQUEST_TOTAL = 'http_request_total'
const HTTP_REQUEST_INFLIGHT_TOTAL = 'http_request_inflight_total'
const HTTP_REQUEST_DURATION_MS = 'http_request_duration_ms'

// TODO: Task 3 - Get metrics provider


// TODO: Task 3 - Create counter metrics for HTTP_REQUEST_TOTAL
const httpRequestTotal = function() { }


// TODO: Task 3 - Create histogram metrics for HTTP_REQUEST_DURATION_MS
const httpRequestDurationMs = function() { }


// TODO: Task 3 - Create gauge metrics for HTTP_REQUEST_INFLIGHT_TOTAL
const httpRequestInflightTotal = function() { }


// TODO: Task 3 - Export the metrics
module.exports = { 
  httpRequestTotal, httpRequestDurationMs, httpRequestInflightTotal, 
  HTTP_REQUEST_TOTAL, HTTP_REQUEST_DURATION_MS, HTTP_REQUEST_INFLIGHT_TOTAL
}
