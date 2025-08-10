import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import axiosClient from '../utils/axiosClient';

const InterviewResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  console.log(state);

  if (!state) {
    return (
      <div className="min-h-screen bg-base-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">No Interview Data Found</h1>
          <p>Please complete the interview first.</p>
        </div>
      </div>
    );
  }

  const handleGenerateFeedback = async () => {
    setIsGeneratingFeedback(true);
    setFeedbackError(null);
     navigate('/');
    
    try {
      // Send the complete state object to the backend
      await axiosClient.post('/ai/feedback', state);
      
      // Navigate to home after successful submission
     
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedbackError(error.response?.data?.message || 'Failed to generate feedback');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const { questions = [], answers = [] } = state;

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Interview Results</h1>
        
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-base-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Question {index + 1}:</h3>
              <p className="mb-4">{question}</p>
              
              <h3 className="text-lg font-semibold mb-2">Your Answer:</h3>
              <div className="bg-base-100 p-4 rounded">
                {answers[index] || <span className="opacity-50">No answer provided</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => window.print()} 
            className="btn btn-primary"
          >
            Print Results
          </button>
          
          <button 
            onClick={handleGenerateFeedback} 
            className="btn btn-secondary"
            disabled={isGeneratingFeedback}
          >
            {isGeneratingFeedback ? (
              <>
                <span className="loading loading-spinner"></span>
                Generating Feedback...
              </>
            ) : (
              'Generate Feedback'
            )}
          </button>
        </div>

        {feedbackError && (
          <div className="mt-4 alert alert-error">
            {feedbackError}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResults;