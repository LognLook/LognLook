import { LogData, PieChartData, LogSection } from '../types/logs';

export const LOG_DATA: LogData[] = [
  { time: '00:00', error: 20, warn: 45, info: 75 },
  { time: '04:00', error: 95, warn: 65, info: 85 },
  { time: '08:00', error: 15, warn: 85, info: 55 },
  { time: '12:00', error: 85, warn: 35, info: 95 },
  { time: '16:00', error: 25, warn: 95, info: 45 },
  { time: '20:00', error: 98, warn: 25, info: 75 },
  { time: '24:00', error: 30, warn: 75, info: 65 },
];

export const PIE_DATA: PieChartData[] = [
  { name: 'ERROR', value: 8 },
  { name: 'WARNING', value: 18 },
  { name: 'INFO', value: 54 },
];

export const CHART_COLORS = {
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const LOG_SECTIONS: LogSection[] = [
  { title: 'Error Logs', owner: 'John Kim' },
  { title: 'Auth Logs', owner: 'Sarah Lee' },
  { title: 'System Logs', owner: 'Mike Park' },
  { title: 'User Logs', owner: 'Jenny Cho' },
  { title: 'API Logs', owner: 'Tom Kang' },
  { title: 'Security Logs', owner: 'Lisa Moon' },
]; 