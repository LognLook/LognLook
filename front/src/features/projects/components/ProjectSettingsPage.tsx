import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../../store/projectStore';
import { projectService } from '../../../services/projectService';

interface ProjectSettingsPageProps {
  isSidebarOpen: boolean;
}

type TabType = 'general' | 'keywords';

const ProjectSettingsPage: React.FC<ProjectSettingsPageProps> = ({ isSidebarOpen }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { selectedProject } = useProjectStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: selectedProject?.name || '',
    description: selectedProject?.description || ''
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    if (!selectedProject) {
      navigate('/home');
      return;
    }
    
    setFormData({
      name: selectedProject.name,
      description: selectedProject.description
    });
    
    loadProjectKeywords();
    loadProjectInviteCode();
  }, [selectedProject, navigate]);

  const loadProjectKeywords = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const keywordsData = await projectService.getProjectKeywords(selectedProject.id);
      setKeywords(keywordsData);
    } catch (err) {
      setError('Failed to load project keywords');
      console.error('Error loading keywords:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectInviteCode = async () => {
    if (!selectedProject) return;
    
    try {
      const response = await projectService.getProjectInviteCode(selectedProject.id);
      setInviteCode(response.invite_code);
    } catch (err) {
      console.error('Error loading invite code:', err);
      setInviteCode('Failed to load');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !selectedProject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newKeywords = [...keywords, newKeyword.trim()];
      const updatedKeywords = await projectService.updateProjectKeywords(selectedProject.id, newKeywords);
      setKeywords(updatedKeywords);
      setNewKeyword('');
      setSaveMessage('Keyword added successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError('Failed to add keyword');
      console.error('Error adding keyword:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKeyword = async (index: number) => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newKeywords = keywords.filter((_, i) => i !== index);
      const updatedKeywords = await projectService.updateProjectKeywords(selectedProject.id, newKeywords);
      setKeywords(updatedKeywords);
      setSaveMessage('Keyword removed successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError('Failed to remove keyword');
      console.error('Error removing keyword:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await projectService.updateProjectSettings(selectedProject.id, {
        name: formData.name,
        description: formData.description
      });
      
      setSaveMessage('Project settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError('Failed to save project settings');
      console.error('Error saving project settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'keywords', name: 'Keywords', icon: '🔑' }
  ];

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 mb-4">Please select a project to access its settings.</p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#496660] text-white rounded-lg hover:bg-[#5a7670] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F0F4F8] min-h-screen">
              {/* Content */}
        <div className="px-10 py-4">

        {/* Success/Error Messages */}
        {saveMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
            {saveMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  disabled={loading}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 ${
                    activeTab === tab.id
                      ? 'border-[#496660] text-[#496660]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#496660]"></div>
              </div>
            )}
            
            {!loading && (
              <>
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedProject.api_key || 'Not available'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-[1.25rem] bg-gray-50 text-gray-600"
                        />
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedProject.api_key || '')}
                          className="px-4 py-2 bg-[#496660] text-white rounded-[1.25rem] hover:bg-[#5a7670] transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invite Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inviteCode || 'Loading...'}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-[1.25rem] bg-gray-50 text-gray-600"
                        />
                        <button 
                          onClick={() => navigator.clipboard.writeText(inviteCode || '')}
                          disabled={!inviteCode || inviteCode === 'Loading...' || inviteCode === 'Failed to load'}
                          className="px-4 py-2 bg-[#496660] text-white rounded-[1.25rem] hover:bg-[#5a7670] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-[#496660] text-white rounded-[1.25rem] hover:bg-[#5a7670] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Project Keywords</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add keywords to help categorize and filter logs for this project.
                      </p>
                      
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Enter keyword..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-[#496660] focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        />
                        <button
                          onClick={handleAddKeyword}
                          disabled={loading || !newKeyword.trim()}
                          className="px-4 py-2 bg-[#496660] text-white rounded-[1.25rem] hover:bg-[#5a7670] transition-colors disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {keywords.map((keyword, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-[1.25rem]">
                            <div>
                              <span className="font-medium text-gray-900">{keyword}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveKeyword(index)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {keywords.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No keywords added yet.</p>
                            <p className="text-sm">Add keywords to help organize your logs.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;