import React from 'react';
import { LogData, LogType, VisibleLogs } from '../../../@types/logs';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const LOG_DATA: LogData[] = [
  { time: '00:00', error: 20, warn: 45, info: 75 },
  { time: '04:00', error: 95, warn: 65, info: 85 },
  { time: '08:00', error: 15, warn: 85, info: 55 },
  { time: '12:00', error: 85, warn: 35, info: 95 },
  { time: '16:00', error: 25, warn: 95, info: 45 },
  { time: '20:00', error: 98, warn: 25, info: 75 },
  { time: '24:00', error: 30, warn: 75, info: 65 },
];

interface LogGraphProps {
  visibleLogs: VisibleLogs;
  onToggleVisibility: (type: LogType) => void;
}

const LogGraph: React.FC<LogGraphProps> = ({ visibleLogs, onToggleVisibility }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Log Trends</h2>
      <div className="bg-white p-[1.11vw] rounded-lg shadow-md xl:w-[50.97vw] xl:h-[28.125vh]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${visibleLogs.info ? 'bg-[#6E9990]' : 'bg-gray-300'}`} />
            <span className="text-sm">Info</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${visibleLogs.warn ? 'bg-[#93CCC1]' : 'bg-gray-300'}`} />
            <span className="text-sm">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${visibleLogs.error ? 'bg-[#FE794F]' : 'bg-gray-300'}`} />
            <span className="text-sm">Error</span>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            className={`px-[0.83vw] py-[0.49vh] rounded text-[0.875vw] ${visibleLogs.all ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => onToggleVisibility('all')}
          >
            All
          </button>
          <button
            className={`px-[0.83vw] py-[0.49vh] rounded text-[0.875vw] ${visibleLogs.error ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gray-200'}`}
            onClick={() => onToggleVisibility('error')}
          >
            Error
          </button>
          <button
            className={`px-[0.83vw] py-[0.49vh] rounded text-[0.875vw] ${visibleLogs.warn ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' : 'bg-gray-200'}`}
            onClick={() => onToggleVisibility('warn')}
          >
            Warning
          </button>
          <button
            className={`px-[0.83vw] py-[0.49vh] rounded text-[0.875vw] ${visibleLogs.info ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => onToggleVisibility('info')}
          >
            Info
          </button>
        </div>
        <div className="px-[1.11vw] py-[0.98vh]">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart 
              data={LOG_DATA}
              margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FE5823" stopOpacity={1}/>
                  <stop offset="70%" stopColor="#FE5823" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#FE5823" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="warnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#93CCC1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#93CCC1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6E9990" stopOpacity={1}/>
                  <stop offset="52%" stopColor="#6E9990" stopOpacity={0.52}/>
                  <stop offset="100%" stopColor="#6E9990" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickMargin={8}
              />
              <Tooltip 
                contentStyle={{ fontSize: '0.83vw' }}
                itemStyle={{ fontSize: '0.76vw' }}
              />
              {(visibleLogs.all || visibleLogs.info) && (
                <Area 
                  key={`info-${visibleLogs.all ? 'all' : 'single'}`}
                  type="linear"
                  dataKey="info" 
                  stroke="#6E9990"
                  strokeWidth={2}
                  fill="url(#infoGradient)"
                  fillOpacity={0.3}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-out"
                  name="Info"
                />
              )}
              {(visibleLogs.all || visibleLogs.warn) && (
                <Area 
                  key={`warn-${visibleLogs.all ? 'all' : 'single'}`}
                  type="linear"
                  dataKey="warn" 
                  stroke="#93CCC1"
                  strokeWidth={2}
                  fill="url(#warnGradient)"
                  fillOpacity={0.2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-out"
                  name="Warning"
                />
              )}
              {(visibleLogs.all || visibleLogs.error) && (
                <Area 
                  key={`error-${visibleLogs.all ? 'all' : 'single'}`}
                  type="linear"
                  dataKey="error" 
                  stroke="#FE794F"
                  strokeWidth={2}
                  fill="url(#errorGradient)"
                  fillOpacity={0.12}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-out"
                  name="Error"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LogGraph; 