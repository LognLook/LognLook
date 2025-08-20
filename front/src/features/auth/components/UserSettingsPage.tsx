import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const UserSettingsPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({ id: '', name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UserInfo>({ id: '', name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // 비밀번호 유효성 검사 정규식
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

  useEffect(() => {
    // localStorage에서 사용자 정보 로드
    const loadUserInfo = () => {
      const storedUser = localStorage.getItem('user');
      const mockUser = localStorage.getItem('mockUser');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const info = {
          id: user.username || user.id,
          name: user.name || user.username,
          email: user.email || `${user.username || user.id}@example.com`
        };
        setUserInfo(info);
        setEditedInfo(info);
      } else if (mockUser) {
        const user = JSON.parse(mockUser);
        const info = {
          id: user.id,
          name: user.name,
          email: user.email || `${user.id}@example.com`
        };
        setUserInfo(info);
        setEditedInfo(info);
      } else {
        navigate('/');
      }
    };

    loadUserInfo();
  }, [navigate]);

  const handleEditToggle = () => {
    if (isEditing) {
      // 취소 시 원래 정보로 되돌리기
      setEditedInfo(userInfo);
    }
    setIsEditing(!isEditing);
    setSaveMessage('');
  };

  const handleSaveProfile = () => {
    // 목업 데이터 업데이트 (실제 API 연결 시 수정 필요)
    const storedUser = localStorage.getItem('user');
    const mockUser = localStorage.getItem('mockUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        name: editedInfo.name,
        email: editedInfo.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else if (mockUser) {
      const user = JSON.parse(mockUser);
      const updatedUser = {
        ...user,
        name: editedInfo.name,
        email: editedInfo.email
      };
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    }

    setUserInfo(editedInfo);
    setIsEditing(false);
    setSaveMessage('Profile updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    // 비밀번호 유효성 검사
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password must be 8-20 characters with uppercase, lowercase, number, and special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // 목업에서는 현재 비밀번호 검증 생략
    // 실제 구현에서는 현재 비밀번호 확인 필요

    // 비밀번호 변경 성공 메시지
    setSaveMessage('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* 성공 메시지 */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {saveMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* 프로필 정보 섹션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start space-x-6">
                {/* 아바타 */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-[#496660] flex items-center justify-center text-white font-medium text-xl">
                    {getInitials(userInfo.name)}
                  </div>
                </div>

                {/* 프로필 정보 */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input
                      type="text"
                      value={userInfo.id}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editedInfo.name}
                      onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editedInfo.email}
                      onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                        isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>

                  {/* 프로필 편집 버튼 */}
                  <div className="flex space-x-3">
                    {!isEditing ? (
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 비밀번호 변경 섹션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
            </div>
            <div className="px-6 py-4">
              {!showPasswordSection ? (
                <div>
                  <p className="text-gray-600 mb-4">Keep your account secure by using a strong password.</p>
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      8-20 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || !confirmPassword}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordSection(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 계정 관리 섹션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Activity</h3>
                  <p className="text-gray-600 mb-3">Last login: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-600 mb-3">Account created: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => alert('Account deletion feature coming soon!')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
