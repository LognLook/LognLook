export type LogLevel = 'ERROR' | 'WARN' | 'INFO';

export type TimePeriod = 'day' | 'week' | 'month' | 'hour';

export interface LogEntry {
  id: string;
  level?: LogLevel;
  message?: string;
  timestamp?: string;
  title?: string;
  host?: {
    name: string;
  };
  category?: string;
  comment?: string;
  source?: string;
  metadata?: Record<string, string | number | boolean | null>;
  event?: {
    original?: string;
  };
  extracted_timestamp?: string;
  log_level?: LogLevel;
  message_timestamp?: string;
}

export interface LogGraphData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
  extracted_timestamp?: string;
  log_level?: LogLevel;
}

export interface ChartLogData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export interface LogGraphResponse {
  data: LogGraphData[];
}

export const CHART_COLORS: Record<LogLevel, string> = {
  ERROR: '#FE9B7B',
  WARN: '#93CCC1',
  INFO: '#496660'
}; 