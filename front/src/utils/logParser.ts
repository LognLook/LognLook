import { LogItem, DisplayLogItem } from '../@types/logs';

/**
 * Extracts the log level (INFO, ERROR, WARN, DEBUG) from a log message
 */
export function extractLogLevel(message: string): 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' {
  if (message.includes('INFO')) return 'INFO';
  if (message.includes('ERROR')) return 'ERROR';
  if (message.includes('WARN')) return 'WARN';
  return 'DEBUG';
}

/**
 * Extracts a timestamp in the format of "YYYY-MM-DD HH:MM:SS" from a log message if present,
 * otherwise returns the @timestamp field formatted
 */
export function extractTimestamp(logItem: LogItem): string {
  // Try to extract timestamp from message (e.g., "2025-05-05 15:24:43")
  const timestampMatch = logItem.message.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
  if (timestampMatch && timestampMatch[1]) {
    return timestampMatch[1];
  }
  
  // Fallback to @timestamp field
  const date = new Date(logItem['@timestamp']);
  return date.toLocaleString();
}

/**
 * Parses a raw log item into a simplified DisplayLogItem for UI rendering
 */
export function parseLogItem(logItem: LogItem): DisplayLogItem {
  return {
    id: logItem.host?.id,
    title: logItem.message,
    timestamp: extractTimestamp(logItem),
    level: extractLogLevel(logItem.message),
    category: logItem.category || 'Unknown',
    comment: logItem.comment,
    host: logItem.host?.hostname
  };
}

/**
 * Parses multiple log items for display
 */
export function parseLogItems(logItems: LogItem[]): DisplayLogItem[] {
  return logItems.map(parseLogItem);
} 