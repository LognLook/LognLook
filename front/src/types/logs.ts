// Log types
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

// Chart data types
export interface LogData {
  time: string;
  error: number;
  warn: number;
  info: number;
}

export interface LogGraphResponse {
  data: LogData[];
  total: {
    error: number;
    warn: number;
    info: number;
  };
}

export interface ChartLogData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

// UI related types
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

// Time period options
export type TimePeriod = 'day' | 'week' | 'month';

// Chart styling constants
export const CHART_COLORS = {
  INFO: '#496660',
  WARN: '#93CCC1',
  ERROR: '#FE9B7B',
  text: '#4AA8EE',
} as const;

// Log entry types
export interface LogEntry {
  '@timestamp': string;
  message: string;
  '@version': string;
  event: {
    original: string;
  };
  input: {
    type: string;
  };
  tags: string[];
  host: {
    name: string;
    ip: string[];
  };
  container?: {
    id: string;
  };
  agent?: {
    type: string;
    version: string;
    id: string;
    name: string;
  };
  category?: string;
  comment?: string;
  log?: {
    offset: number;
    file: {
      path: string;
    }
  };
  level?: LogLevel;
}

// Internal log interface
export interface Log {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  metadata?: Record<string, unknown>;
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