import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DisplayLogItem, CHART_COLORS, LogLevel } from '../../../types/logs';
import LogDetailModal from '../components/LogDetailModal';
import { logService, LogEntry, LogSearchParams } from '../../../services/logService';
import { useProjects } from '../../../hooks/useProjects';

// SearchLogParams 타입 정의 - logService의 LogSearchParams와 일치
import { ExtendedApiLogDetailEntry } from '../../../types/ExtendedApiLogDetailEntry';

interface SearchPageProps {
  isSidebarOpen: boolean;
}

const SearchPage: React.FC<SearchPageProps> = ({ isSidebarOpen }) => {
  const location = useLocation();
  const { selectedProject } = useProjects();
  
  // 검색 폼 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [logLevel, setLogLevel] = useState<'error' | 'warning' | 'info' | 'debug' | 'critical' | 'custom' | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<LogEntry[]>([]);
  const [displayedCount, setDisplayedCount] = useState(10); // 현재 표시된 결과 수
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false); // 더 이상 로드할 데이터가 없음을 표시

  // 모달 상태
  const [selectedLog, setSelectedLog] = useState<DisplayLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<ExtendedApiLogDetailEntry[] | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 체크박스 선택 상태
  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());

  // 정렬 상태
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 검색어 추출 및 자동 검색
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('query');
    
    if (queryParam && queryParam.trim()) {
      setSearchQuery(queryParam.trim());
      // 자동으로 검색 실행
      performSearch(queryParam.trim());
    }
  }, [location.search]);

  // 사이드바 상태에 따른 너비 계산
  const getWidthClass = () => {
    return isSidebarOpen ? 'w-[74.93vw]' : 'w-[87.64vw]';
  };

  // 더 많은 결과 로드
  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || !hasSearched || displayedCount >= searchResults.length || hasReachedEnd || !selectedProject) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const newDisplayedCount = Math.min(displayedCount + 10, searchResults.length);
      
      // If we need more data from the server
      if (newDisplayedCount >= searchResults.length && searchResults.length > 0) {
        const searchParams: LogSearchParams = {
          query: searchQuery.trim(),
          keyword: keyword.trim() || undefined,
          logLevel: logLevel || 'info', // 기본값으로 'info' 설정
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          k: searchResults.length + 50, // 적절한 증가량으로 조정
        };

        const response = await logService.searchLogs(selectedProject.id, searchParams);
        const results = response.logs;
        
        // Check if we got new results
        if (results.length > searchResults.length) {
          setSearchResults(results);
          setDisplayedCount(newDisplayedCount);
        } else {
          // No more results available from server
          setHasReachedEnd(true);
        }
      } else {
        setDisplayedCount(newDisplayedCount);
      }
    } catch (error) {
      console.error('Failed to load more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasSearched, displayedCount, searchResults.length, searchQuery, keyword, logLevel, startTime, endTime, hasReachedEnd, selectedProject]);

  // Intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreResults, isLoadingMore]);

  // 검색 실행 (매개변수로 쿼리를 받을 수 있음)
  const performSearch = async (query?: string) => {
    if (!selectedProject) {
      setSearchError('No project selected');
      return;
    }

    const searchQueryToUse = query || searchQuery;
    
    if (!searchQueryToUse.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setDisplayedCount(10);
    setHasReachedEnd(false);

    try {
      const searchParams: LogSearchParams = {
        query: searchQueryToUse.trim(),
        keyword: keyword.trim() || undefined,
        logLevel: logLevel || 'info', // 기본값으로 'info' 설정
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        k: 100, // 백엔드에서 안전하게 처리할 수 있는 값으로 조정
      };
      
      const response = await logService.searchLogs(selectedProject.id, searchParams);
      const results = response.logs;
      
      setSearchResults(results);
      setSelectedLogs(new Set()); // 검색 시 선택 초기화
      
      // If we got less than requested, we've reached the end
      if (results.length < searchParams.k) {
        setHasReachedEnd(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 실행 (버튼 클릭용)
  const handleSearch = async () => {
    await performSearch();
  };

  // 엔터 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 결과를 DisplayLogItem으로 변환
  const convertToDisplayLog = (searchLog: LogEntry): DisplayLogItem => {
    // log_level을 LogLevel 타입으로 매핑
    const levelMapping: Record<string, LogLevel> = {
      'INFO': 'INFO',
      'WARN': 'WARN', 
      'WARNING': 'WARN',
      'ERROR': 'ERROR',
      'DEBUG': 'INFO', // DEBUG를 INFO로 매핑
      'CRITICAL': 'ERROR', // CRITICAL을 ERROR로 매핑
      'CUSTOM': 'INFO' // CUSTOM을 INFO로 매핑
    };

    // 로그 제목 결정 (우선순위: message > keyword와 함께 표시 > ID)
    let title = '';
    if (searchLog.message) {
      title = searchLog.message;
    } else if (searchLog.keyword) {
      title = `${searchLog.keyword} - Log ${searchLog.id.substring(0, 8)}`;
    } else {
      title = `Search Result - ${searchLog.id.substring(0, 8)}`;
    }

    return {
      title: title,
      timestamp: new Date(searchLog.message_timestamp).toLocaleString(),
      level: levelMapping[searchLog.log_level] || 'INFO',
      category: searchLog.keyword || 'Search Result',
      comment: searchLog.id,
      host: searchLog.host_name || 'Unknown Host'
    };
  };

  // 정렬된 검색 결과 (표시할 개수만큼만)
  const sortedResults = searchResults
    .slice(0, displayedCount)
    .map(convertToDisplayLog)
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // 디버깅: 정렬된 결과 상태 로그
  // console.log('📋 Display state:', {
  //   totalSearchResults: searchResults.length,
  //   displayedCount: displayedCount,
  //   sortedResultsCount: sortedResults.length,
  //   hasMoreResults: displayedCount < searchResults.length
  // });

  // 로그 클릭 핸들러
  const handleLogClick = async (index: number) => {
    if (!selectedProject) return;

    const clickedLog = sortedResults[index];
    
    setSelectedLog(clickedLog);
    setIsModalOpen(true);
    
    const logId = clickedLog.comment || "";
    
    if (!logId) {
      console.warn('No log ID found');
      return;
    }
    
    try {
      setDetailLoading(true);
      const detailData = await logService.getLogDetail(selectedProject.id, logId);
      
      console.log('🔍 Raw detail data from server:', detailData);
      
      // API 응답을 ExtendedApiLogDetailEntry[] 타입으로 변환
      const convertedDetailData = detailData.map((log: any) => {
        console.log('🔍 Converting individual log item:', log);
        
        return {
          _id: log._id,
          _index: log._index,
          _score: log._score,
          _source: log._source
        };
      });
      
      console.log('✅ Converted detail data:', convertedDetailData);
      
      if (convertedDetailData.length > 0) {
        setSelectedLogDetail(convertedDetailData);
      } else {
        setSelectedLogDetail(null);
      }
    } catch (error) {
      console.error('Failed to fetch log detail:', error);
      setSelectedLogDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
    setSelectedLogDetail(null);
  };

  // 체크박스 변경
  const handleCheckboxChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSelectedLogs = new Set(selectedLogs);
    if (event.target.checked) {
      newSelectedLogs.add(index);
    } else {
      newSelectedLogs.delete(index);
    }
    setSelectedLogs(newSelectedLogs);
  };

  // 시간 정렬 토글
  const handleTimeSortToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // 폼 초기화
  const handleReset = () => {
    setSearchQuery('');
    setKeyword('');
    setLogLevel('');
    setStartTime('');
    setEndTime('');
    setSearchResults([]);
    setDisplayedCount(10);
    setSearchError(null);
    setHasSearched(false);
    setSelectedLogs(new Set());
    setHasReachedEnd(false);
  };

  // 더 보기 가능 여부
  const hasMoreResults = displayedCount < searchResults.length && !hasReachedEnd;

  // 프로젝트가 선택되지 않은 경우
  if (!selectedProject) {
    return (
      <div className={`${getWidthClass()} flex flex-col gap-6 pt-8`}>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-center text-gray-500">
            Please select a project to search logs.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getWidthClass()} flex flex-col gap-6 pt-8`}>
      {/* 검색 폼 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          {/* 메인 검색 쿼리 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[clamp(12px,0.83vw,14px)] font-medium text-gray-700 mb-2">
                Search Query *
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search terms..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E435F] focus:border-[#1E435F] text-[clamp(12px,0.83vw,14px)]"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2 bg-[#1E435F] text-white rounded-md hover:bg-[#1E435F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-[clamp(12px,0.83vw,14px)] font-medium"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-[clamp(12px,0.83vw,14px)] font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {/* 필터 옵션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 키워드 */}
            <div>
              <label className="block text-[clamp(11px,0.76vw,12px)] font-medium text-gray-700 mb-1">
                Keyword
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Optional keyword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E435F] focus:border-[#1E435F] text-[clamp(11px,0.76vw,12px)]"
              />
            </div>

            {/* 로그 레벨 */}
            <div>
              <label className="block text-[clamp(11px,0.76vw,12px)] font-medium text-gray-700 mb-1">
                Log Level
              </label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value as 'error' | 'warning' | 'info' | 'debug' | 'critical' | 'custom' | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E435F] focus:border-[#1E435F] text-[clamp(11px,0.76vw,12px)]"
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
                <option value="critical">Critical</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* 시작 시간 */}
            <div>
              <label className="block text-[clamp(11px,0.76vw,12px)] font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E435F] focus:border-[#1E435F] text-[clamp(11px,0.76vw,12px)]"
              />
            </div>

            {/* 종료 시간 */}
            <div>
              <label className="block text-[clamp(11px,0.76vw,12px)] font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1E435F] focus:border-[#1E435F] text-[clamp(11px,0.76vw,12px)]"
              />
            </div>
          </div>
        </div>

        {/* 검색 에러 표시 */}
        {searchError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-[clamp(12px,0.83vw,14px)]">{searchError}</p>
          </div>
        )}
      </div>

      {/* 자연어 검색 가이드라인 */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-[#1E435F] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[clamp(13px,0.9vw,15px)] font-semibold text-[#1E435F] mb-2">
              💡 How to search with natural language
            </h3>
            <p className="text-[clamp(11px,0.8vw,13px)] text-gray-600 mb-3">
              Use natural language to find logs easily. Try these examples or create your own queries:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Show me error logs from yesterday",
                "Find authentication failures",
                "API timeout errors in the last hour",
                "Database connection issues", 
                "Login attempts with warning level",
                "Server crashes in production"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(example);
                    performSearch(example);
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-[#D1D5DB] rounded-full text-[clamp(10px,0.75vw,12px)] text-gray-700 hover:bg-[#F3F4F6] hover:border-[#9CA3AF] transition-colors cursor-pointer"
                >
                  <span className="mr-1">🔍</span>
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* 결과 헤더 */}
        {hasSearched && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-[clamp(16px,1.11vw,18px)] font-semibold font-pretendard text-[#000000]">
                Search Results
              </h2>
              <div className="text-sm text-gray-500">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {isSearching && (
          <div className="p-8 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-gray-600 text-[clamp(12px,0.83vw,14px)]">Searching logs...</span>
            </div>
          </div>
        )}

        {/* 검색 결과가 없는 경우 */}
        {hasSearched && !isSearching && sortedResults.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-[clamp(14px,0.97vw,16px)] font-medium mb-2">
              No results found
            </div>
            <div className="text-gray-400 text-[clamp(12px,0.83vw,14px)]">
              Try adjusting your search terms or filters
            </div>
          </div>
        )}

        {/* 검색 결과 테이블 */}
        {sortedResults.length > 0 && !isSearching && (
          <div className="p-4">
            <div className="overflow-hidden">
              {/* 헤더 */}
              <div className="bg-[#F1F1F5] px-5 h-[5.2vh] flex items-center text-[clamp(11px,0.83vw,12px)] font-[600] font-pretendard text-[#505050] rounded-[10px] leading-[1.2]">
                <div className="flex-1 pl-4 text-left">Logs</div>
                <div className="w-[157px] pl-4 text-center">Host name</div>
                <div className="w-[175px] pl-4 text-center">
                  <button 
                    onClick={handleTimeSortToggle}
                    className="flex items-center justify-center gap-1 hover:text-[#1E435F] transition-colors cursor-pointer w-full"
                    title={`Sort by time (${sortOrder === 'desc' ? 'newest first' : 'oldest first'})`}
                  >
                    <span>Time</span>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className={`transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                    >
                      <path 
                        d="M7 14L12 9L17 14" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="w-[97px] pl-4 text-center">Type</div>
                <div className="w-[99px] pl-4 text-center">Feature</div>
                <div className="w-[99px] flex items-center justify-center"></div>
              </div>

              {/* 결과 목록 */}
              <div className="divide-y divide-gray-100">
                {sortedResults.map((log, index) => (
                  <div 
                    key={`${log.comment}-${index}`}
                    className="px-5 h-[5.2vh] hover:bg-[#EFFBF9] cursor-pointer flex items-center transition-colors"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('.checkbox-column')) {
                        handleLogClick(index);
                      }
                    }}
                  >
                    <div className="flex-1 pr-4 pl-4 flex flex-col justify-center min-w-0">
                      <div className="text-xs text-gray-900 truncate" title={log.title}>
                        {log.title}
                      </div>
                    </div>
                    <div className="w-[157px] text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.host}</div>
                    <div className="w-[175px] text-xs text-gray-600 pl-4 flex items-center justify-center">{log.timestamp}</div>
                    <div className="w-[97px] pl-4 flex items-center justify-center">
                      <span 
                        className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ 
                          backgroundColor: CHART_COLORS[log.level as keyof typeof CHART_COLORS] 
                        }}
                      >
                        {log.level}
                      </span>
                    </div>
                    <div className="w-[99px] text-xs text-gray-600 truncate pl-4 flex items-center justify-center">{log.category}</div>
                    <div className="w-[99px] flex items-center justify-center checkbox-column">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded-[3px] border-[#E5E5EC] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1E435F]"
                        checked={selectedLogs.has(index)}
                        onChange={(e) => handleCheckboxChange(index, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger and load more indicator */}
              {(hasMoreResults || hasReachedEnd) && (
                <div ref={loadMoreRef} className="p-4 flex items-center justify-center">
                  {hasReachedEnd ? (
                    <div className="text-gray-500 text-[clamp(12px,0.83vw,14px)] font-medium">
                      No more logs to load
                    </div>
                  ) : isLoadingMore ? (
                    <div className="flex items-center gap-3">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                      <span className="text-gray-600 text-[clamp(12px,0.83vw,14px)]">Loading more...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMoreResults}
                      className="px-4 py-2 text-[#1E435F] border border-[#1E435F] rounded-md hover:bg-[#1E435F] hover:text-white transition-colors text-[clamp(12px,0.83vw,14px)] font-medium"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 로그 상세 모달 */}
      {selectedLog && (
        <LogDetailModal
          logs={selectedLogs.size > 0 
            ? Array.from(selectedLogs).map(index => sortedResults[index]).filter(Boolean)
            : [selectedLog]
          }
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          detailData={selectedLogDetail || undefined}
          isDetailLoading={detailLoading}
        />
      )}
    </div>
  );
};

export default SearchPage; 