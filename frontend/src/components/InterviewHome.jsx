import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import axiosClient from '../utils/axiosClient';

const InterviewHomepage = () => {
  const navigate = useNavigate();
  const [interviewData, setInterviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    technology: '',
    difficulty: 'medium',
    interviewType: 'technical',
    duration: '30'
  });

  const techOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'node', label: 'Node.js' },
    { value: 'dsa', label: 'Data Structures & Algorithms' },
    { value: 'system-design', label: 'System Design' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'badge-success' },
    { value: 'medium', label: 'Medium', color: 'badge-warning' },
    { value: 'hard', label: 'Hard', color: 'badge-error' }
  ];

  const interviewTypeOptions = [
    { value: 'technical', label: 'Technical', icon: '💻' },
    { value: 'behavioral', label: 'Behavioral', icon: '🗣️' },
    { value: 'mixed', label: 'Mixed', icon: '🔀' }
  ];

  const durationOptions = [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '60 min' }
  ];

  async function fetchFeedbackData() {
    try {
      setLoading(true);
      const response = await axiosClient.get('/ai/feedbackdata'); 
      setInterviewData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch interview data');
      console.error('Error fetching interview data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const userStats = {
    completedInterviews: interviewData.length || 0,
    averageScore: interviewData.length > 0 
      ? (interviewData.reduce((sum, interview) => sum + interview.overallScore, 0) / interviewData.length).toFixed(1)
      : 0,
    improvementAreas: calculateImprovementAreas()
  };

  function calculateImprovementAreas() {
    if (interviewData.length === 0) return ['Complete an interview to see areas'];
    
    const weakAreas = {};
    interviewData.forEach(interview => {
      interview.feedback?.forEach(fb => {
        if (fb.score < 5) {
          weakAreas[fb.topic] = (weakAreas[fb.topic] || 0) + 1;
        }
      });
    });
    
    return Object.entries(weakAreas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  const startQuickInterview = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/ins', { state: { formData } });
  };

  const viewInterviewDetails = (interview) => {
    navigate('/interview-details', { state: { interview } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="alert alert-error shadow-lg max-w-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Error loading data</h3>
              <div className="text-xs">{error}</div>
            </div>
            <button className="btn btn-sm btn-outline" onClick={fetchFeedbackData}>
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />
      
      {/* Interview Configuration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-base-100 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-base-300/30 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Configure Interview</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost btn-circle"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Technology Selection */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Technology Stack</span>
                  </label>
                  <select
                    name="technology"
                    value={formData.technology}
                    onChange={handleInputChange}
                    className="select select-bordered w-full bg-base-200"
                    required
                  >
                    <option value="" disabled>Select technology</option>
                    {techOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Difficulty</span>
                  </label>
                  <div className="flex gap-2">
                    {difficultyOptions.map((option) => (
                      <label key={option.value} className="flex-1">
                        <input
                          type="radio"
                          name="difficulty"
                          value={option.value}
                          checked={formData.difficulty === option.value}
                          onChange={handleInputChange}
                          className="peer hidden"
                        />
                        <div className={`btn w-full ${formData.difficulty === option.value ? option.color : 'btn-outline'}`}>
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interview Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Interview Type</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {interviewTypeOptions.map((option) => (
                      <label key={option.value} className="">
                        <input
                          type="radio"
                          name="interviewType"
                          value={option.value}
                          checked={formData.interviewType === option.value}
                          onChange={handleInputChange}
                          className="peer hidden"
                        />
                        <div className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.interviewType === option.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-base-300 hover:border-primary/30'
                        }`}>
                          <span className="text-2xl mb-1">{option.icon}</span>
                          <span className="text-sm">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Duration</span>
                  </label>
                  <div className="flex gap-2">
                    {durationOptions.map((option) => (
                      <label key={option.value} className="flex-1">
                        <input
                          type="radio"
                          name="duration"
                          value={option.value}
                          checked={formData.duration === option.value}
                          onChange={handleInputChange}
                          className="peer hidden"
                        />
                        <div className={`btn w-full ${
                          formData.duration === option.value ? 'btn-primary' : 'btn-outline'
                        }`}>
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="modal-action mt-8">
                  <button
                    type="submit"
                    className="btn btn-primary w-full rounded-full"
                    disabled={!formData.technology}
                  >
                    Start Interview
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">
                Master Technical Interviews
              </span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-content/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              AI-powered mock interviews with real-time feedback and performance analytics
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button 
                className="btn btn-accent btn-lg rounded-full px-8 shadow-lg"
                onClick={startQuickInterview}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start AI Interview
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
              
              <motion.button 
                className="btn btn-outline btn-lg rounded-full px-8 text-primary-content border-white hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule 1:1 Session
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" className="fill-base-100"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" className="fill-base-100"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-base-100"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Completed Interviews */}
          <motion.div 
            className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-md hover:shadow-lg transition-shadow"
            whileHover={{ y: -5 }}
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">Completed</h3>
                  <p className="text-3xl font-bold">{userStats.completedInterviews}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Average Score */}
          <motion.div 
            className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-md hover:shadow-lg transition-shadow"
            whileHover={{ y: -5 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">Avg. Score</h3>
                  <p className="text-3xl font-bold">{userStats.averageScore}<span className="text-lg text-base-content/70">/10</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Improvement Areas */}
          <motion.div 
            className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-md hover:shadow-lg transition-shadow"
            whileHover={{ y: -5 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="card-title text-lg">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userStats.improvementAreas.map((area, index) => (
                      <span key={index} className="badge badge-warning badge-outline">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Interview History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interview History
          </h2>

          {interviewData.length === 0 ? (
            <motion.div
              className="alert alert-info shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold">No interviews yet!</h3>
                <div className="text-xs">Complete your first interview to see your progress</div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {interviewData.map((interview, index) => (
                  <motion.div
                    key={interview._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => viewInterviewDetails(interview)}
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <h3 className="card-title">
                          {new Date(interview.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        <div className={`badge ${
                          interview.overallScore >= 7 ? 'badge-success' : 
                          interview.overallScore >= 4 ? 'badge-warning' : 'badge-error'
                        }`}>
                          {interview.overallScore}/10
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{interview.feedback?.length || 0} questions attempted</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-base-content/70">Performance</span>
                          <span className="font-medium">
                            {interview.overallScore >= 7 ? 'Excellent' : 
                             interview.overallScore >= 4 ? 'Good' : 'Needs Practice'}
                          </span>
                        </div>
                        <progress 
                          className="progress progress-primary w-full mt-1" 
                          value={interview.overallScore * 10} 
                          max="100"
                        ></progress>
                      </div>
                      
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-sm btn-ghost text-primary">
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewHomepage;