import React, { useState, useEffect } from 'react';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [troubleShootingTitle, setTroubleShootingTitle] = useState('Trouble Shooting');

  // 모달이 열릴 때 모든 로그 자동 선택
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      const allLogIndices = new Set(logs.map((_, index) => index));
      setSelectedLogs(allLogIndices);
    }
  }, [isOpen, logs]);

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
          </div>
          
          <div className="flex-1 overflow-auto">
            <div className="space-y-0">
              {logs.map((log, index) => (
                <div key={index}>
                  {/* 로그 메인 라인 */}
                  <div className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-[3px] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1E435F]"
                          checked={selectedLogs.has(index)}
                          onChange={(e) => handleLogCheckbox(index, e.target.checked)}
                        />
                        <div className="flex-1">
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
                      
                      {/* View Full Log 버튼 */}
                      <button
                        onClick={() => toggleLogExpansion(index)}
                        className="text-[10px] text-[#496660] hover:text-[#93CCC1] font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>View Full Log</span>
                        <svg 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className={`transition-transform duration-300 ${expandedLogs.has(index) ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* 펼쳐진 로그 상세 정보 */}
                  {expandedLogs.has(index) && (
                    <div className="py-3 px-2 bg-gray-50 border-b border-gray-100">
                      <div className="space-y-3 ml-7">
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
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isExpanded ? (
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </button>
              <h3 className="text-[clamp(14px,0.97vw,16px)] font-[600] font-pretendard text-[#000000]">
                {troubleShootingTitle}
              </h3>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#F0F4F8]">
            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {chatHistory.map((chat, index) => (
                <div key={index} className="space-y-3">
                  {chat.type === 'user' && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-[14px] font-pretendard text-gray-800">{chat.message}</p>
                    </div>
                  )}
                  {chat.type === 'assistant' && (
                    <div className="space-y-3">
                      <p className="text-[14px] font-pretendard text-gray-800 leading-relaxed">
                        {chat.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 하단 입력 영역 */}
            <div className="px-[30px] pb-6">
              {/* 선택된 로그 태그들 */}
              {selectedLogs.size > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from(selectedLogs).map((logIndex) => {
                      const log = logs[logIndex];
                      return (
                        <div key={logIndex} className="flex items-center bg-white border border-gray-300 hover:bg-[#EFFBF9] rounded-full px-3 py-1.5 text-[10px] transition-colors">
                          <span 
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ 
                              backgroundColor: log.level === 'INFO' ? '#496660' : 
                                            log.level === 'WARN' ? '#93CCC1' : '#FE9B7B'
                            }}
                          />
                          <span className="text-gray-700 max-w-[100px] truncate font-medium" title={log.title}>
                            {log.title}
                          </span>
                          <button
                            onClick={() => handleLogCheckbox(logIndex, false)}
                            className="ml-1.5 text-gray-500 hover:text-gray-700"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setSelectedLogs(new Set())}
                      className="text-[10px] text-gray-600 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-100"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
              
              {/* 채팅 입력창 */}
              <div className="relative">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={selectedLogs.size > 0 ? "Ask about the selected logs..." : "Send a message"}
                  className="w-full h-[11.72vh] p-4 border border-gray-300 hover:border-gray-400 focus:border-gray-500 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-gray-500 text-[14px] font-pretendard resize-none bg-white transition-colors"
                  style={{ minHeight: '80px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="absolute bottom-5 right-5 w-[2.22vw] h-[3.125vh] bg-[#496660] text-white rounded-full hover:bg-[#5a7670] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal; 