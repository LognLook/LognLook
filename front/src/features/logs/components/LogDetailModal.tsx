import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { DisplayLogItem } from '../../../types/logs';
import { ApiLogDetailEntry } from '../api/detailLogApi';
import { createTrouble, TroubleWithLogs } from '../api/troubleApi';
import { ExtendedApiLogDetailEntry } from '../../../types/ExtendedApiLogDetailEntry';
import { CreateTroubleResponse } from '../api/troubleApi';
import { troubleService, CreateTroubleRequest } from '../../../services/troubleService'; // 올바른 import

interface LogDetailModalProps {
  logs: DisplayLogItem[];
  isOpen: boolean;
  onClose: () => void;
  detailData?: ApiLogDetailEntry[];
  isDetailLoading?: boolean;
  selectedTrouble?: TroubleWithLogs | null;
  onTroubleCreated?: (troubleId: number) => void;
  projectId?: number; // 프로젝트 ID 추가
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ 
  logs, 
  isOpen, 
  onClose, 
  detailData, 
  isDetailLoading = false,
  selectedTrouble,
  onTroubleCreated,
  projectId
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
  const [copyNotification, setCopyNotification] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({
            isShared: false,
    teamboardTitle: '',
    teamboardDescription: '',
    tags: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  // 공유 상태를 별도로 관리
  const [isShared, setIsShared] = useState(false);
  
  // 현재 메시지 인덱스를 추적하기 위한 ref
  const currentMessageIndexRef = useRef<number>(-1);

  // 복사 기능과 알림
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotification(`${label} copied!`);
      setTimeout(() => setCopyNotification(''), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyNotification('Copy failed');
      setTimeout(() => setCopyNotification(''), 2000);
    }
  };

  // 모달이 열릴 때 모든 로그 자동 선택
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      const allLogIndices = new Set(logs.map((_, index) => index));
      setSelectedLogs(allLogIndices);
    }
  }, [isOpen, logs]);

  // selectedTrouble이 있을 때 채팅 기록 미리 설정
  useEffect(() => {
    console.log('🔍 LogDetailModal useEffect - selectedTrouble:', selectedTrouble);
    console.log('🔍 LogDetailModal useEffect - isOpen:', isOpen);
    
    if (selectedTrouble && isOpen) {
      console.log('🔍 Setting chat history with selectedTrouble:', {
        user_query: selectedTrouble.trouble.user_query,
        content: selectedTrouble.trouble.content,
        report_name: selectedTrouble.trouble.report_name,
        is_shared: selectedTrouble.trouble.is_shared
      });
      
      setChatHistory([
        { type: 'user', message: selectedTrouble.trouble.user_query },
        { type: 'assistant', message: selectedTrouble.trouble.content }
      ]);
      setTroubleShootingTitle(selectedTrouble.trouble.report_name);
      setTroubleSent(true);
      setShareSettings(prev => ({
        ...prev,
        isShared: selectedTrouble.trouble.is_shared,
        teamboardTitle: selectedTrouble.trouble.report_name,
        teamboardDescription: selectedTrouble.trouble.user_query
      }));
    } else if (isOpen) {
      console.log('🔍 Resetting chat history - no selectedTrouble');
      setChatHistory([]);
      setTroubleShootingTitle('Trouble Shooting');
      setTroubleSent(false);
      setShareSettings(prev => ({
        ...prev,
        isShared: false,
        teamboardTitle: '',
        teamboardDescription: ''
      }));
    }
  }, [selectedTrouble, isOpen]);

  if (!isOpen) return null;

  // 백엔드 분석: AI 분석은 동기적으로 처리되며, 실패 시 "진행 중입니다" 메시지로 대체됨
  // 이후 상태가 변경되지 않으므로 polling이 필요하지 않음
  // 대신 사용자에게 명확한 피드백을 제공

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || troubleSent) return;
    setChatHistory(prev => [...prev, { type: 'user', message: chatMessage }]);
    setIsSending(true);
    
    // Show simple loading indicator - backend processes synchronously
    setChatHistory(prev => [...prev, { 
      type: 'assistant', 
      message: 'LOADING_PLACEHOLDER'
    }]);
    
    try {
      // 체크된 로그들의 id 수집 (log.comment만 사용)
      const related_logs = Array.from(selectedLogs).map(idx => logs[idx]?.comment || '').filter(Boolean);
      
      console.log('🔍 Troubleshooting Debug Info:');
      console.log('Selected logs count:', selectedLogs.size);
      console.log('Selected log indices:', Array.from(selectedLogs));
      console.log('All logs data:', logs);
      console.log('Related log IDs:', related_logs);
      console.log('User query:', chatMessage);
      
      // 각 선택된 로그의 상세 정보 출력
      Array.from(selectedLogs).forEach(idx => {
        const log = logs[idx];
        console.log(`📋 Log at index ${idx}:`, {
          id: log?.id,
          comment: log?.comment,
          title: log?.title,
          timestamp: log?.timestamp,
          level: log?.level,
          category: log?.category
        });
      });
      
      if (related_logs.length === 0) {
        throw new Error('No valid log IDs found. Please select at least one log.');
      }
      
      const troubleReq: CreateTroubleRequest = {
        is_shared: isShared, // 사용자가 선택한 공유 상태 사용
        project_id: projectId || 1, // 전달받은 프로젝트 ID 사용
        related_logs: related_logs,
        user_query: chatMessage
      };
      
      console.log('📤 Sending trouble request:', troubleReq);
      
      console.log('🔄 Calling createTrouble API...');
      const troubleRes = await createTrouble(troubleReq);
      console.log('✅ createTrouble API call successful');
      console.log('📋 Full trouble response:', troubleRes);
      console.log('📝 Trouble content:', troubleRes.content);
      console.log('📝 Trouble report_name:', troubleRes.report_name);
      console.log('📝 Trouble ID:', troubleRes.id);
      
      setTroubleShootingTitle(troubleRes.report_name);
      
      // 백엔드 응답에서 status 필드 확인하여 처리 상태를 판단
      // status가 'processing'이면 AI 분석이 실패했거나 시간 초과되었음을 의미
      const isProcessing = troubleRes.status === 'processing' || (troubleRes.content && troubleRes.content.includes('진행 중입니다'));
      
      if (isProcessing) {
        console.log('⚠️ Server returned "진행 중입니다" - AI analysis failed or timed out');
        
        // Show user-friendly message for AI analysis failure
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          if (newHistory[lastIndex].message === 'LOADING_PLACEHOLDER') {
            newHistory[lastIndex] = { 
              type: 'assistant', 
              message: `⚠️ AI analysis encountered an issue\n\n📋 Report: ${troubleRes.report_name}\n🔍 Analyzed: ${related_logs.length} logs\n💬 Query: "${chatMessage}"\n\n🤖 Server AI analysis was not completed.\n\n💡 Solutions:\n• Try with fewer logs\n• Wait and try again\n• Contact administrator\n\n📋 ID: ${troubleRes.id}` 
            };
          }
          return newHistory;
        });
        
        setSelectedLogs(new Set());
        setTroubleSent(true); // 실패해도 완료로 처리
        setIsSending(false);   // 로딩 상태 종료
        
        // 부모 컴포넌트에 알림 (목록 새로고침용)
        if (onTroubleCreated) {
          onTroubleCreated(troubleRes.id);
        }
        
      } else {
        console.log('✅ Server response indicates successful completion');
        
        // Show successful completion result
        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          if (newHistory[lastIndex].message === 'LOADING_PLACEHOLDER') {
            newHistory[lastIndex] = { 
              type: 'assistant', 
              message: `✅ AI analysis completed!\n\n${troubleRes.content}` 
            };
          }
          return newHistory;
        });
        
        setSelectedLogs(new Set());
        setTroubleSent(true);
        setIsSending(false);
        
        // 부모 컴포넌트에 알림
        if (onTroubleCreated) {
          onTroubleCreated(troubleRes.id);
        }
      }
    } catch (error) {
      console.error('❌ Trouble creation failed:', error);
      
      let errorMessage = 'Failed to create trouble. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      // Replace loading message with error message
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        if (newHistory[lastIndex].message === 'LOADING_PLACEHOLDER') {
          newHistory[lastIndex] = { 
            type: 'assistant', 
            message: `❌ Troubleshooting creation failed\n\n🔍 Error: ${errorMessage}\n\n💡 Solutions:\n• Check network connection\n• Verify login status\n• Try again later\n• Contact administrator if problem persists` 
          };
        }
        return newHistory;
      });
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

  const handleShareClick = () => {
    if (!selectedTrouble) return;
    
    // 기존 값들로 초기화
          // 기존 값들로 초기화 (타입 에러 방지를 위해 간단하게 처리)
      setShareSettings(prev => ({
        ...prev,
        teamboardTitle: 'Trouble Report',
        teamboardDescription: 'Troubleshooting content'
      }));
      
      // 공유 상태 동기화
      setIsShared(false);
    
    setShowShareModal(true);
  };

  const handleShareSettingsUpdate = async () => {
    if (!selectedTrouble) return;

    // 필수 필드 검증
    if (!shareSettings.teamboardTitle.trim()) {
      alert('Report name is required');
      return;
    }

    if (!shareSettings.teamboardDescription.trim()) {
      alert('Content is required');
      return;
    }
    
    try {
      console.log('Updating trouble share settings:', {
        troubleId: selectedTrouble.trouble.id,
        isShared: isShared,
        reportName: shareSettings.teamboardTitle,
        content: shareSettings.teamboardDescription
      });
      
      // Update trouble sharing settings using PUT API
      await troubleService.updateTrouble(selectedTrouble.trouble.id, {
        is_shared: isShared,
        report_name: shareSettings.teamboardTitle,
        content: shareSettings.teamboardDescription
      });
      
      // Update local state
      setShareSettings(prev => ({ ...prev, isShared: isShared }));
      
      // Notify parent component for refresh
      if (onTroubleCreated) {
        onTroubleCreated(selectedTrouble.trouble.id);
      }
      
      console.log('Share settings updated successfully');
      
    } catch (error) {
      console.error('Failed to update share settings:', error);
      // TODO: Add proper error notification
      alert('Failed to update sharing settings');
    }
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
                              // 단일 로그 상세 정보 표시 - 첫 번째 데이터 항목 사용
                              (() => {
                                console.log('🔍 Rendering detail data for log index:', index, {
                                  logId: log.id,
                                  logComment: log.comment,
                                  detailDataLength: detailData.length,
                                  firstDetailItem: detailData[0]
                                });
                                
                                // 단일 로그이므로 첫 번째 상세 데이터 항목 사용
                                return [detailData[0]];
                              })()
                                .map((item: ExtendedApiLogDetailEntry, detailIndex: number) => (
                                <div key={detailIndex} className="space-y-5">
                                  {/* Message Section - Main highlight card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 bg-[#1E435F] rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#B8FFF1]">
                                          <path d="M8 12h8M8 8h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Log Message</h3>
                                    </div>
                                    <div className="text-[12px] text-[#1E435F] leading-relaxed font-mono bg-[#F0F4F8] rounded-lg p-4 border border-[#E1E8ED]">
                                      {item._source?.message || item._source?.event?.original || log.title}
                                    </div>
                                  </div>

                                  {/* Additional Fields Card - Moved to top */}
                                  {(item._source?.comment || item._source?.tags || item._source?.fields) && (
                                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                      <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-[#93CCC1] rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                                            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-[#1E435F]">Additional Information</h3>
                                      </div>
                                      <div className="space-y-4">
                                        {item._source?.comment && (
                                          <div>
                                            <span className="text-[12px] font-medium text-[#496660]">Description:</span>
                                            <div className="mt-2 text-[11px] text-[#1E435F] bg-[#F0F4F8] p-3 rounded-lg">{item._source.comment}</div>
                                          </div>
                                        )}
                                        {item._source?.tags && (
                                          <div className="flex items-start gap-2">
                                            <span className="text-[12px] font-medium text-[#496660] whitespace-nowrap">Tags:</span>
                                            <div className="flex flex-wrap gap-1">
                                              {item._source.tags.map((tag: string, tagIndex: number) => (
                                                <span key={tagIndex} className="px-2 py-1 bg-[#93CCC1] text-white text-[10px] rounded-full">
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Basic Information Card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-6 h-6 bg-[#496660] rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                                          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-medium text-[#496660] w-16">Level:</span>
                                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium text-white ${
                                            item._source?.log_level === 'INFO' ? 'bg-[#496660]' :
                                            item._source?.log_level === 'WARN' ? 'bg-[#93CCC1]' :
                                            item._source?.log_level === 'ERROR' ? 'bg-[#FE9B7B]' : 'bg-gray-500'
                                          }`}>
                                            {item._source?.log_level || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-[11px] font-medium text-[#496660] w-16">Keyword:</span>
                                          <span className="text-[11px] text-[#1E435F] bg-[#F0F4F8] px-2 py-1 rounded-md">
                                            {item._source?.keyword || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                          <span className="text-[11px] font-medium text-[#496660] w-16 mt-1">Time:</span>
                                          <span className="text-[11px] text-[#1E435F] font-mono">
                                            {item._source?.message_timestamp || item._source?.['@timestamp'] || 'N/A'}
                                          </span>
                                        </div>
                                        {item._source?.event?.created && (
                                          <div className="flex items-start gap-3">
                                            <span className="text-[11px] font-medium text-[#496660] w-16 mt-1">Created:</span>
                                            <span className="text-[11px] text-[#1E435F] font-mono">
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
                                      <div className="w-6 h-6 bg-[#93CCC1] rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                                          <path d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-[#1E435F]">System Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                      {/* Host Information */}
                                      {item._source?.host && (
                                        <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                          <h4 className="text-[12px] font-medium text-[#1E435F] border-b border-[#E1E8ED] pb-2">Host Details</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                            {item._source.host.name && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Name:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.host.name}</span>
                                              </div>
                                            )}
                                            {item._source.host.hostname && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Hostname:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.host.hostname}</span>
                                              </div>
                                            )}
                                            {item._source.host.architecture && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Architecture:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.host.architecture}</span>
                                              </div>
                                            )}
                                            {item._source.host.ip && (
                                              <div className="flex items-center gap-3">
                                                <span className="font-medium text-[#496660] flex-shrink-0">IP:</span>
                                                <div className="flex-1 min-w-0 relative group">
                                                  <span 
                                                    className="text-[#1E435F] font-mono cursor-pointer hover:bg-gray-100 px-1 rounded block truncate"
                                                    onClick={() => {
                                                      const ipValue = Array.isArray(item._source?.host?.ip) ? item._source.host.ip.join(', ') : item._source?.host?.ip;
                                                      if (ipValue) handleCopy(ipValue, 'IP Address');
                                                    }}
                                                  >
                                                    {Array.isArray(item._source?.host?.ip) ? item._source.host.ip.join(', ') : item._source.host.ip}
                                                  </span>
                                                  {/* Tooltip */}
                                                  <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                                    {Array.isArray(item._source?.host?.ip) ? item._source.host.ip.join(', ') : item._source.host.ip}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            {item._source.host.mac && (
                                              <div className="flex items-center gap-3">
                                                <span className="font-medium text-[#496660] flex-shrink-0">MAC:</span>
                                                <div className="flex-1 min-w-0 relative group">
                                                  <span 
                                                    className="text-[#1E435F] font-mono cursor-pointer hover:bg-gray-100 px-1 rounded block truncate"
                                                    onClick={() => {
                                                      const macValue = Array.isArray(item._source?.host?.mac) ? item._source.host.mac.join(', ') : item._source.host.mac;
                                                      if (macValue) handleCopy(macValue, 'MAC Address');
                                                    }}
                                                  >
                                                    {Array.isArray(item._source?.host?.mac) ? item._source.host.mac.join(', ') : item._source.host.mac}
                                                  </span>
                                                  {/* Tooltip */}
                                                  <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                                    {Array.isArray(item._source?.host?.mac) ? item._source.host.mac.join(', ') : item._source.host.mac}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            {item._source.host.os && (
                                              <div className="col-span-2">
                                                <span className="font-medium text-[#496660]">OS:</span>
                                                <span className="ml-2 text-[#1E435F]">
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
                                        <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                          <h4 className="text-[12px] font-medium text-[#1E435F] border-b border-[#E1E8ED] pb-2">Agent Details</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                            {item._source.agent.type && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Type:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.agent.type}</span>
                                              </div>
                                            )}
                                            {item._source.agent.version && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Version:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.agent.version}</span>
                                              </div>
                                            )}
                                            {item._source.agent.name && (
                                              <div>
                                                <span className="font-medium text-[#496660]">Name:</span>
                                                <span className="ml-2 text-[#1E435F]">{item._source.agent.name}</span>
                                              </div>
                                            )}
                                            {item._source.agent.id && (
                                              <div className="flex items-center gap-3">
                                                <span className="font-medium text-[#496660] flex-shrink-0">ID:</span>
                                                <div className="flex-1 min-w-0 relative group">
                                                  <span 
                                                    className="text-[#1E435F] font-mono cursor-pointer hover:bg-gray-100 px-1 rounded block truncate"
                                                    onClick={() => {
                                                      if (item._source?.agent?.id) handleCopy(item._source.agent.id, 'Agent ID');
                                                    }}
                                                  >
                                                    {item._source.agent.id}
                                                  </span>
                                                  {/* Tooltip */}
                                                  <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                                    {item._source.agent.id}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            {item._source.agent.ephemeral_id && (
                                              <div className="col-span-2">
                                                <div className="flex items-center gap-3">
                                                  <span className="font-medium text-[#496660] flex-shrink-0">Ephemeral ID:</span>
                                                  <div className="flex-1 min-w-0 relative group">
                                                    <span 
                                                      className="text-[#1E435F] font-mono text-[10px] cursor-pointer hover:bg-gray-100 px-1 rounded block truncate"
                                                      onClick={() => {
                                                        if (item._source?.agent?.ephemeral_id) handleCopy(item._source.agent.ephemeral_id, 'Ephemeral ID');
                                                      }}
                                                    >
                                                      {item._source.agent.ephemeral_id}
                                                    </span>
                                                    {/* Tooltip */}
                                                    <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                                      {item._source.agent.ephemeral_id}
                                                    </div>
                                                  </div>
                                                </div>
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
                                        <div className="w-6 h-6 bg-[#1E435F] rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#B8FFF1]">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-[#1E435F]">File & Log Information</h3>
                                      </div>
                                      <div className="space-y-4">
                                        {/* Log Details */}
                                        {item._source?.log && (
                                          <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                            <h4 className="text-[12px] font-medium text-[#1E435F] border-b border-[#E1E8ED] pb-2">Log Details</h4>
                                            <div className="space-y-2 text-[11px]">
                                              {item._source.log.file?.path && (
                                                <div>
                                                  <span className="font-medium text-[#496660]">File Path:</span>
                                                  <div className="mt-1 text-[#1E435F] font-mono text-[10px] break-all bg-white p-2 rounded border border-[#E1E8ED]">
                                                    {item._source.log.file.path}
                                                  </div>
                                                </div>
                                              )}
                                              {item._source.log.offset && (
                                                <div>
                                                  <span className="font-medium text-[#496660]">Offset:</span>
                                                  <span className="ml-2 text-[#1E435F] font-mono">{item._source.log.offset}</span>
                                                </div>
                                              )}
                                              {item._source.log?.level && (
                                                <div>
                                                  <span className="font-medium text-[#496660]">Log Level:</span>
                                                  <span className="ml-2 text-[#1E435F]">{item._source.log.level}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Input Information */}
                                        {item._source?.input && (
                                          <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                            <h4 className="text-[12px] font-medium text-[#1E435F] border-b border-[#E1E8ED] pb-2">Input Information</h4>
                                            <div className="space-y-2 text-[11px]">
                                              {item._source.input.type && (
                                                <div>
                                                  <span className="font-medium text-[#496660]">Type:</span>
                                                  <span className="ml-2 text-[#1E435F]">{item._source.input.type}</span>
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
                                        <div className="w-6 h-6 bg-[#496660] rounded-lg flex items-center justify-center">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-[#1E435F]">Event Information</h3>
                                      </div>
                                      <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                          {item._source?.event?.dataset && (
                                            <div>
                                              <span className="font-medium text-[#496660]">Dataset:</span>
                                              <span className="ml-2 text-[#1E435F]">{item._source.event.dataset}</span>
                                            </div>
                                          )}
                                          {item._source?.event?.module && (
                                            <div>
                                              <span className="font-medium text-[#496660]">Module:</span>
                                              <span className="ml-2 text-[#1E435F]">{item._source.event.module}</span>
                                            </div>
                                          )}
                                          {item._source?.event?.original && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-[#496660]">Original Message:</span>
                                              <div className="mt-1 text-[#1E435F] font-mono text-[10px] bg-white p-2 rounded border border-[#E1E8ED] break-all">
                                                {item._source.event.original}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Metadata Card */}
                                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-6 h-6 bg-[#1E435F] rounded-lg flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#B8FFF1]">
                                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </div>
                                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Document Metadata</h3>
                                    </div>
                                    <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                        <div className="flex items-center gap-3">
                                          <span className="font-medium text-[#496660] flex-shrink-0">Document ID:</span>
                                          <div className="flex-1 min-w-0 relative group">
                                            <span 
                                              className="text-[#1E435F] font-mono text-[10px] cursor-pointer hover:bg-gray-100 px-1 rounded block truncate"
                                              onClick={() => {
                                                if (item._id) handleCopy(item._id, 'Document ID');
                                              }}
                                            >
                                              {item._id}
                                            </span>
                                            {/* Tooltip */}
                                            <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                              {item._id}
                                            </div>
                                          </div>
                                        </div>
                                        {item._index && (
                                          <div>
                                            <span className="font-medium text-[#496660]">Index:</span>
                                            <span className="ml-2 text-[#1E435F]">{item._index}</span>
                                          </div>
                                        )}
                                        {item._type && (
                                          <div>
                                            <span className="font-medium text-[#496660]">Type:</span>
                                            <span className="ml-2 text-[#1E435F]">{item._type}</span>
                                          </div>
                                        )}
                                        {item._score && (
                                          <div>
                                            <span className="font-medium text-[#496660]">Score:</span>
                                            <span className="ml-2 text-[#1E435F]">{item._score}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Raw Data Section */}
                                  <details className="group">
                                    <summary className="flex items-center gap-2 cursor-pointer hover:text-[#496660] py-2">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500 transition-transform duration-200 group-open:rotate-90">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Raw JSON Data</h3>
                                    </summary>
                                    <div className="mt-4 p-4 bg-[#F0F4F8] rounded-lg overflow-x-auto max-h-80 custom-scrollbar border border-[#E1E8ED]">
                                      <pre className="text-[10px] text-[#1E435F] font-mono whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                                    </div>
                                  </details>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center mx-auto mb-3">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#496660]">
                                    <path d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.441.383 2.792 1.054 3.963L3 20l4.3-.947z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <p className="text-[12px] text-[#496660] font-medium">No detailed data available for this log</p>
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
            <div className="flex items-center justify-between w-full">
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
              
              {/* Share Button - only show when viewing existing trouble */}
              {selectedTrouble && (
                <div className="flex items-center gap-2">
                              <button
              onClick={handleShareClick}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                shareSettings.isShared 
                  ? 'bg-[#496660] hover:bg-[#5a7670] text-white' 
                  : 'bg-[#E9ECEF] hover:bg-[#DEE2E6] text-[#6C757D]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M7 11l5-5m0 0l5 5m-5-5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {shareSettings.isShared ? 'SHARED' : 'PRIVATE'}
            </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#DC3545] hover:bg-[#C82333] text-white rounded-md transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#F0F4F8]">
            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-auto p-6 space-y-6 min-h-0">
              {chatHistory.map((chat, index) => (
                <div key={index} className="space-y-3">
                  {chat.type === 'user' && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-[14px] font-pretendard text-gray-800">{chat.message}</p>
                    </div>
                  )}
                  {chat.type === 'assistant' && (
                    <div className="space-y-3">
                      {chat.message === 'LOADING_PLACEHOLDER' ? (
                        <div className="bg-[#F8F9FA] rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-[#1E435F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-[#1E435F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-[#1E435F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          <div className="text-[14px] font-pretendard text-gray-800 leading-relaxed prose prose-sm max-w-none">
                            <ReactMarkdown>{chat.message}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 하단 입력 영역 */}
            <div className="px-[30px] pb-6">
              {/* 선택된 로그 태그들 */}
              {selectedLogs.size > 0 && !troubleSent && (
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
              {!troubleSent ? (
                <div className="relative">
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder={isSending ? "AI is analyzing..." : selectedLogs.size > 0 ? "Ask about the selected logs..." : "Send a message"}
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
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <span className="text-[12px] text-gray-500 font-pretendard">Analysis completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 복사 알림 */}
      {copyNotification && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1E435F] text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm opacity-0 animate-fade-in">
          {copyNotification}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            0% {
              opacity: 0;
              transform: translate(-50%, 20px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `
      }} />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && setShowShareModal(false)}>
          <div className="bg-white rounded-[10px] p-6 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[clamp(16px,1.11vw,18px)] font-[600] text-[#000000] font-pretendard">Share to Teamboard</h3>
              <button
                onClick={async () => {
                  await handleShareSettingsUpdate();
                  setShowShareModal(false);
                }}
                className="px-4 py-2.5 bg-[#496660] hover:bg-[#5a7670] text-white rounded-[8px] transition-colors text-[14px] font-pretendard font-medium shadow-sm"
              >
                Save
              </button>
            </div>

            <div className="space-y-6">
              {/* Privacy Toggle - Moved to top for better UX */}
              <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[12px] border border-[#E9ECEF]">
                <div>
                  <h4 className="font-medium text-[#000000] text-[14px] font-pretendard">Share to Teamboard</h4>
                  <p className="text-[12px] text-[#6C757D] font-pretendard mt-1">
                    {isShared ? 'Shared with team' : 'Private to you only'}
                  </p>
                </div>
                <button
                  onClick={() => setIsShared(!isShared)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isShared ? 'bg-[#496660]' : 'bg-[#DEE2E6]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      isShared ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Info message */}
              <div className="p-4 bg-[#F8F9FA] rounded-[8px] border border-[#E9ECEF]">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#496660]">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[12px] text-[#6C757D] font-pretendard">
                    {isShared ? 'This trouble will be shared with your team members.' : 'This trouble is private and only visible to you.'}
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="bg-white rounded-[10px] p-6 w-[400px] max-w-[90vw] shadow-xl border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[clamp(16px,1.11vw,18px)] font-[600] text-[#000000] font-pretendard">Delete Trouble</h3>
                <p className="text-[12px] text-[#6C757D] font-pretendard mt-1">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[14px] text-[#000000] font-pretendard leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-[#1E435F]">"{selectedTrouble.trouble.report_name}"</span>?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-[#6C757D] bg-[#F8F9FA] hover:bg-[#E9ECEF] rounded-[8px] transition-colors text-[14px] font-pretendard border border-[#DEE2E6] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (selectedTrouble) {
                      await troubleService.deleteTrouble(selectedTrouble.trouble.id);
                      console.log('Trouble deleted successfully');
                      setShowDeleteModal(false);
                      // 모달 닫기 및 부모 컴포넌트에 알림
                      onClose();
                      if (onTroubleCreated) {
                        onTroubleCreated(selectedTrouble.trouble.id);
                      }
                    }
                  } catch (error) {
                    console.error('Failed to delete trouble:', error);
                    alert('Failed to delete trouble');
                  }
                }}
                className="px-4 py-2.5 bg-[#DC3545] hover:bg-[#C82333] text-white rounded-[8px] transition-colors text-[14px] font-pretendard font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogDetailModal; 