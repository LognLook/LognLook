import React, { useState } from 'react';
import { DisplayLogItem } from '../../../types/logs';

interface LogDetailModalProps {
  logs: DisplayLogItem[];
  isOpen: boolean;
  onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ logs, isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', message: string }>>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        message: 'This is a sample response. The actual response will come from the API.' 
      }]);
    }, 1000);
    
    setChatMessage('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleLogExpansion = (index: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleLogCheckbox = (index: number, checked: boolean) => {
    setSelectedLogs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="w-[83.33vw] h-[81.84vh] bg-white rounded-[10px] flex">
        {/* Main Content */}
        <div className={`p-6 flex flex-col transition-all duration-300 ${isExpanded ? 'w-[400px]' : 'w-[48.61vw]'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[clamp(17px,1.18vw,20px)] font-[600] font-pretendard text-[#000000]">
              Log Details
            </h2>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-[120px] h-[32px] bg-[#496660] text-white rounded-[4px] text-[14px] font-medium hover:bg-[#EFFBF9] transition-colors flex items-center justify-center gap-2"
            >
              <span>Trouble Shooting</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleLogExpansion(index)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded-[3px] border-[#E5E5EC] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1E435F]"
                        checked={selectedLogs.has(index)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleLogCheckbox(index, e.target.checked);
                        }}
                      />
                      <div>
                        <h3 className="text-[clamp(11px,0.83vw,12px)] font-[600] font-pretendard text-[#000000]">
                          {log.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white"
                            style={{ 
                              backgroundColor: log.level === 'INFO' ? '#496660' : 
                                            log.level === 'WARN' ? '#93CCC1' : '#FE9B7B'
                            }}
                          >
                            {log.level}
                          </span>
                          <span className="text-[10px] text-gray-500">{log.timestamp}</span>
                          <span className="text-[10px] text-gray-500">{log.category}</span>
                        </div>
                      </div>
                    </div>
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className={`transition-transform duration-300 ${expandedLogs.has(index) ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {expandedLogs.has(index) && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-[10px] font-[600] text-gray-500 mb-1">Full Log</h4>
                          <pre className="text-[10px] font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-[600] text-gray-500 mb-1">Host</h4>
                          <p className="text-[10px] text-gray-700">{log.host}</p>
                        </div>
                        {log.comment && (
                          <div>
                            <h4 className="text-[10px] font-[600] text-gray-500 mb-1">Comment</h4>
                            <p className="text-[10px] text-gray-700">{log.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`border-l border-gray-200 flex flex-col transition-all duration-300 ${isExpanded ? 'w-[800px]' : 'w-[34.72vw]'}`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-[clamp(14px,0.97vw,16px)] font-[600] font-pretendard text-[#000000]">
              Chat with Assistant
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  chat.type === 'user' 
                    ? 'bg-[#496660] text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-[clamp(11px,0.83vw,12px)] font-pretendard">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#496660] text-[clamp(11px,0.83vw,12px)] font-pretendard"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-[#496660] text-white rounded-lg hover:bg-[#EFFBF9] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal; 