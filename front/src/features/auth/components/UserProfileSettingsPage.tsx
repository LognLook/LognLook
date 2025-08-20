import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/icons/logo.png';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  timezone?: string;
  language?: string;
}


const UserProfileSettingsPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({ 
    id: '', 
    name: '', 
    email: '',
    role: 'Admin',
    timezone: 'UTC',
    language: 'English'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<UserInfo>({ 
    id: '', 
    name: '', 
    email: '',
    role: 'Admin',
    timezone: 'UTC',
    language: 'English'
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile');
  
  const navigate = useNavigate();



  const { user: authUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to login page if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Load user info from API
    const loadUserInfo = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const info = {
          id: currentUser.id.toString(),
          name: currentUser.username,
          email: (currentUser as any).email || `${currentUser.username}@example.com`,
          role: (currentUser as any).role || 'Admin',
          timezone: (currentUser as any).timezone || 'UTC',
          language: (currentUser as any).language || 'English'
        };
        setUserInfo(info);
        setEditedInfo(info);
      } catch (error) {
        console.error('Failed to load user info:', error);
        // Use authStore user info on API failure
        if (authUser) {
          const info = {
            id: authUser.id.toString(),
            name: authUser.username,
            email: authUser.email || `${authUser.username}@example.com`,
            role: (authUser as any).role || 'Admin',
            timezone: (authUser as any).timezone || 'UTC',
            language: (authUser as any).language || 'English'
          };
          setUserInfo(info);
          setEditedInfo(info);
        } else {
          navigate('/');
        }
      }
    };

    loadUserInfo();
  }, [navigate, isAuthenticated, authUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Revert to original info on cancel
      setEditedInfo(userInfo);
    }
    setIsEditing(!isEditing);
    setSaveMessage('');
  };

  const handleSaveProfile = () => {
    // Update mock data (needs modification for actual API connection)
    const storedUser = localStorage.getItem('user');
    const mockUser = localStorage.getItem('mockUser');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        name: editedInfo.name,
        email: editedInfo.email,
        role: editedInfo.role,
        timezone: editedInfo.timezone,
        language: editedInfo.language
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else if (mockUser) {
      const user = JSON.parse(mockUser);
      const updatedUser = {
        ...user,
        name: editedInfo.name,
        email: editedInfo.email,
        role: editedInfo.role,
        timezone: editedInfo.timezone,
        language: editedInfo.language
      };
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    }

    setUserInfo(editedInfo);
    setIsEditing(false);
    setSaveMessage('Profile updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="LognLook Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'preferences', label: 'Preferences', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#496660] text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                saveMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {saveMessage}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-[#496660] text-white rounded-lg hover:bg-[#5a7670] transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-[#496660] text-white rounded-lg hover:bg-[#5a7670] transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editedInfo.name}
                        onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660] ${
                          isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660] ${
                          isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={editedInfo.timezone}
                        onChange={(e) => setEditedInfo({ ...editedInfo, timezone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660] ${
                          isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Asia/Seoul">Korea Standard Time</option>
                        <option value="Asia/Tokyo">Japan Standard Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={editedInfo.language}
                        onChange={(e) => setEditedInfo({ ...editedInfo, language: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660] ${
                          isEditing ? 'bg-white' : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        <option value="English">English</option>
                        <option value="Korean">한국어</option>
                        <option value="Japanese">日本語</option>
                        <option value="Chinese">中文</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Role Management Section - Admin Only */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Role Management</h3>
                    <p className="text-sm text-gray-600 mb-4">Only administrators can modify user roles.</p>
                    <div className="max-w-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                      <select
                        value={editedInfo.role}
                        onChange={(e) => {
                          if (userInfo.role === 'Admin') {
                            setEditedInfo({ ...editedInfo, role: e.target.value });
                          } else {
                            // TODO: Replace with proper toast notification
                            alert('This feature will be available soon!');
                          }
                        }}
                        disabled={userInfo.role !== 'Admin'}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-[#496660] ${
                          userInfo.role === 'Admin' ? 'bg-white' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                      {userInfo.role !== 'Admin' && (
                        <p className="text-xs text-gray-500 mt-1">Contact an administrator to change your role</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                </div>
                
                <div className="px-6 py-6">
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-5h5v5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        This feature will be available soon! We're working on implementing comprehensive notification settings for your account.
                      </p>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Account Preferences</h2>
                </div>
                
                <div className="px-6 py-6">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Account Activity</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Last login: {new Date().toLocaleDateString()}</p>
                        <p>Account created: {new Date().toLocaleDateString()}</p>
                        <p>Last password change: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-red-500 mb-4">Danger Zone</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-25 border border-red-100 rounded-lg">
                          <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
                          <p className="text-red-500 mb-3">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={() => {
                              // TODO: Replace with proper toast notification
                              alert('This feature will be available soon!');
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>

                        <div className="p-4 bg-amber-25 border border-amber-100 rounded-lg">
                          <h4 className="font-medium text-amber-600 mb-2">Export Data</h4>
                          <p className="text-amber-500 mb-3">
                            Download all your data before deleting your account.
                          </p>
                          <button
                            onClick={() => {
                              // TODO: Replace with proper toast notification
                              alert('This feature will be available soon!');
                            }}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettingsPage;
