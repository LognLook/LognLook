import React, { useState, useEffect } from 'react';
import { troubleService, TroubleItem, TroubleDetail } from '../../../services/troubleService';
import { logService } from '../../../services/logService';

interface TeamBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trouble: any | null;
  onTroubleUpdated?: (troubleId: number) => void;
}

interface ShareSettings {
  isShared: boolean;
  teamboardTitle: string;
  teamboardDescription: string;
}

interface LogEntry {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  level: string;
}

const TeamBoardModal: React.FC<TeamBoardModalProps> = ({
  isOpen,
  onClose,
  trouble,
  onTroubleUpdated
}) => {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isShared: false,
    teamboardTitle: '',
    teamboardDescription: ''
  });
  const [isShared, setIsShared] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(false);
  const [troubleDetail, setTroubleDetail] = useState<TroubleDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Initialize values when modal opens
  useEffect(() => {
    if (trouble && isOpen) {
      // Set shared status based on trouble.is_shared
      const isSharedStatus = Boolean(trouble.is_shared);
      
      setShareSettings({
        isShared: isSharedStatus,
        teamboardTitle: trouble.report_name || '',
        teamboardDescription: trouble.content || trouble.description || '' 
      });
      setIsShared(isSharedStatus);
      
      loadTroubleDetail();
      loadLogs();
    }
  }, [trouble?.id, trouble?.is_shared, isOpen]);

  const loadTroubleDetail = async () => {
    if (!trouble) return;
    
    setIsLoadingDetail(true);
    try {
      const response = await troubleService.getTrouble(trouble.id);
      setTroubleDetail(response);
      
      if (response.trouble) {
        setShareSettings(prev => ({
          ...prev,
          teamboardDescription: response.trouble.content || ''
        }));
      }
    } catch (error) {
      console.error('Failed to load trouble detail:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadLogs = async () => {
    if (!trouble) return;
    
    setIsLoadingLogs(true);
    try {
      setLogs([
        {
          id: '1',
          title: 'Error occurred during login',
          message: 'User authentication failed with error code 401',
          timestamp: '2024-01-15T10:30:00Z',
          level: 'ERROR'
        },
        {
          id: '2',
          title: 'Database connection timeout',
          message: 'Connection to database timed out after 30 seconds',
          timestamp: '2024-01-15T10:29:00Z',
          level: 'WARN'
        }
      ]);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleShareSettingsUpdate = async () => {
    if (!trouble) return;

    // Validate required fields
    if (!shareSettings.teamboardTitle.trim()) {
      alert('Report name is required');
      return;
    }

    if (!shareSettings.teamboardDescription.trim()) {
      alert('Content is required');
      return;
    }

    if (!trouble.id || 
        typeof trouble.id !== 'number' || 
        isNaN(trouble.id) || 
        trouble.id <= 0 || 
        !Number.isInteger(trouble.id)) {
      console.error('Invalid trouble ID:', trouble.id, 'Type:', typeof trouble.id);
      alert(`Invalid trouble ID: ${trouble.id}. Please refresh and try again.`);
      return;
    }

    try {
      const updateData = {
        is_shared: isShared,
        report_name: shareSettings.teamboardTitle,
        content: shareSettings.teamboardDescription
      };

      await troubleService.updateTrouble(trouble.id, updateData);

      if (trouble) {
        trouble.is_shared = isShared;
      }
      
      if (onTroubleUpdated) {
        onTroubleUpdated(trouble.id);
      }

      setShowShareSettings(false);
    } catch (error) {
      console.error('Failed to update trouble:', error);
      alert('Failed to update trouble');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Helper function to get user initials from username
  const getUserInitials = (username: string | undefined): string => {
    if (!username || typeof username !== 'string') {
      return 'U';
    }
    
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isOpen || !trouble) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="w-[83.33vw] h-[81.84vh] bg-white rounded-[10px] flex">
        {/* Main Content - Logs List */}
        <div className="w-[48.61vw] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[clamp(17px,1.18vw,20px)] font-[600] font-pretendard text-[#000000]">
              Team Board - {trouble.report_name}
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
              {/* Trouble Content Header */}
              <div className="py-6 px-2">
                <div className="space-y-6">
                  {/* Title Section */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#1E435F] rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#B8FFF1]">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Report Title</h3>
                    </div>
                    <div className="text-[14px] text-[#1E435F] leading-relaxed font-medium">
                      {trouble.report_name}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#93CCC1] rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M8 12h8M8 8h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Troubleshooting Content</h3>
                    </div>
                    <div className="text-[12px] text-[#1E435F] leading-relaxed font-mono bg-[#F0F4F8] rounded-lg p-4 border border-[#E1E8ED]">
                      {isLoadingDetail ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-500 text-xs">Loading content...</span>
                        </div>
                      ) : troubleDetail?.trouble?.content ? (
                        troubleDetail.trouble.content
                      ) : (
                        'No content available'
                      )}
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#496660] rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Sharing Status</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-2 text-[12px] rounded-md font-medium ${
                        isShared 
                          ? 'bg-[#496660] text-white' 
                          : 'bg-[#E9ECEF] text-[#6C757D]'
                      }`}>
                        {isShared ? 'SHARED WITH TEAM' : 'PRIVATE'}
                      </span>
                      <span className="text-[12px] text-[#6C757D] font-pretendard">
                        {isShared ? 'Visible to all team members' : 'Only visible to you'}
                      </span>
                    </div>
                  </div>

                  {/* Creator Section */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-[#1E435F] rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-[13px] font-semibold text-[#1E435F]">Created By</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-sm">
                        {getUserInitials(trouble.creator_username)}
                      </div>
                      <span className="text-[14px] text-[#1E435F] font-medium">
                        {trouble.creator_username || 'Unknown User'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs List - Same structure as LogDetailModal */}
              {logs.map((log, index) => (
                <div key={log.id}>
                  {/* Log Main Line - Same as LogDetailModal */}
                  <div className="py-3 px-2 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
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
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white ${
                              log.level === 'ERROR' ? 'bg-[#FE9B7B]' :
                              log.level === 'WARN' ? 'bg-[#93CCC1]' :
                              'bg-[#496660]'
                            }`}>
                              {log.level}
                            </span>
                            <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Log Details - Same structure as LogDetailModal */}
                  <div className="py-6 px-2">
                    <div className="space-y-6 ml-7">
                      {/* Message Section - Same as LogDetailModal */}
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
                          {log.message}
                        </div>
                      </div>

                      {/* Basic Information Card - Same as LogDetailModal */}
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
                                log.level === 'ERROR' ? 'bg-[#FE9B7B]' :
                                log.level === 'WARN' ? 'bg-[#93CCC1]' :
                                'bg-[#496660]'
                              }`}>
                                {log.level}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <span className="text-[11px] font-medium text-[#496660] w-16 mt-1">Time:</span>
                              <span className="text-[11px] text-[#1E435F] font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Share Settings (Same structure as LogDetailModal's Chat Interface) */}
        <div className="w-[34.72vw] border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <h3 className="text-[clamp(14px,0.97vw,16px)] font-[600] font-pretendard text-[#000000]">
                  Share Settings
                </h3>
              </div>
              
              {/* Share Button - Same style as LogDetailModal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowShareSettings(!showShareSettings)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isShared 
                      ? 'bg-[#496660] hover:bg-[#5a7670] text-white' 
                      : 'bg-[#E9ECEF] hover:bg-[#DEE2E6] text-[#6C757D]'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M7 11l5-5m0 0l5 5m-5-5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isShared ? 'SHARED' : 'PRIVATE'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-[#F0F4F8]">
            <div className="flex-1 overflow-auto p-6 space-y-6 min-h-0">
              {showShareSettings ? (
                <div className="space-y-6">
                  {/* Required Fields */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#000000] mb-2 font-pretendard">
                      Report Name *
                    </label>
                    <input
                      type="text"
                      value={shareSettings.teamboardTitle}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, teamboardTitle: e.target.value }))}
                      placeholder="Enter report name"
                      className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#496660] focus:border-[#496660] text-[14px] font-pretendard transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#000000] mb-2 font-pretendard">
                      Content *
                    </label>
                    <textarea
                      value={shareSettings.teamboardDescription}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, teamboardDescription: e.target.value }))}
                      placeholder="Enter content description"
                      rows={4}
                      className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#496660] focus:border-[#496660] text-[14px] font-pretendard resize-none transition-colors"
                    />
                    {isLoadingDetail && (
                      <p className="text-xs text-gray-500 mt-1">Loading content from server...</p>
                    )}
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-[12px] border border-[#E9ECEF]">
                    <div>
                      <h4 className="font-medium text-[#000000] text-[14px] font-pretendard">Share to Teamboard</h4>
                      <p className="text-[12px] text-[#6C757D] font-pretendard mt-1">
                        {isShared ? 'Shared with team' : 'Private to you only'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newSharedState = !isShared;
                        setIsShared(newSharedState);
                        setShareSettings(prev => ({ ...prev, isShared: newSharedState }));
                      }}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowShareSettings(false)}
                      className="flex-1 px-4 py-2.5 text-[#6C757D] bg-[#F8F9FA] hover:bg-[#E9ECEF] rounded-[8px] transition-colors text-[14px] font-pretendard border border-[#DEE2E6] font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleShareSettingsUpdate}
                      className="flex-1 px-4 py-2.5 bg-[#496660] hover:bg-[#5a7670] text-white rounded-[8px] transition-colors text-[14px] font-pretendard font-medium shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[14px] text-[#6C757D] font-pretendard mb-4">
                    Click the button above to edit share settings
                  </p>
                  <div className="text-[12px] text-[#9CA3AF] font-pretendard">
                    <p>• Report Name: {trouble.report_name}</p>
                    <p>• Content: {isLoadingDetail ? 'Loading...' : (troubleDetail?.trouble?.content ? 'Available' : 'Not available')}</p>
                    <p>• Status: {trouble.is_shared ? 'Shared' : 'Private'}</p>
                    <p>• Creator: {trouble.creator_username || 'Unknown'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBoardModal;
