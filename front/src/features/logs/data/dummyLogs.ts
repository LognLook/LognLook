import { LogEntry, LogLevel } from '../../../types/logs';

// Helper function to generate random logs
const generateRandomLog = (timestamp: Date): LogEntry => {
  const levels: LogLevel[] = ['INFO', 'WARN', 'ERROR'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  
  const messages: Record<LogLevel, string[]> = {
    INFO: [
      'Application started successfully',
      'User login successful',
      'Cache cleared successfully',
      'Backup completed',
      'API request processed',
      'Database query executed',
      'File upload completed',
      'Configuration updated',
      'Service health check passed',
      'Memory usage normal'
    ],
    WARN: [
      'High memory usage detected',
      'API rate limit approaching',
      'Disk space running low',
      'Slow database query detected',
      'Multiple failed login attempts',
      'Cache miss rate increasing',
      'Network latency above threshold',
      'Resource pool near capacity',
      'Backup taking longer than usual',
      'Service response time degraded'
    ],
    ERROR: [
      'Database connection failed',
      'Payment processing failed',
      'File system error occurred',
      'API endpoint unavailable',
      'Authentication service down',
      'Cache service unresponsive',
      'External API timeout',
      'Database deadlock detected',
      'Memory allocation failed',
      'Network connection lost'
    ]
  };

  const tags = [
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature'],
    ['feature']
  ];

  const randomMessage = messages[level][Math.floor(Math.random() * messages[level].length)];
  const randomTags = tags[Math.floor(Math.random() * tags.length)];

  return {
    '@timestamp': timestamp.toISOString(),
    message: `${level} ${randomMessage}`,
    '@version': '1.0',
    event: { original: `${level} ${randomMessage}` },
    input: { type: 'log' },
    tags: randomTags,
    host: { 
      name: `server-${Math.floor(Math.random() * 5) + 1}`, 
      ip: [`192.168.1.${Math.floor(Math.random() * 255) + 1}`] 
    },
    level
  };
};

// Generate logs for the last 3 months
const generateLogs = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  // Generate logs for each hour in the last 3 months
  for (let date = new Date(threeMonthsAgo); date <= now; date.setHours(date.getHours() + 1)) {
    // Generate 1-5 logs per hour
    const logsPerHour = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < logsPerHour; i++) {
      const logTimestamp = new Date(date);
      logTimestamp.setMinutes(Math.floor(Math.random() * 60));
      logs.push(generateRandomLog(logTimestamp));
    }
  }

  return logs;
};

export const DUMMY_LOGS: LogEntry[] = generateLogs(); 