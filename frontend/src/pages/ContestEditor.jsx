import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import axiosClient2 from '../utils/axiosClient2';
import { useSelector } from 'react-redux';

const ContestEditor = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const [rateLimitMessage, setRateLimitMessage] = useState('');
  const editorRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [coinsToShow, setCoinsToShow] = useState(0);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  //  const [showModal, setShowModal] = useState(false);
  
  const { problem_id, contest_id } = useParams();
  const { handleSubmit } = useForm();

  const fetchProblem = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient2.post('/contest/getProblem', { problem_id });
      const initialCode = response.data?.startCode?.find((sc) => {
        if (sc.language === "C++" && selectedLanguage === 'cpp') return true;
        if (sc.language === "Java" && selectedLanguage === 'java') return true;
        if (sc.language === "Javascript" && selectedLanguage === 'javascript') return true;
        return false;
      })?.initialCode || '';
     
      setProblem(response.data);
      setCode(initialCode);
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  }, [problem_id, selectedLanguage]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem?.startCode?.find(sc => {
        if (sc.language === "C++" && selectedLanguage === 'cpp') return true;
        if (sc.language === "Java" && selectedLanguage === 'java') return true;
        if (sc.language === "Javascript" && selectedLanguage === 'javascript') return true;
        return false;
      })?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  // Coin counter animation
  useEffect(() => {
    if (earnedCoins > 0) {
      const duration = 1500;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = earnedCoins;
      
      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * (endValue - startValue) + startValue);
        setCoinsToShow(value);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [earnedCoins]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    if (!code || rateLimitTime > 0) return;
  
    setLoading(true);
    setRunResult(null);
    setRateLimitMessage('');
    
    try {
      const response = await axiosClient2.post(`/problem/runProblem/${problem_id}`, {
        contest_id,
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setActiveLeftTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      
      if (error.response?.data?.includes('wait')) {
        setRateLimitMessage(error.response.data);
        const waitTime = parseInt(error.response.data.match(/\d+/)?.[0] || '0', 10);
        setRateLimitTime(waitTime);
      } else {
        setRunResult({
          success: false,
          error: error.response?.data?.error || 'Internal server error'
        });
      }
      setActiveLeftTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code || rateLimitTime > 0) return;
    
    setLoading(true);
    setSubmitResult(null);
    setRateLimitMessage('');
    
    try {
      const response = await axiosClient2.post(`/problem/submitProblem/${problem_id}`, {
        contest_id,
        code: code,
        language: selectedLanguage
      });
      
      setSubmitResult(response.data);
      setActiveLeftTab('result');

      if (response.data?.val === 1) {
        setEarnedCoins(1);
        setShowSuccessPopup(true);
        
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        error: error.response?.data?.error || 'Submission failed'
      });
      setActiveLeftTab('result');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

// Replace your current timer useEffect hooks with this single one
useEffect(() => {
  const capitalizeDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
  const fetchContestData = async () => {
    try {
      const response = await axiosClient2.get('/problem/getContestData');
      const contests = response.data;

      // Find contest by URL param ID
      const currentContest = contests.find(c => c._id === contest_id);

      if (!currentContest) {
        console.error(`Contest with id ${contest_id} not found`);
        return;
      }

      if (!currentContest.contestDate || !currentContest.end) {
        console.error('Missing contestDate or end time:', currentContest);
        return;
      }


      // Capitalize month name
      const fixedDate = capitalizeDate(currentContest.contestDate); // "July 15 2025"
      const dateTimeString = `${fixedDate} ${currentContest.end}`; // "July 15 2025 08:50 PM"
      const endTime = new Date(dateTimeString);

      if (isNaN(endTime.getTime())) {
        console.error('Invalid end time:', dateTimeString);
        return;
      }

      const now = new Date();
      const diffInSeconds = Math.max(Math.floor((endTime - now) / 1000), 0);
      setTimeLeft(diffInSeconds);
    } catch (error) {
      console.error('Error fetching contest data:', error);
    }
  };

  fetchContestData();
}, [contest_id]);



  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShowTimeUpModal(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

// Remove the other useEffect that was managing the timer

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpConfirm = () => {
    setShowTimeUpModal(false);
    navigate('/contest');
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100 relative">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="absolute top-4 right-4 z-50">
          <div className="alert alert-success shadow-lg animate-bounce">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Success! Earned {coinsToShow} coin(s)</span>
            </div>
          </div>
        </div>
      )}

      {/* Time Up Modal */}
      {showTimeUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Time's Up!</h3>
            <p className="mb-6">The contest has ended. You will now be redirected to the contest page.</p>
            <div className="flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={handleTimeUpConfirm}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          {['description', 'result', 'testcase'].map((tab) => (
            <button 
              key={tab}
              className={`tab ${activeLeftTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </div>
                    {problem.tags && (
                      <div className="badge badge-primary">{problem.tags}</div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  {problem.visibleTestCases?.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                      <div className="space-y-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-base-200 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                            <div className="space-y-2 text-sm font-mono">
                              <div><strong>Input:</strong> {example.input}</div>
                              <div><strong>Output:</strong> {example.output}</div>
                              {example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'testcase' && (
                <div className="flex-1 overflow-y-auto bg-base-100">
                  <div className="mb-6">
                    <h1 className={`text-2xl font-bold mb-2 ${
                      runResult?.success ? 'text-success' : runResult ? 'text-error' : 'text-base-content'
                    }`}>
                      {runResult?.success ? 'Accepted' : runResult ? 'Wrong Answer' : 'Test Results'}
                    </h1>
                    
                    {runResult && (
                      <div className="flex items-center space-x-4 text-sm text-base-content opacity-80">
                        <div>
                          <span className="font-medium">Runtime:</span> <span className="font-mono">{runResult.runtime} sec</span>
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span> <span className="font-mono">{runResult.memory} KB</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {runResult?.testCases?.length > 0 && (
                      <>
                        <div>
                          <h4 className="font-medium text-base-content mb-3">Test Cases:</h4>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {runResult.testCases.map((tc, i) => (
                              <span 
                                key={i} 
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  tc.status_id === 3 
                                    ? 'bg-success/20 text-success border border-success/30' 
                                    : 'bg-error/20 text-error border border-error/30'
                                }`}
                              >
                                Case {i+1}
                              </span>
                            ))}
                          </div>
                        </div>

                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="space-y-4">
                            <div className="border-t border-base-300 pt-4">
                              <h4 className="font-medium text-base-content mb-3">Case {i+1}</h4>
                              
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-base-content/80 mb-2">Input</h5>
                                <pre className="bg-base-200 p-3 rounded text-sm font-mono text-base-content border border-base-300 whitespace-pre-wrap">
                                  {tc.stdin}
                                </pre>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-base-content/80 mb-2">Expected</h5>
                                  <pre className="bg-base-200 p-3 rounded text-sm font-mono text-base-content border border-base-300">
                                    {tc.expected_output}
                                  </pre>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-base-content/80 mb-2">Output</h5>
                                  <pre className={`p-3 rounded text-sm font-mono border ${
                                    tc.status_id === 3 
                                      ? 'bg-success/10 text-success-content border-success/20' 
                                      : 'bg-error/10 text-error-content border-error/20'
                                  }`}>
                                    {tc.stdout}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'result' && (
                <div className="flex-1 p-6 overflow-y-auto bg-base-100">
                  <div className="mb-6">
                    <h1 className={`text-2xl font-bold mb-2 ${
                      submitResult?.accepted ? 'text-success' : submitResult ? 'text-error' : 'text-base-content'
                    }`}>
                      {submitResult?.accepted ? 'Accepted' : submitResult ? 'Wrong Answer' : 'Submission Result'}
                    </h1>
                    
                    {submitResult && (
                      <div className="flex items-center space-x-4 text-sm text-base-content opacity-80">
                        <div>
                          <span className="font-medium">Runtime:</span> <span className="font-mono">{submitResult.runtime} sec</span>
                        </div>
                        <div>
                          <span className="font-medium">Memory:</span> <span className="font-mono">{submitResult.memory} KB</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {submitResult?.complexities && (
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Complexity Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="font-medium text-sm opacity-70">Time Complexity</h4>
                            <div className="font-mono font-bold text-lg">{submitResult.complexities.time}</div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm opacity-70">Space Complexity</h4>
                            <div className="font-mono font-bold text-lg">{submitResult.complexities.space}</div>
                          </div>
                        </div>
                        {submitResult.complexities.explanation && (
                          <div className="mt-4">
                            <h4 className="font-medium text-sm opacity-70 mb-2">Explanation</h4>
                            <div className="text-sm opacity-80">
                              <p>{submitResult.complexities.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {submitResult?.testCases && (
                      <div className="space-y-4">
                        <h3 className="font-bold">Test Case Results</h3>
                        {submitResult.testCases.map((testCase, index) => (
                          <div key={index} className={`p-4 rounded-lg ${
                            testCase.passed ? 'bg-success/10' : 'bg-error/10'
                          }`}>
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Test Case {index + 1}</h4>
                              <span className={`badge ${
                                testCase.passed ? 'badge-success' : 'badge-error'
                              }`}>
                                {testCase.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div>
                                <p className="text-sm opacity-70">Input</p>
                                <pre className="bg-base-300 p-2 rounded text-xs">{testCase.input}</pre>
                              </div>
                              <div>
                                <p className="text-sm opacity-70">Output</p>
                                <pre className="bg-base-300 p-2 rounded text-xs">{testCase.output}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        <div className="tabs tabs-bordered bg-base-200 px-4">
          <button 
            className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
            onClick={() => setActiveRightTab('code')}
          >
            Code
          </button>
          <button className="btn btn-success btn-sm mt-1 ml-132">
            Time Left: {formatTime(timeLeft)}
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-base-300">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {rateLimitMessage && (
                <div className="alert alert-warning mx-4 my-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{rateLimitMessage} (waiting {rateLimitTime}s...)</span>
                </div>
              )}

              <div className="p-4 border-t border-base-300 flex justify-between">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveLeftTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading || rateLimitTime > 0 || !code || timeLeft === 0}
                  >
                    {rateLimitTime > 0 ? `Wait (${rateLimitTime}s)` : 'Run'}
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading || rateLimitTime > 0 || !code || timeLeft === 0}
                  >
                    {rateLimitTime > 0 ? `Wait (${rateLimitTime}s)` : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestEditor;