import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { useSelector } from 'react-redux';


const ProblemPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
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
  let { problemId } = useParams();
  const { handleSubmit } = useForm();
  const [chatMessages, setChatMessages] = useState([
  { text: "Hello! Ask me anything about this problem", sender: "bot" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const [url,seturl]=useState(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchProblem = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      
      const initialCode = response.data.startCode?.find((sc) => {
        if (sc.language === "cpp" && selectedLanguage === 'cpp') return true;
        else if (sc.language === "Java" && selectedLanguage === 'java') return true;
        else if (sc.language === "Javascript" && selectedLanguage === 'javascript') return true;
        return false;
      })?.initialCode || '';

      setProblem(response.data);
      setCode(initialCode);
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  }, [problemId, selectedLanguage]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);
//like data
  useEffect(()=>{
    async function Data(){
    const data =await axiosClient.post('/video/data',{pid:problemId});
    // console.log(data.data);
    setLikeCount(data.data.like.length);
    setViewCount(data.data.view.length);
    const videoData = data.data;
    const userLiked = videoData.like.some(likeId => 
        likeId.toString() === user?._id?.toString()
      );
      setIsLiked(userLiked);
      setComments(data.data.comment)
      setCommentCount(data.data.comment.length)
    
    }
    Data();
  },[])

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find(sc => sc.language === selectedLanguage)?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitTime > 0) {
      const timer = setInterval(() => {
        setRateLimitTime(prev => {
          if (prev <= 1) {
            setRateLimitMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitTime]);

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
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
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
  useEffect(()=>{
    async function getUrls(){
      try{
        const urls = await axiosClient.post('/video/geturl',{problemId});
       seturl(urls.data);
      }catch(err){
        console.log(err);
      }
    }
    getUrls();
  },[])

  const handleSubmitCode = async () => {
    if (!code || rateLimitTime > 0) return;
    
    setLoading(true);
    setSubmitResult(null);
    setRateLimitMessage('');
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setActiveLeftTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      
      if (error.response?.data?.includes('wait')) {
        setRateLimitMessage(error.response.data);
        const waitTime = parseInt(error.response.data.match(/\d+/)?.[0] || '0', 10);
        setRateLimitTime(waitTime);
      } else {
        setSubmitResult({
          accepted: false,
          error: error.response?.data?.error || 'Internal server error'
        });
      }
      setActiveLeftTab('result'); // Fixed typo from 'rusult'
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

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleChatSubmit = async (e) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  // Add user message
  const userMessage = { text: chatInput, sender: "user" };
  setChatMessages(prev => [...prev, userMessage]);
  setChatInput("");
  
  // Add loading indicator
  setChatMessages(prev => [...prev, { text: "", sender: "bot", isLoading: true }]);
  

  try {
 
    const response = await axiosClient.post("/video/videoquery", {
      query: chatInput,
      problemId:problemId,
    });

    const data = response.data;
    
    console.log(data);
    // Remove loading indicator and add bot response
    setChatMessages(prev => [
      ...prev.slice(0, -1), 
      { text: data.content || "I couldn't understand that", sender: "bot" }
    ]);
  } catch (error) {
    setChatMessages(prev => [
      ...prev.slice(0, -1), 
      { text: "Sorry, there was an error processing your request", sender: "bot" }
    ]);
    console.error('Error in chat API:', error);
  } 
};



const handleLike = () => {
  setIsLiked(!isLiked);
  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  // Add API call to update like count in backend
  const like = axiosClient.post('video/like',{pid:problemId,
    userId:user._id,
  });
};

const handleAddComment = async() => {
  if (newComment.trim()) {
    const newCommentObj = {
      userId:user._id,
      pid:problemId,
      user: user.firstName, // Replace with actual user
      text: newComment,
      timestamp: new Date().toLocaleString(),
      avatar: user.firstName[0] // Replace with actual avatar
    };
    console.log(newCommentObj)
    setComments([...comments, newCommentObj]);
    setCommentCount(commentCount + 1);
    setNewComment('');
    const data =await axiosClient.post('/video/comment',newCommentObj);
  }
};

// Initialize view count (call this in useEffect when component mounts)
const initViewCount = () => {
  setViewCount(prev => prev + 1);
  // Add API call to update view count in backend
};

  return (
    <div className="h-screen flex bg-base-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAi', 'result', 'testcase'].map((tab) => (
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

              {/* {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {'Editorial is here for the problem'}
                  </div>
                </div>
              )} */}
              {activeLeftTab === 'editorial' && (
  <div className="prose max-w-none">
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      <button 
        className="ml-5 btn btn-secondary mt-5 mb-5 w-50"
        onClick={() => document.getElementById('chat_modal').showModal()}
      >
        Ask Me About Video
      </button>
      
      <dialog id="chat_modal" className="modal">
        <div className="modal-box w-11/12 max-w-5xl h-[80vh] max-h-[800px] flex flex-col">
          <h2 className="font-bold text-2xl text-blue-600 ml-2">VIDEO HELP ??</h2>
          
          {/* Chat messages container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4" ref={chatMessagesEndRef}>
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'}`}>
                <div className={`chat-bubble ${msg.isLoading ? 'flex items-center gap-2' : ''}`}>
                  {msg.text}
                  {msg.isLoading && (
                    <span className="loading loading-dots loading-xs"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <div className="sticky bottom-0 pt-4 bg-base-100">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..." 
                className="input input-bordered flex-1" 
                disabled={isChatLoading}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isChatLoading}
              >
                {isChatLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : 'Send'}
              </button>
            </form>
          </div>
          
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        
        {/* Clicking outside closes the modal */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
    
    <div>
      {url ? (
        <div className="space-y-4">
          <Editorial 
            secureUrl={url.secureUrl} 
            thumbnailUrl={url.thumbnailUrl} 
            duration={url.duration}
            problemId={problemId}
            userId={user._id}
          />
          
          {/* Engagement Metrics Section */}
          <div className="flex items-center gap-6 px-5 py-3 border-t border-b border-gray-200 dark:border-gray-700">
            {/* Likes */}
            <button 
              className="flex items-center gap-2 hover:text-primary"
              onClick={handleLike}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount} Likes</span>
            </button>
            
            {/* Comments */}
            <button 
              className="flex items-center gap-2 hover:text-primary"
              onClick={() => setShowComments(!showComments)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{commentCount} Comments</span>
            </button>
            
            {/* Views */}
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewCount} Views</span>
            </div>
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <div className="px-5 py-3 space-y-4">
              <h3 className="font-semibold text-lg">Comments</h3>
              
              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input input-bordered flex-1"
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
              
              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="avatar">
                      <div className="w-8 h-8 mt-2 rounded-full">
                        <img src="data:image/png;base64,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" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{comment.user?.name || user.firstName || "User"}</div>
                      <div className="text-sm">{comment.text}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.timestamp || comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <h1 className='text-2xl text-red-500 ml-12'>Currently No Video Available</h1>
      )}
    </div>
  </div>
)}
              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.length > 0 ? (
                      problem.referenceSolution.map((solution, index) => (
                        <div key={index} className="border border-base-300 rounded-lg">
                          <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                            <h3 className="font-semibold">{problem.title} - {solution.language}</h3>
                          </div>
                          <div className="p-4">
                            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                              <code>{solution.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Solutions will be available after you solve the problem.</p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <SubmissionHistory problemId={problemId} />
                </div>
              )}

              {activeLeftTab === 'chatAi' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">ChatAI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem} />
                  </div>
                </div>
              )}

  

{activeLeftTab === 'testcase' && (
  <div className="flex-1 p-6 overflow-y-auto bg-base-100">
    {/* Header Section */}
    <div className="mb-6">
      <div className={`flex items-center gap-3 mb-3 ${
        runResult?.success ? 'text-success' : runResult ? 'text-error' : 'text-base-content'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          runResult?.success ? 'bg-success/20' : runResult ? 'bg-error/20' : 'bg-base-200'
        }`}>
          {runResult?.success ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : runResult ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold">
          {runResult?.success ? 'Accepted' : runResult ? 'Wrong Answer' : 'Test Results'}
        </h1>
      </div>
      
      {runResult && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content opacity-80">
          <div className="flex items-center gap-1 bg-base-200 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Runtime:</span> 
            <span className="font-mono">{runResult.runtime} sec</span>
          </div>
          <div className="flex items-center gap-1 bg-base-200 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
            <span className="font-medium">Memory:</span> 
            <span className="font-mono">{runResult.memory} KB</span>
          </div>
        </div>
      )}
    </div>

    {/* Test Cases Section */}
    {runResult?.testCases?.length > 0 && (
      <div className="space-y-6">
        {/* Test Case Badges */}
        <div className="bg-base-200 p-4 rounded-lg border border-base-300">
          <h4 className="font-medium text-base-content mb-3">Test Case Summary</h4>
          <div className="flex flex-wrap gap-2">
            {runResult.testCases.map((tc, i) => (
              <div 
                key={i} 
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                  tc.status_id === 3 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-error/10 text-error border border-error/20'
                }`}
              >
                {tc.status_id === 3 ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                Case {i+1}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Test Cases */}
        {runResult.testCases.map((tc, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-lg border ${
              tc.status_id === 3 
                ? 'border-success/20 bg-success/5' 
                : 'border-error/20 bg-error/5'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-lg flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  tc.status_id === 3 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}>
                  {tc.status_id === 3 ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                Test Case {i+1}
              </h4>
              <span className={`badge ${
                tc.status_id === 3 ? 'badge-success' : 'badge-error'
              }`}>
                {tc.status_id === 3 ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-base-content/80 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  Input
                </h5>
                <pre className="bg-base-200 p-3 rounded text-sm font-mono text-base-content border border-base-300 whitespace-pre-wrap">
                  {tc.stdin || <span className="opacity-50">No input</span>}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-base-content/80 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Expected Output
                  </h5>
                  <pre className="bg-base-200 p-3 rounded text-sm font-mono text-base-content border border-base-300 whitespace-pre-wrap">
                    {tc.expected_output}
                  </pre>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-base-content/80 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Your Output
                  </h5>
                  <pre className={`p-3 rounded text-sm font-mono whitespace-pre-wrap border ${
                    tc.status_id === 3 
                      ? 'bg-success/10 text-success-content border-success/20' 
                      : 'bg-error/10 text-error-content border-error/20'
                  }`}>
                    {tc.stdout || <span className="opacity-50">No output</span>}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{activeLeftTab === 'result' && (
  <div className="flex-1 p-6 overflow-y-auto bg-base-100">
    {/* Header Section with Celebration Effects */}
    {submitResult?.accepted && (
      <div className="absolute top-0 left-0 w-full h-1 bg-success animate-[rainbow_2s_linear_infinite]"></div>
    )}
    
    <div className="mb-6 relative">
      <div className={`flex items-center gap-3 mb-3 ${
        submitResult?.accepted ? 'text-success' : submitResult ? 'text-error' : 'text-base-content'
      }`}>
        <div className={`relative ${submitResult?.accepted ? 'animate-bounce' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            submitResult?.accepted ? 'bg-success/20 shadow-lg shadow-success/30' : 
            submitResult ? 'bg-error/20' : 'bg-base-200'
          }`}>
            {submitResult?.accepted ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div className="absolute -inset-1 rounded-full border-2 border-success/50 animate-ping opacity-75"></div>
              </>
            ) : submitResult ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold">
          {submitResult?.accepted ? (
            <span className="relative">
              Accepted! 🎉
              <span className="absolute -top-2 -right-4 text-xs">✨</span>
            </span>
          ) : submitResult ? 'Wrong Answer' : 'Submission Result'}
        </h1>
      </div>
      
      {submitResult && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content opacity-80">
          <div className="flex items-center gap-1 bg-base-200 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Runtime:</span> 
            <span className="font-mono">{submitResult.runtime} sec</span>
          </div>
          <div className="flex items-center gap-1 bg-base-200 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
            <span className="font-medium">Memory:</span> 
            <span className="font-mono">{submitResult.memory} KB</span>
          </div>
        </div>
      )}
    </div>

    {/* Main Content */}
    <div className="space-y-6">
      {/* Complexity Analysis */}
      {submitResult?.complexities && (
        <div className="bg-base-200 p-5 rounded-lg border border-base-300 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 bg-info/10 rounded-full">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Complexity Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <div className="bg-base-100 p-4 rounded-lg border border-base-300 hover:shadow transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-warning/10 rounded-full">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-sm opacity-80">Time Complexity</h4>
              </div>
              <div className="font-mono font-bold text-lg bg-base-200 px-3 py-2 rounded hover:bg-base-300 transition-colors">
                {submitResult.complexities.time}
              </div>
            </div>
            
            <div className="bg-base-100 p-4 rounded-lg border border-base-300 hover:shadow transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-warning/10 rounded-full">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                </div>
                <h4 className="font-medium text-sm opacity-80">Space Complexity</h4>
              </div>
              <div className="font-mono font-bold text-lg bg-base-200 px-3 py-2 rounded hover:bg-base-300 transition-colors">
                {submitResult.complexities.space}
              </div>
            </div>
          </div>
          
          {submitResult.complexities.explanation && (
            <div className="mt-4 bg-base-100 p-4 rounded-lg border border-base-300 hover:shadow transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-info/10 rounded-full">
                  <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-sm opacity-80">Explanation</h4>
              </div>
              <div className="text-sm opacity-90">
                <p>{submitResult.complexities.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Case Results Section */}
      {submitResult?.testCases && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 bg-base-300 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Test Case Results</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {submitResult.testCases.map((testCase, index) => (
              <div key={index} className={`p-5 rounded-lg border transition-all ${
                testCase.passed ? 
                  'border-success/30 bg-success/5 hover:bg-success/10' : 
                  'border-error/30 bg-error/5 hover:bg-error/10'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`relative ${testCase.passed && submitResult?.accepted ? 'animate-pulse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        testCase.passed ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                      }`}>
                        {testCase.passed ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      {testCase.passed && submitResult?.accepted && (
                        <div className="absolute -inset-0.5 rounded-full bg-success/20 animate-ping"></div>
                      )}
                    </div>
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                  </div>
                  <span className={`badge ${testCase.passed ? 'badge-success' : 'badge-error'}`}>
                    {testCase.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                      <p className="text-sm opacity-70">Input</p>
                    </div>
                    <pre className="bg-base-200 p-3 rounded text-xs font-mono whitespace-pre-wrap hover:bg-base-300 transition-colors">
                      {testCase.input}
                    </pre>
                  </div>
                  <div className="hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm opacity-70">Output</p>
                    </div>
                    <pre className="bg-base-200 p-3 rounded text-xs font-mono whitespace-pre-wrap hover:bg-base-300 transition-colors">
                      {testCase.output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebration Confetti for Accepted Solutions */}
      {submitResult?.accepted && (
        <>
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: 0.7
                }}
              ></div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button 
              className="btn btn-success btn-outline animate-pulse"
              onClick={() => {
                // Add any celebration action here
              }}
            >
              🎉 Great Job! Share Your Success 🎉
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

              {rateLimitMessage && (
                <div className="alert alert-warning mx-4 my-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{rateLimitMessage} (waiting {rateLimitTime}s...)</span>
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
                    disabled={loading || rateLimitTime > 0 || !code}
                  >
                    {rateLimitTime > 0 ? `Wait (${rateLimitTime}s)` : 'Run'}
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading || rateLimitTime > 0 || !code}
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

export default ProblemPage;