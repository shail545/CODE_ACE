import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

const InterviewDetails = () => {
  const { state } = useLocation();
  const interview = state?.interview;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card bg-base-100 shadow-lg max-w-md"
          >
            <div className="card-body text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold mt-4">No Interview Data Found</h2>
              <p className="py-4">The interview details you're looking for couldn't be found.</p>
              <div className="card-actions justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  Return to Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button 
            className="btn btn-ghost mb-6 gap-2"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Interviews
          </button>

          {/* Interview Summary Card */}
          <motion.div 
            className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-body">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="card-title text-2xl md:text-3xl">
                    Interview on {new Date(interview.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`badge ${interview.overallScore >= 7 ? 'badge-success' : interview.overallScore >= 4 ? 'badge-warning' : 'badge-error'} gap-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Overall Score: {interview.overallScore}/10
                    </div>
                    <div className="badge badge-outline gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {interview.feedback.length} Questions
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    New Interview
                  </motion.button>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stats bg-primary/10 text-primary">
                  <div className="stat">
                    <div className="stat-title">Technical Accuracy</div>
                    <div className="stat-value">
                      {(
                        interview.feedback.reduce((sum, item) => sum + item.technicalAccuracy, 0) / 
                        interview.feedback.length
                      ).toFixed(1)}
                    </div>
                    <div className="stat-desc">/10 average</div>
                  </div>
                </div>
                
                <div className="stats bg-secondary/10 text-secondary">
                  <div className="stat">
                    <div className="stat-title">Clarity</div>
                    <div className="stat-value">
                      {(
                        interview.feedback.reduce((sum, item) => sum + item.clarity, 0) / 
                        interview.feedback.length
                      ).toFixed(1)}
                    </div>
                    <div className="stat-desc">/10 average</div>
                  </div>
                </div>
                
                <div className="stats bg-accent/10 text-accent">
                  <div className="stat">
                    <div className="stat-title">Completeness</div>
                    <div className="stat-value">
                      {(
                        interview.feedback.reduce((sum, item) => sum + item.completeness, 0) / 
                        interview.feedback.length
                      ).toFixed(1)}
                    </div>
                    <div className="stat-desc">/10 average</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions List */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Questions & Feedback
            </h3>

            <AnimatePresence>
              {interview.feedback.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card bg-base-100/80 backdrop-blur-sm border border-base-300/20 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title text-xl">
                        Question {index + 1}
                      </h3>
                      <div className="flex gap-2">
                        <div className="badge badge-primary badge-outline">
                          Tech: {item.technicalAccuracy}/10
                        </div>
                        <div className="badge badge-secondary badge-outline">
                          Clarity: {item.clarity}/10
                        </div>
                        <div className="badge badge-accent badge-outline">
                          Complete: {item.completeness}/10
                        </div>
                      </div>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="space-y-4">
                      {/* Question */}
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Question
                        </h4>
                        <p className="mt-2 pl-7">{item.question}</p>
                      </div>

                      {/* Answer */}
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          Your Answer
                        </h4>
                        <div className="mt-2 pl-7 bg-base-200/50 p-4 rounded-lg">
                          <p>{item.answer || "No answer provided"}</p>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Feedback
                        </h4>
                        <div className="mt-2 pl-7 bg-base-200/50 p-4 rounded-lg">
                          <p>{item.detailedFeedback}</p>
                        </div>
                      </div>

                      {/* Suggested Improvement */}
                      {item.suggestedImprovement && (
                        <div>
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Suggested Improvement
                          </h4>
                          <div className="mt-2 pl-7 bg-base-200/50 p-4 rounded-lg">
                            <p>{item.suggestedImprovement}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewDetails;