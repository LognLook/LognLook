import React, { useState, useEffect } from 'react';
import { LogLevel, TimePeriod } from "../../../../types/logs";
import { TimePeriodSelector } from './TimePeriodSelector';
import { LogLevelFilter } from './LogLevelFilter';
import { LogChart } from './LogChart';
import { logService } from '../../../../services/logService';
import EmptyState from '../EmptyState';

interface LogGraphProps {
  projectId: number;
  timePeriod?: TimePeriod;
  onToggleLevel?: (level: LogLevel) => void;
  onTimePeriodChange?: (period: TimePeriod) => void;
}

interface LogGraphData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LogGraph: React.FC<LogGraphProps> = ({ 
  projectId,
  timePeriod: initialTimePeriod = 'day',
  onTimePeriodChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialTimePeriod);
  const [visibleLevels, setVisibleLevels] = useState<Record<LogLevel, boolean>>({
    INFO: true,
    WARN: true,
    ERROR: true,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [graphData, setGraphData] = useState<LogGraphData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update internal state when timePeriod prop changes
  useEffect(() => {
    setSelectedPeriod(initialTimePeriod);
  }, [initialTimePeriod]);

  // Calculate time range text based on current time
  const getTimeRangeText = (period: TimePeriod): string => {
    const now = new Date();
    let startTime: Date;
    
    switch (period) {
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return `Last 24 Hours (${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})})`;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `Last 7 Days (${startTime.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return `Last 30 Days (${startTime.toLocaleDateString()} - ${now.toLocaleDateString()})`;
      default:
        return 'Log Graph';
    }
  };

  // Fetch graph data with fallback periods
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        
        // Try to find data by testing different periods
        const periods: TimePeriod[] = [selectedPeriod, 'day', 'week', 'month'];
        let stats = null;
        let foundPeriod = selectedPeriod;
        
        for (const period of periods) {
          console.log(`LogGraph - Trying period: ${period}`);
          stats = await logService.getLogStats(projectId, period);
          
          if (stats.totalLogs > 0) {
            foundPeriod = period;
            console.log(`LogGraph - Found data in period: ${period}, totalLogs: ${stats.totalLogs}`);
            break;
          }
        }
        
        // Update selected period if we found data in a different period
        if (foundPeriod !== selectedPeriod && stats && stats.totalLogs > 0) {
          setSelectedPeriod(foundPeriod);
          if (onTimePeriodChange) {
            onTimePeriodChange(foundPeriod);
          }
        }
        
        // Convert API response data to graph format
        if (stats && stats.totalLogs > 0) {
          // Group log data by time to create graph data
          const timeGroups = new Map<string, { INFO: number; WARN: number; ERROR: number }>();
          
          // Generate graph data using recentTrends
          stats.recentTrends.forEach((trend) => {
            // Convert ISO string to Date object
            const date = new Date(trend.date);
            if (isNaN(date.getTime())) {
              console.warn('Invalid date format:', trend.date);
              return;
            }
            
            // Group by hour (create more accurate time key)
            const timeKey = date.toISOString().slice(0, 13) + ':00:00';
            
            if (!timeGroups.has(timeKey)) {
              timeGroups.set(timeKey, { INFO: 0, WARN: 0, ERROR: 0 });
            }
            
            const timeGroup = timeGroups.get(timeKey)!;
            const level = trend.level.toUpperCase() as LogLevel;
            
            if (level in timeGroup) {
              timeGroup[level] += trend.count;
            }
          });
          
          // Sort by time and generate graph data (sort by ISO string)
          const sortedData = Array.from(timeGroups.entries())
            .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
            .map(([time, counts]) => ({
              time: new Date(time).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              ...counts
            }));
          
          setGraphData(sortedData);
        } else {
          setGraphData([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Failed to load graph data:', error);
        setError('Failed to load graph data');
        setGraphData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGraphData();
  }, [projectId, selectedPeriod, onTimePeriodChange]);


  // Monitor sidebar state
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('aside');
      const isSidebarVisible = sidebarElement?.classList.contains('w-[279px]') || false;
      setIsSidebarOpen(isSidebarVisible);
    };

    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('aside');
    
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    checkSidebarState();
    return () => observer.disconnect();
  }, []);

  // Toggle visibility for a specific log level
  const toggleLevelVisibility = (level: LogLevel) => {
    setVisibleLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Calculate width based on sidebar state
  const getGraphWidthClass = () => {
    return isSidebarOpen ? 'w-[50.97vw]' : 'w-[63.61vw]';
  };

  // TimePeriod change handler
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // If no logs are provided, display a message
  if (graphData.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <div className={`bg-white p-4 rounded-lg ${getGraphWidthClass()} h-[32vh] flex items-center justify-center`}>
          <p className="text-gray-500">No more logs to load. API connection is normal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
          Log Graph
        </h2>
        <span className="text-[clamp(11px,0.76vw,13px)] text-gray-600 font-medium">
          {getTimeRangeText(selectedPeriod)}
        </span>
      </div>
      <div className={`bg-white pt-4 pl-4 pr-4 pb-0 rounded-lg ${getGraphWidthClass()} h-[32vh]`}>
        <div className="flex justify-between items-center mb-4">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />

          <div className="flex items-center">
            <div className="flex items-center">
              {(Object.keys(visibleLevels) as LogLevel[]).map(level => (
                <div key={level} className="px-1.5">
                  <LogLevelFilter
                    level={level}
                    isVisible={visibleLevels[level]}
                    onToggle={toggleLevelVisibility}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex pt-3 pb-2">
          {graphData.length > 0 ? (
            <LogChart
              data={graphData}
              visibleLevels={visibleLevels}
              selectedPeriod={selectedPeriod}
            />
          ) : (
            <EmptyState
              title="No Log Data"
              description="No log data available for the selected time period. Check if your project is properly configured."
              icon={
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              className="h-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogGraph;