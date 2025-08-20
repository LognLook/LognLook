import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const UserProfilePage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({ id: '', name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage에서 사용자 정보 로드
    const loadUserInfo = () => {
      const storedUser = localStorage.getItem('user');
      const mockUser = localStorage.getItem('mockUser');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserInfo({
          id: user.username || user.id,
          name: user.name || user.username,
          email: user.email || `${user.username || user.id}@example.com`
        });
      } else if (mockUser) {
        const user = JSON.parse(mockUser);
        setUserInfo({
          id: user.id,
          name: user.name,
          email: user.email || `${user.id}@example.com`
        });
      } else {
        navigate('/');
      }
    };

    loadUserInfo();
  }, [navigate]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getJoinDate = (): string => {
    // 목업 데이터에서는 현재 날짜 기준으로 임의 설정
    const now = new Date();
    const joinDate = new Date(now.getFullYear(), now.getMonth() - 3, 15); // 3개월 전
    return joinDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View your profile information and account details</p>
        </div>

        <div className="space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* 헤더 배경 */}
            <div className="h-32 bg-gradient-to-r from-[#1E435F] to-[#496660]"></div>
            
            {/* 프로필 정보 */}
            <div className="relative px-6 pb-6">
              {/* 아바타 */}
              <div className="absolute -top-16 left-6">
                <div className="w-32 h-32 rounded-full bg-[#496660] border-4 border-white flex items-center justify-center text-white font-bold text-3xl">
                  {getInitials(userInfo.name)}
                </div>
              </div>

              {/* 편집 버튼 */}
              <div className="absolute top-4 right-6">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              {/* 사용자 정보 */}
              <div className="pt-20">
                <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
                <p className="text-gray-600 text-lg">@{userInfo.id}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-600">{userInfo.name}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">{userInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0v8a2 2 0 002 2h4a2 2 0 002-2V7m-8 0H4a2 2 0 00-2 2v8a2 2 0 002 2h4m4-5a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span className="text-gray-600">User ID: {userInfo.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* 계정 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0v8a2 2 0 002 2h4a2 2 0 002-2V7m-8 0H4a2 2 0 00-2 2v8a2 2 0 002 2h4m4-5a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span className="text-gray-600">Member since {getJoinDate()}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-gray-600">Account Status: Active</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span className="text-gray-600">Email Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 활동 통계 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Activity Overview</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">5</div>
                  <div className="text-gray-600">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">127</div>
                  <div className="text-gray-600">Logs Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">12</div>
                  <div className="text-gray-600">Issues Resolved</div>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Account Settings</div>
                    <div className="text-sm text-gray-500">Update your profile and security settings</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/home')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4m8-4v4" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">View Dashboard</div>
                    <div className="text-sm text-gray-500">Go to your main dashboard</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
