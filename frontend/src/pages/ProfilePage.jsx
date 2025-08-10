import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { FiEdit } from 'react-icons/fi';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
    accuracy: 0,
    streak: 0,
  });
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Fetch profile photo
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user?._id) {
        try {
          const response = await axiosClient.post('/video/image/get', { id: user._id });
          if (response.data) {
            setProfilePhoto(response.data.secureUrl);
          }
        } catch (error) {
          console.error('Error fetching profile photo:', error);
        }
      }
    };
    fetchProfilePhoto();
  }, [user?._id]);

  // Format the createdAt date
  const formattedJoinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const fetchSolvedProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/problem/problemSolvedByUser');
      const problems = response.data;
      setSolvedProblems(problems);
      
      // Calculate stats
      const easyCount = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
      const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
      const hardCount = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;
      const correctCount = problems.filter(p => p.isCorrect).length;
      const accuracy = problems.length > 0 ? Math.round((correctCount / problems.length) * 100) : 0;
      
      setStats({
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
        total: problems.length,
        accuracy,
        streak: calculateStreak(problems),
      });
    } catch (error) {
      console.error('Error fetching solved problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.firstName.trim()) errors.firstName = 'First name is required';
    if (!profileForm.lastName.trim()) errors.lastName = 'Last name is required';
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axiosClient.put('/users/profile', profileForm);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setFormErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axiosClient.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.data?.message) {
        setFormErrors({ currentPassword: error.response.data.message });
      } else {
        alert('Failed to update password. Please try again.');
      }
    }
  };

  const togglePhotoModal = () => {
    setShowPhotoModal(!showPhotoModal);
  };

  const navigateToPhotoPage = (e) => {
    e.stopPropagation();
    navigate('/profile/photo');
  };

  useEffect(() => {
    if (user?._id) {
      fetchSolvedProblems();
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user?._id, user?.firstName, user?.lastName]);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      
      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={togglePhotoModal}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-base-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Profile Photo</h3>
                <button 
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={togglePhotoModal}
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-center">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="max-h-[70vh] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="bg-blue-500 rounded-full text-neutral-content h-64 w-64 flex items-center justify-center">
                    <span className="text-8xl">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={navigateToPhotoPage}
                >
                  <FiEdit className="mr-2" />
                  Change Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        {successMessage && (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="avatar flex flex-col placeholder mb-4 relative group">
              {profilePhoto ? (
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={togglePhotoModal}
                >
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="rounded-full object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <FiEdit className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                  </div>
                </div>
              ) : (
                <div 
                  className="bg-blue-500 rounded-full text-neutral-content h-32 w-32 cursor-pointer relative flex items-center justify-center"
                  onClick={togglePhotoModal}
                >
                  <span className="text-4xl flex justify-center items-center h-full">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-full">
                    <FiEdit className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                  </div>
                </div>
              )}
              <button 
                className="btn btn-ghost btn-sm mt-2 ml-[-1vw] text-primary"
                onClick={navigateToPhotoPage}
              >
                <FiEdit className="mr-1" />
                Change Photo
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-500 mb-2">{user?.emailId}</p>
              <div className="badge badge-primary">{user?.role}</div>
              <p className="text-sm text-gray-400 mt-2">
                Member since {formattedJoinDate}
              </p>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="flex-1 bg-base-200 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat place-items-center text-center">
                <div className="stat-title">Problems Solved</div>
                <div className="stat-value text-primary">{stats.total}</div>
                <div className="stat-desc text-xs">
                  <span className="text-success">{stats.easy} Easy</span>, 
                  <span className="text-warning"> {stats.medium} Medium</span>, 
                  <span className="text-error"> {stats.hard} Hard</span>
                </div>
              </div>
              <div className="stat place-items-center text-center">
                <div className="stat-title">Accuracy</div>
                <div className="stat-value">
                  {stats.accuracy}%
                </div>
                <div className="stat-desc mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="stat place-items-center text-center">
                <div className="stat-title">Current Streak</div>
                <div className="stat-value">
                  {stats.streak} {stats.streak > 0 && '🔥'}
                </div>
                <div className="stat-desc">
                  {stats.streak > 0 ? 'Keep it up!' : 'Start your streak!'}
                </div>
              </div>
              <div className="stat place-items-center text-center">
                <div className="stat-title">LeetCoins</div>
                <div className="stat-value">{user?.point || 0}</div>
                <div className="stat-desc">
                  {user?.point > 50 ? 'Gold Medal' : 'Keep solving!'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 mb-8">
          <button 
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={`tab ${activeTab === 'solutions' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('solutions')}
          >
            Solutions
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="bg-base-200 rounded-xl p-6 min-h-[400px]">
          {activeTab === 'overview' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/problem')}
                >
                  Solve More Problems
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : solvedProblems.length > 0 ? (
                <div className="space-y-4">
                  {solvedProblems.slice(0, 5).map((problem, index) => (
                    <div key={index} className="bg-base-100 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{problem.title}</h3>
                            <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Solved on: {new Date(problem.solvedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/problem/${problem._id}`)}
                          >
                            View Problem
                          </button>
                          {problem.solution && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => setActiveTab('solutions')}
                            >
                              View Solution
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">👋</div>
                  <p className="text-lg mb-4">No problems solved yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/problem')}
                  >
                    Start Practicing
                  </button>
                </div>
              )}
              
              {/* Problems Solved Chart */}
              {stats.total > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                  <div className="bg-base-100 p-4 rounded-lg">
                    <div className="flex justify-between items-end h-40 gap-4">
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center h-full justify-end">
                          <div 
                            className="bg-success w-full rounded-t-sm" 
                            style={{ height: `${(stats.easy / Math.max(stats.easy + stats.medium + stats.hard, 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2">Easy: {stats.easy}</span>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center h-full justify-end">
                          <div 
                            className="bg-warning w-full rounded-t-sm" 
                            style={{ height: `${(stats.medium / Math.max(stats.easy + stats.medium + stats.hard, 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2">Medium: {stats.medium}</span>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center h-full justify-end">
                          <div 
                            className="bg-error w-full rounded-t-sm" 
                            style={{ height: `${(stats.hard / Math.max(stats.easy + stats.medium + stats.hard, 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2">Hard: {stats.hard}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Activity Log</h2>
              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : solvedProblems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th>Difficulty</th>
                        <th>Date Solved</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solvedProblems.map((problem, index) => (
                        <tr key={index}>
                          <td>
                            <div className="flex items-center gap-2">
                              {problem.title}
                              {problem.isCorrect && (
                                <span className="badge badge-success badge-xs">Solved</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td>{new Date(problem.solvedAt).toLocaleString()}</td>
                          <td>
                            {problem.isCorrect ? (
                              <span className="text-success">Accepted</span>
                            ) : (
                              <span className="text-error">Attempted</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-xs btn-outline"
                              onClick={() => navigate(`/problem/${problem._id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-lg mb-4">No activity yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/problem')}
                  >
                    Start Solving Problems
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'solutions' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Your Solutions</h2>
              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : solvedProblems.length > 0 ? (
                <div className="space-y-6">
                  {solvedProblems.filter(p => p.solution).map((problem, index) => (
                    <div key={index} className="bg-base-100 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg">{problem.title}</h3>
                          <p className="text-sm text-gray-500">
                            <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="ml-2">
                              Solved on: {new Date(problem.solvedAt).toLocaleString()}
                            </span>
                          </p>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/problem/${problem._id}`)}
                        >
                          View Problem
                        </button>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Your Solution:</h4>
                          <div className="badge badge-neutral">
                            {problem.language || 'JavaScript'}
                          </div>
                        </div>
                        <div className="bg-neutral p-4 rounded-lg overflow-x-auto">
                          <pre className="whitespace-pre-wrap">
                            <code>{problem.solution}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  {solvedProblems.filter(p => !p.solution).length > 0 && (
                    <div className="alert alert-info">
                      <div>
                        <span>You have {solvedProblems.filter(p => !p.solution).length} solved problems without saved solutions.</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">💻</div>
                  <p className="text-lg mb-4">No solutions submitted yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/problem')}
                  >
                    Start Coding
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              <div className="bg-base-100 p-6 rounded-lg">
                <div className="space-y-8">
                  {/* Profile Information Section */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Profile Information</h3>
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">First Name</span>
                          </label>
                          <input 
                            type="text" 
                            name="firstName"
                            className={`input input-bordered w-full ${formErrors.firstName ? 'input-error' : ''}`} 
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                          />
                          {formErrors.firstName && (
                            <label className="label">
                              <span className="label-text-alt text-error">{formErrors.firstName}</span>
                            </label>
                          )}
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Last Name</span>
                          </label>
                          <input 
                            type="text" 
                            name="lastName"
                            className={`input input-bordered w-full ${formErrors.lastName ? 'input-error' : ''}`} 
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                          />
                          {formErrors.lastName && (
                            <label className="label">
                              <span className="label-text-alt text-error">{formErrors.lastName}</span>
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="form-control mb-4">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input 
                          type="email" 
                          className="input input-bordered w-full" 
                          value={user?.emailId} 
                          disabled
                        />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">
                          Update Profile
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="divider"></div>
                  
                  {/* Change Password Section */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="space-y-4 mb-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Current Password</span>
                          </label>
                          <input 
                            type="password" 
                            name="currentPassword"
                            className={`input input-bordered w-full ${formErrors.currentPassword ? 'input-error' : ''}`} 
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                          />
                          {formErrors.currentPassword && (
                            <label className="label">
                              <span className="label-text-alt text-error">{formErrors.currentPassword}</span>
                            </label>
                          )}
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">New Password</span>
                          </label>
                          <input 
                            type="password" 
                            name="newPassword"
                            className={`input input-bordered w-full ${formErrors.newPassword ? 'input-error' : ''}`} 
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                          />
                          {formErrors.newPassword && (
                            <label className="label">
                              <span className="label-text-alt text-error">{formErrors.newPassword}</span>
                            </label>
                          )}
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Confirm New Password</span>
                          </label>
                          <input 
                            type="password" 
                            name="confirmPassword"
                            className={`input input-bordered w-full ${formErrors.confirmPassword ? 'input-error' : ''}`} 
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                          {formErrors.confirmPassword && (
                            <label className="label">
                              <span className="label-text-alt text-error">{formErrors.confirmPassword}</span>
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for difficulty badges
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

// Helper function to calculate current streak
const calculateStreak = (solvedProblems) => {
  if (!solvedProblems?.length) return 0;
  
  // Sort by date (newest first)
  const sorted = [...solvedProblems].sort((a, b) => 
    new Date(b.solvedAt) - new Date(a.solvedAt));
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check if the most recent problem was solved today or yesterday
  const lastSolvedDate = new Date(sorted[0].solvedAt);
  const diffDays = Math.floor((currentDate - lastSolvedDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) return 0; // No streak if gap more than 1 day
  
  // Count consecutive days
  for (let i = 0; i < sorted.length; i++) {
    const problemDate = new Date(sorted[i].solvedAt);
    if (i === 0) {
      streak = 1;
      currentDate = problemDate;
    } else {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      if (problemDate.toDateString() === prevDate.toDateString()) {
        streak++;
        currentDate = problemDate;
      } else {
        break;
      }
    }
  }
  
  return streak;
};

export default ProfilePage;