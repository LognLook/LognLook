import { LogEntry, LogLevel, TimePeriod, ChartLogData } from '../types/logTypes';

// Extract log level from message
export const extractLogLevel = (logEntry: LogEntry): LogLevel => {
  const message = logEntry.message || logEntry.event?.original || '';
  
  if (message.includes(' INFO ')) return 'INFO';
  if (message.includes(' WARN ')) return 'WARN';
  if (message.includes(' WARNING ')) return 'WARN';
  if (message.includes(' ERROR ')) return 'ERROR';
  
  return 'INFO';
};

// Process logs to add level property
export const processLogs = (logs: LogEntry[]): LogEntry[] => {
  return logs.map(log => ({
    ...log,
    level: log.level || extractLogLevel(log)
  }));
};

// Format time key based on period
export const formatTimeKey = (timestamp: Date, period: TimePeriod): string => {
  switch (period) {
    case 'day':
      return `${timestamp.getHours().toString().padStart(2, '0')}:00`;
    case 'week': {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[timestamp.getDay()];
    }
    case 'month':
      return `${(timestamp.getMonth() + 1).toString().padStart(2, '0')}-${timestamp.getDate().toString().padStart(2, '0')}`;
  }
};

// Sort chart data based on period
export const sortChartData = (data: ChartLogData[], period: TimePeriod): ChartLogData[] => {
  return [...data].sort((a, b) => {
    if (period === 'day') {
      return a.time.localeCompare(b.time);
    } else if (period === 'week') {
      const days = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
      return days[a.time as keyof typeof days] - days[b.time as keyof typeof days];
    } else {
      return a.time.localeCompare(b.time);
    }
  });
};

// Aggregate logs by time period
export const aggregateLogsByPeriod = (
  logs: LogGraphData[],
  period: TimePeriod
): ChartLogData[] => {
  const now = new Date();
  let interval: number;
  let format: Intl.DateTimeFormatOptions;

  switch (period) {
    case 'hour':
      interval = 5 * 60 * 1000; // 5 minutes
      format = { hour: '2-digit', minute: '2-digit' };
      break;
    case 'day':
      interval = 30 * 60 * 1000; // 30 minutes
      format = { hour: '2-digit', minute: '2-digit' };
      break;
    case 'week':
      interval = 6 * 60 * 60 * 1000; // 6 hours
      format = { month: 'short', day: 'numeric', hour: '2-digit' };
      break;
    case 'month':
      interval = 24 * 60 * 60 * 1000; // 24 hours
      format = { month: 'short', day: 'numeric' };
      break;
    default:
      interval = 30 * 60 * 1000;
      format = { hour: '2-digit', minute: '2-digit' };
  }

  const timeSlots: ChartLogData[] = [];
  const startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours

  // Initialize time slots
  for (let time = startTime.getTime(); time <= now.getTime(); time += interval) {
    timeSlots.push({
      time: new Date(time).toLocaleTimeString([], format),
      INFO: 0,
      WARN: 0,
      ERROR: 0
    });
  }

  // Aggregate logs into time slots
  logs.forEach(log => {
    const logTime = new Date(log.extracted_timestamp).getTime();
    if (logTime >= startTime.getTime() && logTime <= now.getTime()) {
      const slotIndex = Math.floor((logTime - startTime.getTime()) / interval);
      if (slotIndex >= 0 && slotIndex < timeSlots.length) {
        timeSlots[slotIndex][log.log_level]++;
      }
    }
  });

  return timeSlots;
};

// Get axis label based on period
export const getAxisLabel = (period: TimePeriod): string => {
  switch (period) {
    case 'day': return 'Hours';
    case 'week': return 'Days';
    case 'month': return 'Date';
    default: return 'Time';
  }
};

// Get tooltip label based on period
export const getTooltipLabel = (label: string, period: TimePeriod): string => {
  switch (period) {
    case 'day': return `Hour: ${label}`;
    case 'week': return `Day: ${label}`;
    case 'month': return `Date: ${label}`;
    default: return label;
  }
}; 