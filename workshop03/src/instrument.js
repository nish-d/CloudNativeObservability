// Imports
const {NodeSDK} = require('@opentelemetry/sdk-node')
const {getNodeAutoInstrumentations} = require('@opentelemetry/auto-instrumentations-node')
const {resourceFromAttributes} = require('@opentelemetry/resources')
const {ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION} = require('@opentelemetry/semantic-conventions')

// Trace
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc')
const {SimpleSpanProcessor, ConsoleSpanExporter, BatchSpanProcessor} = require('@opentelemetry/sdk-trace-node')

// Logs
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc')
const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs')


// Metrics
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics')
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc')
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus')
const metadata = require('../package.json')
const serviceName = metadata.name
const serviceVersion = metadata.version

const OTEL_COLLECTOR_HOST = process.env.OTEL_COLLECTOR_HOST || '127.0.0.1'
const OTEL_COLLECTOR_PORT = process.env.OTEL_COLLECTOR_PORT || 4317
const PROM_PORT = parseInt(process.env.PROM_PORT) || 5050
const PROM_ENDPOINT = process.env.PROM_ENDPOINT || '/metrics'
const ENABLE_PROM = process.env.ENABLE_PROM || 'no'


const metricReaders = []


// Metrics exporters
// TODO: Create metric exporters, enable only one
if ((ENABLE_PROM.toLowerCase() === 'yes') || (ENABLE_PROM.toLowerCase() === 'true')) {
  // TODO: Task 2 - Creaet Prometheus exporter
  console.info('Enabling Prometheus Metric exporter (Pull)')
  const promExporter = new PrometheusExporter({
    port: PROM_PORT,
    endpoint: PROM_ENDPOINT,
  })
  metricReaders.push(promExporter/* Prometheus exporter */)

} else {
  // TODO: Task 2 - Create metric OTLP exporter and metric reader
  // Default
  console.info('Enabling OTLP Metric exporter (Push)')
  //Push exporter
  const otlpMetricExporter = new OTLPMetricExporter({
    url: `http://${OTEL_COLLECTOR_HOST}:${OTEL_COLLECTOR_PORT}`})
  // metric reader
  const otlpMetricReader = new PeriodicExportingMetricReader({
    exporter: otlpMetricExporter,
    exportIntervalMillis: 15*1000 // 15 s
  })
  metricReaders.push(otlpMetricReader/* otlp metric reader */)
}

// Log exporters
const otlpLogProcessor = new BatchLogRecordProcessor(
  new OTLPLogExporter({
    url: `http://${OTEL_COLLECTOR_HOST}:${OTEL_COLLECTOR_PORT}`
  }), 
  { 
    maxExportBatchSize: 512 
  }
)

// Trace exporters
const otlpTraceProcessor = new BatchSpanProcessor(
    new OTLPTraceExporter({
    url: `http://${OTEL_COLLECTOR_HOST}:${OTEL_COLLECTOR_PORT}`
  })
)

const consoleTraceProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter())

const sdk = new NodeSDK({
  // Configure resource attributes
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: serviceName,
    [ ATTR_SERVICE_VERSION ]: serviceVersion
  }),

  // TODO: Task 2 - Meter provider with metric reader configured
  metricReaders: metricReaders,

  // Configure span processor
  spanProcessors: [ otlpTraceProcessor, /*consoleTraceProcessor */ ],

  // Configure log processor 
  logRecordProcessors: [ otlpLogProcessor ],

  // Auto configure libraries for auto instrumentation
  instrumentations: getNodeAutoInstrumentations()
})

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.info('Instrumentation terminated'))
    .finally(() => process.exit(0))
})

sdk.start()

console.info('Starting instrumentation')
