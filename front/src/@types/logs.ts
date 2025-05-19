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
  feature: string;
  lastUpdated: string;
}

export type LogType = 'all' | 'error' | 'warn' | 'info';

export interface VisibleLogs {
  all: boolean;
  error: boolean;
  warn: boolean;
  info: boolean;
}

export interface LogFilter {
  info: boolean;
  warn: boolean;
  error: boolean;
}

export interface LogGraphProps {
  visibleLogs: VisibleLogs;
  onToggleVisibility: (type: LogType) => void;
}

export type TimePeriod = 'day' | 'week' | 'month';

// 로그 엔트리 타입 추가
export interface LogEntry {
  id: number;
  type: 'ERROR' | 'WARNING' | 'INFO';
  timestamp: string;
  message: string;
}

// Complete log item from ElasticSearch/logging system
export interface LogItem {
  log?: {
    offset: number;
    file: {
      path: string;
    }
  };
  "@timestamp": string;
  message: string;
  "@version": string;
  event?: {
    original: string;
  };
  input?: {
    type: string;
  };
  tags?: string[];
  host?: {
    hostname: string;
    id: string;
    ip: string[];
    mac: string[];
    name: string;
    os?: {
      platform: string;
      family: string;
      name: string;
      type: string;
      version: string;
      kernel: string;
      build: string;
    }
  };
  comment?: string;
  category?: string;
  embedding?: number[];
}

// Simplified log item for display
export interface DisplayLogItem {
  id?: string;
  title: string;  // Main message
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  category: string;
  comment?: string;
  host?: string;
} 