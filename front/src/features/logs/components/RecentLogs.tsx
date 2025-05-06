import React from 'react';

interface Log {
  id: number;
  type: 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
}

const SAMPLE_LOGS: Log[] = [
  {
    id: 1,
    type: 'error',
    message: 'Failed to connect to database',
    timestamp: '2024-03-21 10:30:15'
  },
  {
    id: 2,
    type: 'warn',
    message: 'High memory usage detected',
    timestamp: '2024-03-21 10:29:45'
  },
  {
    id: 3,
    type: 'info',
    message: 'User authentication successful',
    timestamp: '2024-03-21 10:28:30'
  },
  {
    id: 4,
    type: 'error',
    message: 'API endpoint timeout',
    timestamp: '2024-03-21 10:27:15'
  },
  {
    id: 5,
    type: 'info',
    message: 'System backup completed',
    timestamp: '2024-03-21 10:26:00'
  }
];

const getLogColor = (type: Log['type']) => {
  switch (type) {
    case 'error':
      return 'text-[#FE5823]';
    case 'warn':
      return 'text-[#93CCC1]';
    case 'info':
      return 'text-[#6E9990]';
    default:
      return 'text-gray-500';
  }
};

const RecentLogs: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[1.39vw] font-bold text-[#0F2230]">Recent Logs</h2>
      <div className="bg-white rounded-[1.39vw] shadow-sm w-[75.14vw]">
        <div className="px-[2.22vw] py-[1.95vh] space-y-[1.31vh]">
          {SAMPLE_LOGS.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-[1.11vw] border border-[#E5E7EB] rounded-[0.69vw] hover:bg-[#F9FAFB] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${getLogColor(log.type)}`}>
                  {log.type.toUpperCase()}
                </span>
                <span className="text-[#374151]">{log.message}</span>
              </div>
              <span className="text-[#6B7280] text-sm">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentLogs; 