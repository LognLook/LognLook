import React, { useState, useEffect } from 'react';
import { DisplayLogItem } from '../../../types/logs';
import { ApiLogDetailEntry } from '../api/detailLogApi';
import { createTrouble, CreateTroubleRequest } from '../api/troubleApi';
import { ExtendedApiLogDetailEntry } from '../../../types/ExtendedApiLogDetailEntry';

interface LogDetailModalProps {
  logs: DisplayLogItem[];
  isOpen: boolean;
  onClose: () => void;
  detailData?: ApiLogDetailEntry[];
  isDetailLoading?: boolean;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ 
  logs, 
  isOpen, 
  onClose, 
  detailData, 
  isDetailLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'assistant', message: string }>>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [troubleShootingTitle, setTroubleShootingTitle] = useState('Trouble Shooting');
  const [troubleSent, setTroubleSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 모달이 열릴 때 모든 로그 자동 선택
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      const allLogIndices = new Set(logs.map((_, index) => index));
      setSelectedLogs(allLogIndices);
    }
  }, [isOpen, logs]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || troubleSent) return;
    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
    setIsSending(true);
    try {
      // 체크된 로그들의 id 수집 (log.comment만 사용)
      const related_logs = Array.from(selectedLogs).map(idx => logs[idx]?.comment || '');
      const troubleReq: CreateTroubleRequest = {
        is_shared: false,
        project_id: 1, // 필요시 prop으로 변경
        related_logs: related_logs.filter(Boolean),
        user_query: chatMessage
      };
      // userId는 예시로 1 사용, 필요시 prop으로 변경
      const troubleRes = await createTrouble(1, troubleReq);
      setTroubleShootingTitle(troubleRes.report_name);
      setChatHistory(prev => [...prev, { type: 'assistant', message: troubleRes.content }]);
      setSelectedLogs(new Set());
      setTroubleSent(true);
    } catch {
      setChatHistory(prev => [...prev, { type: 'assistant', message: 'Failed to create trouble. Please try again.' }]);
    } finally {
      setIsSending(false);
    }
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
          
          <div className="flex-1 overflow-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f9fafb'
          }}>
            <style dangerouslySetInnerHTML={{
              __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 3px;
                  height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f9fafb;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #d1d5db;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #9ca3af;
                }
              `
            }} />
            <div className="space-y-0 custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index}>
                  {/* 로그 메인 라인 */}
                  <div className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-[3px] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1E435F]"
                          checked={selectedLogs.has(index)}
                          onChange={(e) => handleLogCheckbox(index, e.target.checked)}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[clamp(11px,0.83vw,12px)] font-[600] font-pretendard text-[#000000]" 
                               style={{
                                 display: '-webkit-box',
                                 WebkitLineClamp: 1,
                                 WebkitBoxOrient: 'vertical',
                                 overflow: 'hidden',
                                 textOverflow: 'ellipsis'
                               }}
                               title={log.title}>
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
                        className="text-[10px] text-[#496660] hover:text-[#93CCC1] font-medium flex items-center justify-center transition-colors w-[60px] px-2"
                      >
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
                    <div className="py-6 px-2">
                      <div className="space-y-6 ml-7">
                        {isDetailLoading ? (
                          <div className="flex items-center gap-3 py-8">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                            <span className="text-[12px] text-gray-600 font-medium">Loading detailed information...</span>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* 상세 데이터 렌더링 */}
                            {detailData && Array.isArray(detailData) && detailData.length > 0 ? (
                              // 현재 로그의 ID와 일치하는 상세 데이터만 필터링
                              detailData
                                .filter(item => item._id === log.comment) // log.comment에 저장된 ID와 매칭
                                .map((item: ExtendedApiLogDetailEntry, detailIndex: number) => (
                                <div key={detailIndex} className="space-y-5">
                                  {/* Message Section - Main highlight card */}
                                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                          <path d="M8 12h8M8 8h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-gray-900">Log Message</h3>
                                    </div>
                                    <div className="text-[12px] text-gray-800 leading-relaxed font-mono bg-white rounded-lg p-4 border">
                                      {item._source?.message || item._source?.event?.original || log.title}
                                    </div>
                                  </div>

                                  {/* Basic Information Card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600">
                                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-gray-900">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-medium text-gray-500 w-16">Level:</span>
                                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium text-white ${
                                            item._source?.log_level === 'INFO' ? 'bg-blue-500' :
                                            item._source?.log_level === 'WARN' ? 'bg-yellow-500' :
                                            item._source?.log_level === 'ERROR' ? 'bg-red-500' : 'bg-gray-500'
                                          }`}>
                                            {item._source?.log_level || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-medium text-gray-500 w-16">Keyword:</span>
                                          <span className="text-[11px] text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                                            {item._source?.keyword || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                          <span className="text-[11px] font-medium text-gray-500 w-16 mt-1">Time:</span>
                                          <span className="text-[11px] text-gray-800 font-mono">
                                            {item._source?.message_timestamp || item._source?.['@timestamp'] || 'N/A'}
                                          </span>
                                        </div>
                                        {item._source?.event?.created && (
                                          <div className="flex items-start gap-3">
                                            <span className="text-[11px] font-medium text-gray-500 w-16 mt-1">Created:</span>
                                            <span className="text-[11px] text-gray-800 font-mono">
                                              {item._source.event.created}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* System Information Card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                                          <path d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-gray-900">System Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                      {/* Host Information */}
                                      {item._source?.host && (
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                          <h4 className="text-[12px] font-medium text-gray-700 border-b border-gray-200 pb-2">Host Details</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                            {item._source.host.name && (
                                              <div>
                                                <span className="font-medium text-gray-600">Name:</span>
                                                <span className="ml-2 text-gray-800">{item._source.host.name}</span>
                                              </div>
                                            )}
                                            {item._source.host.hostname && (
                                              <div>
                                                <span className="font-medium text-gray-600">Hostname:</span>
                                                <span className="ml-2 text-gray-800">{item._source.host.hostname}</span>
                                              </div>
                                            )}
                                            {item._source.host.architecture && (
                                              <div>
                                                <span className="font-medium text-gray-600">Architecture:</span>
                                                <span className="ml-2 text-gray-800">{item._source.host.architecture}</span>
                                              </div>
                                            )}
                                            {item._source.host.ip && (
                                              <div>
                                                <span className="font-medium text-gray-600">IP:</span>
                                                <span className="ml-2 text-gray-800 font-mono">{item._source.host.ip}</span>
                                              </div>
                                            )}
                                            {item._source.host.mac && (
                                              <div>
                                                <span className="font-medium text-gray-600">MAC:</span>
                                                <span className="ml-2 text-gray-800 font-mono">{item._source.host.mac}</span>
                                              </div>
                                            )}
                                            {item._source.host.os && (
                                              <div className="col-span-2">
                                                <span className="font-medium text-gray-600">OS:</span>
                                                <span className="ml-2 text-gray-800">
                                                  {item._source.host.os.name} {item._source.host.os.version} 
                                                  {item._source.host.os.platform && ` (${item._source.host.os.platform})`}
                                                  {item._source.host.os.family && ` - ${item._source.host.os.family}`}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Agent Information */}
                                      {item._source?.agent && (
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                          <h4 className="text-[12px] font-medium text-gray-700 border-b border-gray-200 pb-2">Agent Details</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                            {item._source.agent.type && (
                                              <div>
                                                <span className="font-medium text-gray-600">Type:</span>
                                                <span className="ml-2 text-gray-800">{item._source.agent.type}</span>
                                              </div>
                                            )}
                                            {item._source.agent.version && (
                                              <div>
                                                <span className="font-medium text-gray-600">Version:</span>
                                                <span className="ml-2 text-gray-800">{item._source.agent.version}</span>
                                              </div>
                                            )}
                                            {item._source.agent.name && (
                                              <div>
                                                <span className="font-medium text-gray-600">Name:</span>
                                                <span className="ml-2 text-gray-800">{item._source.agent.name}</span>
                                              </div>
                                            )}
                                            {item._source.agent.id && (
                                              <div>
                                                <span className="font-medium text-gray-600">ID:</span>
                                                <span className="ml-2 text-gray-800 font-mono">{item._source.agent.id}</span>
                                              </div>
                                            )}
                                            {item._source.agent.ephemeral_id && (
                                              <div className="col-span-2">
                                                <span className="font-medium text-gray-600">Ephemeral ID:</span>
                                                <span className="ml-2 text-gray-800 font-mono text-[10px]">{item._source.agent.ephemeral_id}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* File & Log Information Card */}
                                  {(item._source?.log || item._source?.file || item._source?.input) && (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-orange-600">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-900">File & Log Information</h3>
                                      </div>
                                      <div className="space-y-4">
                                        {/* Log Details */}
                                        {item._source?.log && (
                                          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                            <h4 className="text-[12px] font-medium text-blue-800 border-b border-blue-200 pb-2">Log Details</h4>
                                            <div className="space-y-2 text-[11px]">
                                              {item._source.log.file?.path && (
                                                <div>
                                                  <span className="font-medium text-blue-700">File Path:</span>
                                                  <div className="mt-1 text-blue-800 font-mono text-[10px] break-all bg-white p-2 rounded border border-blue-200">
                                                    {item._source.log.file.path}
                                                  </div>
                                                </div>
                                              )}
                                              {item._source.log.offset && (
                                                <div>
                                                  <span className="font-medium text-blue-700">Offset:</span>
                                                  <span className="ml-2 text-blue-800 font-mono">{item._source.log.offset}</span>
                                                </div>
                                              )}
                                              {item._source.log?.level && (
                                                <div>
                                                  <span className="font-medium text-blue-700">Log Level:</span>
                                                  <span className="ml-2 text-blue-800">{item._source.log.level}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Input Information */}
                                        {item._source?.input && (
                                          <div className="bg-green-50 rounded-lg p-4 space-y-3">
                                            <h4 className="text-[12px] font-medium text-green-800 border-b border-green-200 pb-2">Input Information</h4>
                                            <div className="space-y-2 text-[11px]">
                                              {item._source.input.type && (
                                                <div>
                                                  <span className="font-medium text-green-700">Type:</span>
                                                  <span className="ml-2 text-green-800">{item._source.input.type}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Event Information Card */}
                                  {item._source?.event && (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-indigo-600">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-900">Event Information</h3>
                                      </div>
                                      <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                          {item._source?.event?.dataset && (
                                            <div>
                                              <span className="font-medium text-indigo-700">Dataset:</span>
                                              <span className="ml-2 text-indigo-800">{item._source.event.dataset}</span>
                                            </div>
                                          )}
                                          {item._source?.event?.module && (
                                            <div>
                                              <span className="font-medium text-indigo-700">Module:</span>
                                              <span className="ml-2 text-indigo-800">{item._source.event.module}</span>
                                            </div>
                                          )}
                                          {item._source?.event?.original && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-indigo-700">Original Message:</span>
                                              <div className="mt-1 text-indigo-800 font-mono text-[10px] bg-white p-2 rounded border border-indigo-200 break-all">
                                                {item._source.event.original}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Additional Fields Card */}
                                  {(item._source?.comment || item._source?.tags || item._source?.fields) && (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-900">Additional Information</h3>
                                      </div>
                                      <div className="space-y-4">
                                        {item._source?.comment && (
                                          <div>
                                            <span className="text-[12px] font-medium text-gray-700">Description:</span>
                                            <div className="mt-2 text-[11px] text-gray-800 bg-gray-50 p-3 rounded-lg">{item._source.comment}</div>
                                          </div>
                                        )}
                                        {item._source?.tags && (
                                          <div>
                                            <span className="text-[12px] font-medium text-gray-700">Tags:</span>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                              {item._source.tags.map((tag: string, tagIndex: number) => (
                                                <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] rounded-full">
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Metadata Card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-gray-900">Document Metadata</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                        <div>
                                          <span className="font-medium text-gray-600">Document ID:</span>
                                          <span className="ml-2 text-gray-800 font-mono text-[10px]">{item._id}</span>
                                        </div>
                                        {item._index && (
                                          <div>
                                            <span className="font-medium text-gray-600">Index:</span>
                                            <span className="ml-2 text-gray-800">{item._index}</span>
                                          </div>
                                        )}
                                        {item._type && (
                                          <div>
                                            <span className="font-medium text-gray-600">Type:</span>
                                            <span className="ml-2 text-gray-800">{item._type}</span>
                                          </div>
                                        )}
                                        {item._score && (
                                          <div>
                                            <span className="font-medium text-gray-600">Score:</span>
                                            <span className="ml-2 text-gray-800">{item._score}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Raw Data Section */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <details className="group">
                                      <summary className="flex items-center gap-2 cursor-pointer hover:text-gray-700 mb-4">
                                        <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-600 transition-transform duration-200 group-open:rotate-90">
                                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-900">Raw JSON Data</h3>
                                      </summary>
                                      <div className="mt-4 p-4 bg-slate-900 rounded-lg border overflow-x-auto max-h-80 custom-scrollbar">
                                        <pre className="text-[10px] text-slate-100 font-mono whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                                      </div>
                                    </details>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                    <path d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.441.383 2.792 1.054 3.963L3 20l4.3-.947z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <p className="text-[12px] text-gray-500 font-medium">No detailed data available for this log</p>
                                <p className="text-[11px] text-gray-400 mt-1">Try expanding other logs to view their details</p>
                              </div>
                            )}
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
              {!troubleSent && (
                <div className="relative">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder={selectedLogs.size > 0 ? "Ask about the selected logs..." : "Send a message"}
                    className="w-full h-[11.72vh] p-4 border border-gray-300 hover:border-gray-400 focus:border-gray-500 rounded-[20px] focus:outline-none focus:ring-1 focus:ring-gray-500 text-[14px] font-pretendard resize-none bg-white transition-colors"
                    style={{ minHeight: '80px' }}
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || isSending}
                    className="absolute bottom-5 right-5 w-[2.22vw] h-[3.125vh] bg-[#496660] text-white rounded-full hover:bg-[#5a7670] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal; 