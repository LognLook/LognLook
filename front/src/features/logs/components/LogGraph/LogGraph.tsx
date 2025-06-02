import React, { useState, useEffect } from 'react';
import { LogLevel, TimePeriod } from '../../types/logTypes';
import { TimePeriodSelector } from './TimePeriodSelector';
import { LogLevelFilter } from './LogLevelFilter';
import { LogChart } from './LogChart';
import logApi from '../../api/logApi';

interface LogGraphProps {
  projectId: number;
  timePeriod?: TimePeriod;
  onToggleLevel?: (level: LogLevel) => void;
}

interface LogGraphData {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LogGraph: React.FC<LogGraphProps> = ({ 
  projectId,
  timePeriod: initialTimePeriod = 'day'
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

  // Fetch graph data
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        const response = await logApi.fetchLogGraphData(projectId, selectedPeriod);
        
        // API 응답 데이터는 이미 올바른 형식이므로 직접 사용
        setGraphData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error in loadGraphData:', err);
        setError('Failed to load log graph data');
      } finally {
        setIsLoading(false);
      }
    };

    loadGraphData();
  }, [projectId, selectedPeriod]);

  // Add effect to monitor graphData changes
  useEffect(() => {
    console.log('Current graphData:', graphData);
  }, [graphData]);

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
      <h2 className="text-[clamp(17px,1.18vw,20px)] font-semibold font-pretendard text-[#000000]">
        Log Graph
      </h2>
      <div className={`bg-white pt-4 pl-4 pr-4 pb-0 rounded-lg ${getGraphWidthClass()} h-[32vh]`}>
        <div className="flex justify-between items-center mb-4">
          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
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
          <LogChart
            data={graphData}
            visibleLevels={visibleLevels}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default LogGraph;