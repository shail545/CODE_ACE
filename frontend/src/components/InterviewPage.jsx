import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router';
import axiosClients from '../utils/axiosClient';

const InterviewPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const location = useLocation();
  const formData = location.state?.formData;

  // Load questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClients.post('/ai/question', formData);
        setQuestions(response.data.questions || []);
        setUserAnswers(Array(response.data.questions?.length || 0).fill(''));
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([
          "What does the 'C' stand for in CSS?",
          "Explain the concept of closures in JavaScript.",
          "What is the difference between HTTP and HTTPS?"
        ]);
        setUserAnswers(Array(3).fill(''));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentQuestionIndex] = transcript;
          return newAnswers;
        });
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentQuestionIndex]);

  // Auto-speak question when it changes
  useEffect(() => {
    if (!questions.length || !('speechSynthesis' in window)) return;

    const speakQuestion = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
      utterance.rate = 0.9;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsAiSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsAiSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    };

    speakQuestion();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentQuestionIndex, questions]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    navigate('/interview-results', {
      state: {
        questions,
        answers: userAnswers
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading questions...</h2>
          <p className="opacity-70">Please wait while we prepare your interview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100">
      {/* Left Panel - Questions */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        <div className="p-4 bg-base-200">
          <h2 className="text-xl font-semibold">Interview Questions</h2>
          <div className="text-sm opacity-70">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-base-200 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                {questions[currentQuestionIndex]}
              </h3>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
                    utterance.rate = 0.9;
                    utterance.onstart = () => {
                      setIsSpeaking(true);
                      setIsAiSpeaking(true);
                    };
                    utterance.onend = () => {
                      setIsSpeaking(false);
                      setIsAiSpeaking(false);
                    };
                    window.speechSynthesis.speak(utterance);
                  }}
                  className={`btn btn-sm ${isSpeaking ? 'btn-accent' : 'btn-primary'}`}
                >
                  <FaMicrophone />
                  {isSpeaking ? 'Speaking...' : 'Repeat Question'}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Your Answer:</h3>
              <div className="bg-base-100 p-4 rounded-lg min-h-24">
                {userAnswers[currentQuestionIndex] || (
                  <span className="opacity-50">Your answer will appear here...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-between">
          <button 
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn btn-outline btn-sm"
          >
            <FaArrowLeft /> Previous
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="btn btn-primary btn-sm"
            >
              Submit All Answers <FaCheck />
            </button>
          ) : (
            <button 
              onClick={nextQuestion}
              className="btn btn-outline btn-sm"
            >
              Next <FaArrowRight />
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - AI Animation and Mic */}
      <div className="w-1/2 flex flex-col bg-base-100">
        <div className="p-4 bg-base-200">
          <h2 className="text-xl font-semibold">Interview Assistant</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* AI Speaking Animation */}
          <div className="relative w-full max-w-md aspect-square mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* AI Face */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-primary rounded-t-full"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                    {/* Eyes */}
                    <div className="flex space-x-6">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Mouth Animation */}
                  {isAiSpeaking ? (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-white rounded-b-full animate-pulse"></div>
                  ) : (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sound Waves Animation */}
            {isAiSpeaking && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 bg-primary rounded-full"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animation: `pulse ${0.5 + i * 0.1}s infinite alternate`
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <button
              onClick={toggleListening}
              className={`btn btn-lg ${isListening ? 'btn-error' : 'btn-primary'}`}
            >
              <FaMicrophone size={20} />
              {isListening ? 'Stop Answering' : 'Start Answering'}
            </button>
            <div className="text-sm opacity-70">
              {isListening ? 'Listening... Speak your answer' : 'Click the microphone to answer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;