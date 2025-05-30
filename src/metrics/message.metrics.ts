import { Counter, Histogram } from 'prom-client';

export const messageProcessedCounter = new Counter({
  name: 'messages_processed_total',
  help: 'Total de mensagens processadas',
  labelNames: ['status'],
});

export const messageRetryCounter = new Counter({
  name: 'messages_retry_total',
  help: 'Total de retentativas de processamento',
  labelNames: ['id'],
});

export const messageProcessingDuration = new Histogram({
  name: 'message_processing_duration_seconds',
  help: 'Duração do processamento das mensagens (segundos)',
  buckets: [0.5, 1, 2, 5, 10],
  labelNames: ['status', 'id'],
});
