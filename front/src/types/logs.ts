export interface LogData {
  time: string;
  error: number;
  warn: number;
  info: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface LogSection {
  title: string;
  owner: string;
  totalCount?: number;
  lastUpdated?: string;
}

export type LogType = 'all' | 'error' | 'warn' | 'info';

export interface VisibleLogs {
  all: boolean;
  error: boolean;
  warn: boolean;
  info: boolean;
} 